import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { NewBookForm } from "@/components/book-form";
import { ArrowLeftIcon } from "@/components/icons";
import { requireLibrarian } from "@/lib/session";
import { getCategories } from "@/lib/library";

export const metadata: Metadata = {
  title: "Add a book · BookStack",
};

export default async function NewBookPage() {
  const user = await requireLibrarian();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian />

      <main className="mx-auto max-w-4xl px-6 py-10 lg:px-12">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-ember"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to catalogue
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Add a book</h1>
        <p className="mt-2 text-muted">
          Enter the book details and how many copies the library holds.
        </p>

        <div className="mt-8">
          <NewBookForm categories={categories} />
        </div>
      </main>
    </div>
  );
}
