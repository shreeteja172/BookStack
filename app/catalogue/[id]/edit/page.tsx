import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { EditBookForm } from "@/components/book-form";
import { CopyManager, DeleteBookForm } from "@/components/copy-manager";
import { ArrowLeftIcon } from "@/components/icons";
import { requireLibrarian } from "@/lib/session";
import { getBook, getCategories } from "@/lib/library";

export const metadata: Metadata = {
  title: "Edit book · BookStack",
};

export default async function EditBookPage({ params }: PageProps<"/catalogue/[id]/edit">) {
  const user = await requireLibrarian();
  const { id } = await params;

  const [book, categories] = await Promise.all([getBook(id), getCategories()]);

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian />

      <main className="mx-auto max-w-4xl px-6 py-10 lg:px-12">
        <Link
          href={`/catalogue/${book.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-ember"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to book
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Edit {book.title}</h1>

        <div className="mt-8 space-y-8">
          <EditBookForm
            values={{
              id: book.id,
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              publisher: book.publisher,
              category: book.category,
              publishedYear: book.publishedYear,
              description: book.description,
            }}
            categories={categories}
          />

          <CopyManager
            bookId={book.id}
            copies={book.copies.map((copy) => ({
              id: copy.id,
              barcode: copy.barcode,
              floor: copy.floor,
              shelf: copy.shelf,
              row: copy.row,
              status: copy.status,
            }))}
          />

          <DeleteBookForm bookId={book.id} title={book.title} />
        </div>
      </main>
    </div>
  );
}
