"use server";

import { requireLibrarian } from "./session";

export type IsbnDetails = {
  title: string;
  author: string;
  publisher: string;
  publishedYear: string;
  description: string;
  category: string;
};

type GoogleVolume = {
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    categories?: string[];
  };
};

type OpenLibraryBook = {
  title?: string;
  authors?: { name: string }[];
  publishers?: { name: string }[];
  publish_date?: string;
  subjects?: { name: string }[];
};

function yearFrom(value?: string) {
  return value?.match(/\d{4}/)?.[0] ?? "";
}

async function fromGoogle(isbn: string): Promise<IsbnDetails | null> {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, {
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { items?: GoogleVolume[] };
  const info = data.items?.[0]?.volumeInfo;

  if (!info?.title) {
    return null;
  }

  return {
    title: info.subtitle ? `${info.title}: ${info.subtitle}` : info.title,
    author: info.authors?.join(", ") ?? "",
    publisher: info.publisher ?? "",
    publishedYear: yearFrom(info.publishedDate),
    description: info.description?.replace(/<[^>]+>/g, "") ?? "",
    category: info.categories?.[0]?.split("/")[0]?.trim() ?? "",
  };
}

type OpenLibrarySearch = {
  docs?: {
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    subject?: string[];
  }[];
};

async function getJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  return response.ok ? ((await response.json()) as T) : null;
}

async function fromOpenLibrary(isbn: string): Promise<IsbnDetails | null> {
  const key = `ISBN:${isbn}`;
  const [editions, search] = await Promise.all([
    getJson<Record<string, OpenLibraryBook>>(
      `https://openlibrary.org/api/books?bibkeys=${key}&format=json&jscmd=data`,
    ),
    getJson<OpenLibrarySearch>(
      `https://openlibrary.org/search.json?isbn=${isbn}&fields=key,title,author_name,first_publish_year,subject&limit=1`,
    ),
  ]);

  const book = editions?.[key];
  const work = search?.docs?.[0];
  const title = book?.title ?? work?.title;

  if (!title) {
    return null;
  }

  const workRecord = work?.key
    ? await getJson<{ description?: string | { value: string } }>(
        `https://openlibrary.org${work.key}.json`,
      ).catch(() => null)
    : null;
  const description =
    typeof workRecord?.description === "string"
      ? workRecord.description
      : (workRecord?.description?.value ?? "");

  return {
    title,
    author:
      book?.authors?.map((author) => author.name).join(", ") || work?.author_name?.join(", ") || "",
    publisher: book?.publishers?.[0]?.name ?? "",
    publishedYear: yearFrom(book?.publish_date) || String(work?.first_publish_year ?? ""),
    description: description.split(/\r?\n\r?\n/)[0] ?? "",
    category: work?.subject?.[0] ?? book?.subjects?.[0]?.name ?? "",
  };
}

export async function lookupIsbn(
  raw: string,
): Promise<{ ok: true; details: IsbnDetails } | { ok: false; message: string }> {
  await requireLibrarian();

  const isbn = raw.replace(/[^0-9Xx]/g, "");

  if (isbn.length !== 10 && isbn.length !== 13) {
    return { ok: false, message: "An ISBN has 10 or 13 digits." };
  }

  for (const source of [fromOpenLibrary, fromGoogle]) {
    try {
      const details = await source(isbn);

      if (details) {
        return { ok: true, details };
      }
    } catch {
      continue;
    }
  }

  return { ok: false, message: "No public record found for that ISBN. Fill the details in by hand." };
}
