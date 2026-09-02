import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SearchIcon } from "@/components/icons";
import { BookCover } from "@/components/book-cover";
import { RatingSummary } from "@/components/reviews";
import { requireUser } from "@/lib/session";
import { isLibrarian } from "@/lib/roles";
import { getCategories, searchBooks } from "@/lib/library";
import { getRatingSummaries } from "@/lib/recommendations";

export const metadata: Metadata = {
  title: "Catalogue · BookStack",
};

export default async function CataloguePage({ searchParams }: PageProps<"/catalogue">) {
  const user = await requireUser();
  const librarian = isLibrarian(user);
  const params = await searchParams;

  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const availableOnly = params.available === "1";

  const [books, categories] = await Promise.all([
    searchBooks({ query, category, availableOnly }),
    getCategories(),
  ]);

  const ratings = await getRatingSummaries(books.map((book) => book.id));

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian={librarian} />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catalogue</h1>
            <p className="mt-2 text-muted">
              Search by title, author, ISBN or category. {books.length} of the collection shown.
            </p>
          </div>
          {librarian ? (
            <Link
              href="/catalogue/new"
              className="rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:brightness-110"
            >
              Add a book
            </Link>
          ) : null}
        </div>

        <form className="mt-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Try 'Kleppmann', 'Thriller' or 9780132350884"
              className="w-full rounded-lg border border-line bg-canvas py-3 pl-11 pr-4 outline-none focus:border-brand"
            />
          </div>

          <select
            name="category"
            defaultValue={category}
            className="rounded-lg border border-line bg-canvas px-4 py-3 outline-none focus:border-brand"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-4 py-3 text-sm font-medium">
            <input
              type="checkbox"
              name="available"
              value="1"
              defaultChecked={availableOnly}
              className="h-4 w-4 accent-[#017b7b]"
            />
            On shelf only
          </label>

          <button
            type="submit"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:brightness-110"
          >
            Search
          </button>
        </form>

        {books.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <h2 className="text-lg font-bold">No books matched</h2>
            <p className="mt-2 text-muted">
              Try a shorter search, or clear the filters to see the whole collection.
            </p>
            <Link
              href="/catalogue"
              className="mt-6 inline-block rounded-lg border border-line px-5 py-2.5 font-semibold text-brand hover:border-brand-light"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => {
              const onShelf = book.availableCopies > 0;

              return (
                <li key={book.id}>
                  <Link
                    href={`/catalogue/${book.id}`}
                    className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-brand-light"
                  >
                    <div className="mb-4 h-36 w-24 overflow-hidden rounded-lg shadow-sm">
                      <BookCover title={book.title} author={book.author} seed={book.id} />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-brand">
                        {book.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          onShelf ? "bg-brand/10 text-brand" : "bg-ember/10 text-ember"
                        }`}
                      >
                        {onShelf ? `${book.availableCopies} on shelf` : "All out"}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold leading-snug">{book.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {book.author}
                      {book.publishedYear ? ` · ${book.publishedYear}` : ""}
                    </p>

                    <div className="mt-2">
                      <RatingSummary
                        average={ratings.get(book.id)?.average ?? 0}
                        count={ratings.get(book.id)?.count ?? 0}
                      />
                    </div>

                    {book.description ? (
                      <p className="mt-3 line-clamp-3 text-sm text-muted">{book.description}</p>
                    ) : null}

                    <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
                      {book.totalCopies} copies
                      {book.waiting > 0 ? ` · ${book.waiting} waiting` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
