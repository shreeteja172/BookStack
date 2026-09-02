"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireLibrarian, requireUser } from "./session";
import type { ActionState } from "./action-state";
import {
  FINE_BORROW_BLOCK_PAISE,
  LOAN_DAYS,
  MAX_ACTIVE_LOANS,
  MAX_RENEWALS,
  dueDateFrom,
  fineForPaise,
  formatRupees,
  overdueDays,
} from "./library";

function fail(message: string): ActionState {
  return { ok: false, message };
}

function done(message: string): ActionState {
  return { ok: true, message };
}

export async function reserveBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const bookId = String(formData.get("bookId") ?? "");

  if (!bookId) {
    return fail("Missing book.");
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { copies: { select: { status: true } } },
  });

  if (!book) {
    return fail("That book is no longer in the catalogue.");
  }

  if (book.copies.some((copy) => copy.status === "available")) {
    return fail("A copy is available right now. Borrow it instead of queueing.");
  }

  const existing = await prisma.reservation.findUnique({
    where: { bookId_userId: { bookId, userId: user.id } },
  });

  if (existing) {
    return fail("You are already in the queue for this book.");
  }

  await prisma.reservation.create({
    data: { bookId, userId: user.id, status: "waiting" },
  });

  const ahead = await prisma.reservation.count({
    where: { bookId, status: "waiting" },
  });

  revalidatePath(`/catalogue/${bookId}`);
  revalidatePath("/dashboard");

  return done(`Reserved. You are number ${ahead} in the queue.`);
}

export async function cancelReservation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const reservationId = String(formData.get("reservationId") ?? "");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation || reservation.userId !== user.id) {
    return fail("Reservation not found.");
  }

  await prisma.reservation.delete({ where: { id: reservationId } });

  revalidatePath(`/catalogue/${reservation.bookId}`);
  revalidatePath("/dashboard");

  return done("Reservation cancelled.");
}

export async function issueBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireLibrarian();

  const barcode = String(formData.get("barcode") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!barcode || !email) {
    return fail("Both a copy barcode and a member email are required.");
  }

  const [copy, member] = await Promise.all([
    prisma.bookCopy.findUnique({ where: { barcode }, include: { book: true } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (!copy) {
    return fail(`No copy with barcode ${barcode}.`);
  }

  if (!member) {
    return fail(`No member with email ${email}.`);
  }

  const heldForMember = await prisma.reservation.findFirst({
    where: { bookId: copy.bookId, userId: member.id, status: "ready" },
  });

  if (copy.status === "on_loan") {
    return fail(`Copy ${barcode} is already on loan.`);
  }

  if (copy.status === "reserved" && !heldForMember) {
    return fail(`Copy ${barcode} is being held for another member in the queue.`);
  }

  const activeLoans = await prisma.loan.count({
    where: { userId: member.id, returnedAt: null },
  });

  if (activeLoans >= MAX_ACTIVE_LOANS) {
    return fail(`${member.name} already has ${MAX_ACTIVE_LOANS} books out.`);
  }

  const dueAt = dueDateFrom();

  await prisma.$transaction([
    prisma.loan.create({
      data: { copyId: copy.id, userId: member.id, dueAt },
    }),
    prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: "on_loan" },
    }),
    prisma.reservation.deleteMany({
      where: { bookId: copy.bookId, userId: member.id },
    }),
  ]);

  revalidatePath("/circulation");
  revalidatePath("/dashboard");
  revalidatePath(`/catalogue/${copy.bookId}`);

  return done(
    `Issued "${copy.book.title}" to ${member.name}. Due ${dueAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}.`,
  );
}

export async function returnBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireLibrarian();

  const barcode = String(formData.get("barcode") ?? "").trim();

  if (!barcode) {
    return fail("A copy barcode is required.");
  }

  const copy = await prisma.bookCopy.findUnique({
    where: { barcode },
    include: { book: true },
  });

  if (!copy) {
    return fail(`No copy with barcode ${barcode}.`);
  }

  const loan = await prisma.loan.findFirst({
    where: { copyId: copy.id, returnedAt: null },
    include: { user: true },
    orderBy: { issuedAt: "desc" },
  });

  if (!loan) {
    return fail(`Copy ${barcode} is not on loan.`);
  }

  const returnedAt = new Date();
  const finePaise = fineForPaise(loan.dueAt, returnedAt);
  const late = overdueDays(loan.dueAt, returnedAt);

  const nextInQueue = await prisma.reservation.findFirst({
    where: { bookId: copy.bookId, status: "waiting" },
    orderBy: { createdAt: "asc" },
  });

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: loan.id },
      data: { returnedAt, fineCents: finePaise },
    }),
    prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: nextInQueue ? "reserved" : "available" },
    }),
    ...(nextInQueue
      ? [
          prisma.reservation.update({
            where: { id: nextInQueue.id },
            data: { status: "ready", readyAt: returnedAt },
          }),
        ]
      : []),
  ]);

  revalidatePath("/circulation");
  revalidatePath("/dashboard");
  revalidatePath(`/catalogue/${copy.bookId}`);

  const fineNote = late > 0 ? ` ${late} day(s) late, fine ${formatRupees(finePaise)}.` : "";
  const queueNote = nextInQueue ? " Held for the next member in the queue." : "";

  return done(`Returned "${copy.book.title}" from ${loan.user.name}.${fineNote}${queueNote}`);
}

