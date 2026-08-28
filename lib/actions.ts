"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireLibrarian, requireUser } from "./session";
import type { ActionState } from "./action-state";
import {
  MAX_ACTIVE_LOANS,
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
    return fail("A copy is on the shelf right now. Collect it at the issue desk.");
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
