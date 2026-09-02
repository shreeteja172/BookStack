import "server-only";

import { prisma } from "./prisma";

export const LOAN_DAYS = 14;
export const FINE_PER_DAY_PAISE = 500;
export const MAX_ACTIVE_LOANS = 3;
export const MAX_RENEWALS = 2;
export const FINE_BORROW_BLOCK_PAISE = 5000;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function daysUntil(due: Date, from: Date = new Date()) {
  return Math.round((startOfDay(due).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

export function overdueDays(due: Date, at: Date = new Date()) {
  return Math.max(0, -daysUntil(due, at));
}

export function fineForPaise(due: Date, at: Date = new Date()) {
  return overdueDays(due, at) * FINE_PER_DAY_PAISE;
}

export function formatRupees(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function dueDateFrom(issuedAt: Date = new Date()) {
  return new Date(issuedAt.getTime() + LOAN_DAYS * MS_PER_DAY);
}

export type BookSearchParams = {
  query?: string;
  category?: string;
  availableOnly?: boolean;
};

export async function searchBooks({ query, category, availableOnly }: BookSearchParams) {
  const trimmed = query?.trim();

  const books = await prisma.book.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(availableOnly ? { copies: { some: { status: "available" } } } : {}),
      ...(trimmed
        ? {
            OR: [
              { title: { contains: trimmed, mode: "insensitive" as const } },
              { author: { contains: trimmed, mode: "insensitive" as const } },
              { isbn: { contains: trimmed } },
              { category: { contains: trimmed, mode: "insensitive" as const } },
              { description: { contains: trimmed, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      copies: { select: { id: true, status: true } },
      _count: { select: { reservations: { where: { status: "waiting" } } } },
    },
    orderBy: { title: "asc" },
  });

  return books.map((book) => {
    const available = book.copies.filter((copy) => copy.status === "available").length;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publishedYear: book.publishedYear,
      description: book.description,
      totalCopies: book.copies.length,
      availableCopies: available,
      waiting: book._count.reservations,
    };
  });
}

export async function getCategories() {
  const rows = await prisma.book.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return rows.map((row) => row.category);
}

export async function getBook(id: string) {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      copies: { orderBy: { barcode: "asc" } },
      reservations: {
        where: { status: { in: ["waiting", "ready"] } },
        orderBy: { createdAt: "asc" },
        select: { id: true, userId: true, status: true, createdAt: true },
      },
    },
  });

  if (!book) {
    return null;
  }

  const availableCopies = book.copies.filter((copy) => copy.status === "available");

  return {
    ...book,
    availableCopies,
    availableCount: availableCopies.length,
  };
}

export async function getRelatedBooks(bookId: string, category: string, limit = 4) {
  const books = await prisma.book.findMany({
    where: { category, id: { not: bookId } },
    include: { copies: { select: { status: true } } },
    take: limit,
    orderBy: { title: "asc" },
  });

  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    availableCopies: book.copies.filter((copy) => copy.status === "available").length,
  }));
}

export async function getMemberLoans(userId: string) {
  const loans = await prisma.loan.findMany({
    where: { userId },
    include: { copy: { include: { book: true } } },
    orderBy: [{ returnedAt: "asc" }, { dueAt: "asc" }],
  });

  const active = loans.filter((loan) => loan.returnedAt === null);
  const history = loans.filter((loan) => loan.returnedAt !== null);

  return { active, history };
}

export async function getMemberReservations(userId: string) {
  const reservations = await prisma.reservation.findMany({
    where: { userId, status: { in: ["waiting", "ready"] } },
    include: { book: true },
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    reservations.map(async (reservation) => {
      const ahead = await prisma.reservation.count({
        where: {
          bookId: reservation.bookId,
          status: "waiting",
          createdAt: { lt: reservation.createdAt },
        },
      });

      return { ...reservation, position: ahead + 1 };
    }),
  );
}

export async function getMemberStats(userId: string) {
  const [completed, active, reservations, fineRows] = await Promise.all([
    prisma.loan.count({ where: { userId, returnedAt: { not: null } } }),
    prisma.loan.findMany({ where: { userId, returnedAt: null }, select: { dueAt: true } }),
    prisma.reservation.count({ where: { userId, status: { in: ["waiting", "ready"] } } }),
    prisma.loan.aggregate({ where: { userId }, _sum: { fineCents: true } }),
  ]);

  const now = new Date();
  const outstandingFine = active.reduce((sum, loan) => sum + fineForPaise(loan.dueAt, now), 0);

  return {
    completed,
    activeCount: active.length,
    reservations,
    overdueCount: active.filter((loan) => overdueDays(loan.dueAt, now) > 0).length,
    paidFinePaise: fineRows._sum.fineCents ?? 0,
    outstandingFinePaise: outstandingFine,
  };
}

export async function getLibraryStats() {
  const [books, copies, onLoan, members, waiting, overdueLoans] = await Promise.all([
    prisma.book.count(),
    prisma.bookCopy.count(),
    prisma.bookCopy.count({ where: { status: "on_loan" } }),
    prisma.user.count(),
    prisma.reservation.count({ where: { status: "waiting" } }),
    prisma.loan.count({ where: { returnedAt: null, dueAt: { lt: new Date() } } }),
  ]);

  return { books, copies, onLoan, members, waiting, overdueLoans };
}

export async function getActiveLoansForLibrarian() {
  return prisma.loan.findMany({
    where: { returnedAt: null },
    include: {
      copy: { include: { book: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { dueAt: "asc" },
  });
}

export async function getMembers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { loans: { where: { returnedAt: null } } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPublicStats() {
  const [books, copies, onLoan, members] = await Promise.all([
    prisma.book.count(),
    prisma.bookCopy.count(),
    prisma.bookCopy.count({ where: { status: "on_loan" } }),
    prisma.user.count(),
  ]);

  return { books, copies, onLoan, members };
}

export async function getRecentActivity(limit = 3) {
  const loans = await prisma.loan.findMany({
    include: { copy: { include: { book: { select: { title: true } } } } },
    orderBy: { issuedAt: "desc" },
    take: limit,
  });

  return loans.map((loan) => ({
    id: loan.id,
    title: loan.copy.book.title,
    state: loan.returnedAt ? "Returned" : "Checked out",
  }));
}