export async function setMemberRole(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireLibrarian();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (role !== "member" && role !== "librarian") {
    return fail("Unknown role.");
  }

  if (userId === actor.id) {
    return fail("You cannot change your own role.");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { name: true },
  });

  revalidatePath("/members");

  return done(`${updated.name} is now a ${role}.`);
}

export async function borrowBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const bookId = String(formData.get("bookId") ?? "");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { copies: true },
  });

  if (!book) {
    return fail("That book is no longer in the catalogue.");
  }

  const activeLoans = await prisma.loan.findMany({
    where: { userId: user.id, returnedAt: null },
    include: { copy: true },
  });

  if (activeLoans.some((loan) => loan.copy.bookId === bookId)) {
    return fail("You already have a copy of this book.");
  }

  if (activeLoans.length >= MAX_ACTIVE_LOANS) {
    return fail(
      `You already have ${MAX_ACTIVE_LOANS} books out. Return one before borrowing another.`,
    );
  }

  const outstanding = activeLoans.reduce(
    (sum, loan) => sum + fineForPaise(loan.dueAt),
    0,
  );

  if (outstanding >= FINE_BORROW_BLOCK_PAISE) {
    return fail(
      `You owe ${formatRupees(outstanding)} in late fees. Settle up before borrowing again.`,
    );
  }

  const myHold = await prisma.reservation.findFirst({
    where: { bookId, userId: user.id, status: "ready" },
  });

  const copy = myHold
    ? book.copies.find((item) => item.status === "reserved") ??
      book.copies.find((item) => item.status === "available")
    : book.copies.find((item) => item.status === "available");

  if (!copy) {
    return fail("Every copy is out right now. Join the queue instead.");
  }

  const dueAt = dueDateFrom();

  await prisma.$transaction([
    prisma.loan.create({ data: { copyId: copy.id, userId: user.id, dueAt } }),
    prisma.bookCopy.update({ where: { id: copy.id }, data: { status: "on_loan" } }),
    prisma.reservation.deleteMany({ where: { bookId, userId: user.id } }),
  ]);

  revalidatePath(`/catalogue/${bookId}`);
  revalidatePath("/catalogue");
  revalidatePath("/dashboard");

  return done(
    `Borrowed. Copy ${copy.barcode} is yours until ${dueAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}. Collect it from Floor ${copy.floor}, Shelf ${copy.shelf}, Row ${copy.row}.`,
  );
}

export async function returnOwnBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const loanId = String(formData.get("loanId") ?? "");

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { copy: { include: { book: true } } },
  });

  if (!loan || loan.userId !== user.id) {
    return fail("Loan not found.");
  }

  if (loan.returnedAt) {
    return fail("That book is already back.");
  }

  const returnedAt = new Date();
  const finePaise = fineForPaise(loan.dueAt, returnedAt);
  const late = overdueDays(loan.dueAt, returnedAt);

  const nextInQueue = await prisma.reservation.findFirst({
    where: { bookId: loan.copy.bookId, status: "waiting" },
    orderBy: { createdAt: "asc" },
  });

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: loan.id },
      data: { returnedAt, fineCents: finePaise },
    }),
    prisma.bookCopy.update({
      where: { id: loan.copyId },
      data: { status: nextInQueue ? "reserved" : "available" },
    }),
    ...(nextInQueue
      ? [
          prisma.reservation.update({
            where: { id: nextInQueue.id },
            data: { status: "ready", readyAt: returnedAt },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/catalogue/${loan.copy.bookId}`);
  revalidatePath("/catalogue");
  revalidatePath("/dashboard");

  const fineNote =
    late > 0 ? ` It was ${late} day(s) late, so a fine of ${formatRupees(finePaise)} was recorded.` : "";

  return done(`Returned "${loan.copy.book.title}".${fineNote}`);
}

export async function renewLoan(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const loanId = String(formData.get("loanId") ?? "");

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { copy: true },
  });

  if (!loan || loan.userId !== user.id || loan.returnedAt) {
    return fail("Loan not found.");
  }

  if (loan.renewals >= MAX_RENEWALS) {
    return fail(`You have already renewed this ${MAX_RENEWALS} times. Bring it back.`);
  }

  const waiting = await prisma.reservation.count({
    where: { bookId: loan.copy.bookId, status: { in: ["waiting", "ready"] } },
  });

  if (waiting > 0) {
    return fail("Someone is waiting for this book, so it cannot be renewed.");
  }

  if (overdueDays(loan.dueAt) > 0) {
    return fail("This loan is already overdue. Return it and settle the fine first.");
  }

  const dueAt = new Date(loan.dueAt.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.loan.update({
    where: { id: loan.id },
    data: { dueAt, renewals: { increment: 1 } },
  });

  revalidatePath("/dashboard");

  return done(
    `Renewed until ${dueAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}.`,
  );
}
