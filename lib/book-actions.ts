"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireLibrarian, requireUser } from "./session";
import type { ActionState } from "./action-state";

function fail(message: string): ActionState {
  return { ok: false, message };
}

function done(message: string): ActionState {
  return { ok: true, message };
}

type BookFields = {
  title: string;
  author: string;
  isbn: string;
  publisher: string | null;
  category: string;
  publishedYear: number | null;
  description: string | null;
};

function readBookFields(formData: FormData): BookFields | string {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const publisher = String(formData.get("publisher") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const yearRaw = String(formData.get("publishedYear") ?? "").trim();

  if (!title || !author || !isbn || !category) {
    return "Title, author, ISBN and category are all required.";
  }

  let publishedYear: number | null = null;

  if (yearRaw) {
    const parsed = Number(yearRaw);

    if (!Number.isInteger(parsed) || parsed < 1000 || parsed > 2200) {
      return "Published year must be a whole number between 1000 and 2200.";
    }

    publishedYear = parsed;
  }

  return {
    title,
    author,
    isbn,
    category,
    publisher: publisher || null,
    description: description || null,
    publishedYear,
  };
}

async function generateBarcode(isbn: string) {
  const prefix = `BK-${isbn.replace(/\D/g, "").slice(-4).padStart(4, "0")}`;

  for (let n = 1; n < 500; n += 1) {
    const candidate = `${prefix}-${n}`;
    const clash = await prisma.bookCopy.findUnique({ where: { barcode: candidate } });

    if (!clash) {
      return candidate;
    }
  }

  return `${prefix}-${Date.now()}`;
}

export async function createBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireLibrarian();

  const fields = readBookFields(formData);

  if (typeof fields === "string") {
    return fail(fields);
  }

  const existing = await prisma.book.findUnique({ where: { isbn: fields.isbn } });

  if (existing) {
    return fail(`ISBN ${fields.isbn} is already in the catalogue.`);
  }

  const copies = Number(formData.get("copies") ?? 1);
  const floor = String(formData.get("floor") ?? "1").trim() || "1";
  const shelf = String(formData.get("shelf") ?? "A").trim().toUpperCase() || "A";
  const row = String(formData.get("row") ?? "1").trim() || "1";

  if (!Number.isInteger(copies) || copies < 1 || copies > 50) {
    return fail("Number of copies must be between 1 and 50.");
  }

  const book = await prisma.book.create({ data: fields });

  for (let index = 0; index < copies; index += 1) {
    await prisma.bookCopy.create({
      data: {
        bookId: book.id,
        barcode: await generateBarcode(fields.isbn),
        floor,
        shelf,
        row,
        status: "available",
      },
    });
  }

  revalidatePath("/catalogue");
  redirect(`/catalogue/${book.id}`);
}

export async function updateBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireLibrarian();

  const bookId = String(formData.get("bookId") ?? "");
  const fields = readBookFields(formData);

  if (typeof fields === "string") {
    return fail(fields);
  }

  const clash = await prisma.book.findUnique({ where: { isbn: fields.isbn } });

  if (clash && clash.id !== bookId) {
    return fail(`ISBN ${fields.isbn} belongs to "${clash.title}".`);
  }

  await prisma.book.update({ where: { id: bookId }, data: fields });

  revalidatePath("/catalogue");
  revalidatePath(`/catalogue/${bookId}`);
  revalidatePath(`/catalogue/${bookId}/edit`);

  return done("Book details saved.");
}

export async function deleteBook(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireLibrarian();

  const bookId = String(formData.get("bookId") ?? "");

  const activeLoans = await prisma.loan.count({
    where: { returnedAt: null, copy: { bookId } },
  });

  if (activeLoans > 0) {
    return fail(
      `${activeLoans} copy(ies) are still on loan. Take them back before removing this book.`,
    );
  }

  await prisma.book.delete({ where: { id: bookId } });

  revalidatePath("/catalogue");
  redirect("/catalogue");
}

export async function addCopy(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLibrarian();

  const bookId = String(formData.get("bookId") ?? "");
  const floor = String(formData.get("floor") ?? "").trim();
  const shelf = String(formData.get("shelf") ?? "").trim().toUpperCase();
  const row = String(formData.get("row") ?? "").trim();

  if (!floor || !shelf || !row) {
    return fail("Floor, shelf and row are required.");
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });

  if (!book) {
    return fail("Book not found.");
  }

  const barcode = await generateBarcode(book.isbn);

  await prisma.bookCopy.create({
    data: { bookId, barcode, floor, shelf, row, status: "available" },
  });

  revalidatePath(`/catalogue/${bookId}`);
  revalidatePath(`/catalogue/${bookId}/edit`);

  return done(`Added copy ${barcode}.`);
}

export async function removeCopy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireLibrarian();

  const copyId = String(formData.get("copyId") ?? "");

  const copy = await prisma.bookCopy.findUnique({ where: { id: copyId } });

  if (!copy) {
    return fail("Copy not found.");
  }

  if (copy.status === "on_loan") {
    return fail(`Copy ${copy.barcode} is on loan and cannot be removed.`);
  }

  await prisma.bookCopy.delete({ where: { id: copyId } });

  revalidatePath(`/catalogue/${copy.bookId}`);
  revalidatePath(`/catalogue/${copy.bookId}/edit`);

  return done(`Removed copy ${copy.barcode}.`);
}

export async function saveReview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const bookId = String(formData.get("bookId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail("Choose a rating between 1 and 5 stars.");
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });

  if (!book) {
    return fail("Book not found.");
  }

  await prisma.review.upsert({
    where: { bookId_userId: { bookId, userId: user.id } },
    update: { rating, body: body || null },
    create: { bookId, userId: user.id, rating, body: body || null },
  });

  revalidatePath(`/catalogue/${bookId}`);
  revalidatePath("/catalogue");

  return done("Thanks, your review is saved.");
}
