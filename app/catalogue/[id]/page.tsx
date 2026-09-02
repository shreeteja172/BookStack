import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { ReserveButton } from "@/components/reserve-button";
import { ArrowLeftIcon, MapPinIcon, UsersIcon } from "@/components/icons";
import { BookCover } from "@/components/book-cover";
import { RatingSummary, ReviewForm, Stars } from "@/components/reviews";
import { requireUser } from "@/lib/session";
import { isLibrarian } from "@/lib/roles";
import { getBook, getRelatedBooks } from "@/lib/library";
import {
  getAlsoBorrowed,
  getBookReviews,
  getMyReview,
  getRatingSummary,
  hasBorrowed,
} from "@/lib/recommendations";

export const metadata: Metadata = {
  title: "Book · BookStack",
};

const STATUS_LABEL: Record<string, string> = {
  available: "On shelf",
  on_loan: "On loan",
  reserved: "Held for queue",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function BookPage({ params }: PageProps<"/catalogue/[id]">) {
  const user = await requireUser();
  const librarian = isLibrarian(user);
  const { id } = await params;

  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  const [alsoBorrowed, related, rating, reviews, myReview, borrowed] = await Promise.all([
    getAlsoBorrowed(book.id),
    getRelatedBooks(book.id, book.category),
    getRatingSummary(book.id),
    getBookReviews(book.id),
    getMyReview(user.id, book.id),
    hasBorrowed(user.id, book.id),
  ]);

  const onShelf = book.availableCount > 0;
  const myReservation = book.reservations.find((item) => item.userId === user.id);
  const queueLength = book.reservations.filter((item) => item.status === "waiting").length;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian={librarian} />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-ember"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to catalogue
          </Link>
          {librarian ? (
            <Link
              href={`/catalogue/${book.id}/edit`}
              className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-brand hover:border-brand-light"
            >
              Edit book
            </Link>
          ) : null}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-line bg-surface p-8">
              <div className="flex flex-wrap gap-6">
                <div className="h-48 w-32 shrink-0 overflow-hidden rounded-xl shadow-md">
                  <BookCover title={book.title} author={book.author} seed={book.id} />
                </div>
                <div className="min-w-[16rem] flex-1">
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-brand">
                    {book.category}
                  </span>
                  <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight">
                    {book.title}
                  </h1>
                  <p className="mt-2 text-lg text-muted">{book.author}</p>
                  <div className="mt-3">
                    <RatingSummary average={rating.average} count={rating.count} />
                  </div>
                </div>
              </div>

              {book.description ? (
                <p className="mt-6 leading-7 text-muted">{book.description}</p>
              ) : null}

              <dl className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted">ISBN</dt>
                  <dd className="mt-1 font-medium">{book.isbn}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                    Publisher
                  </dt>
                  <dd className="mt-1 font-medium">{book.publisher ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                    Published
                  </dt>
                  <dd className="mt-1 font-medium">{book.publishedYear ?? "Not recorded"}</dd>
                </div>
              </dl>

              <h2 className="mt-10 flex items-center gap-2 text-lg font-bold">
                <MapPinIcon className="h-5 w-5 text-brand" />
                Where to find it
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr className="border-b border-line">
                      <th className="pb-2 font-bold">Barcode</th>
                      <th className="pb-2 font-bold">Location</th>
                      <th className="pb-2 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.copies.map((copy) => (
                      <tr key={copy.id} className="border-b border-line last:border-0">
                        <td className="py-3 font-mono text-xs">{copy.barcode}</td>
                        <td className="py-3">
                          Floor {copy.floor} · Shelf {copy.shelf} · Row {copy.row}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              copy.status === "available"
                                ? "bg-brand/10 text-brand"
                                : "bg-ember/10 text-ember"
                            }`}
                          >
                            {STATUS_LABEL[copy.status] ?? copy.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-surface p-8">
              <h2 className="text-lg font-bold">Reviews</h2>

              <div className="mt-4 border-b border-line pb-6">
                <ReviewForm
                  bookId={book.id}
                  canReview={borrowed}
                  existingRating={myReview?.rating}
                  existingBody={myReview?.body}
                />
              </div>

              {reviews.length === 0 ? (
                <p className="mt-6 text-sm text-muted">
                  Nobody has reviewed this yet. Be the first once you have read it.
                </p>
              ) : (
                <ul className="mt-6 space-y-5">
                  {reviews.map((review) => (
                    <li key={review.id} className="border-b border-line pb-5 last:border-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold">{review.user.name}</span>
                        {review.verifiedBorrower ? (
                          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                            Verified borrower
                          </span>
                        ) : null}
                        <span className="text-xs text-muted">
                          {dateFormat.format(review.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Stars value={review.rating} size={14} />
                      </div>
                      {review.body ? (
                        <p className="mt-2 text-sm leading-6 text-muted">{review.body}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-line bg-surface p-6">
              <p className="text-sm text-muted">Availability</p>
              <p className={`mt-1 text-3xl font-bold ${onShelf ? "text-brand" : "text-ember"}`}>
                {book.availableCount} / {book.copies.length}
              </p>
              <p className="mt-1 text-sm text-muted">copies on the shelf right now</p>

              {queueLength > 0 ? (
                <p className="mt-4 flex items-center gap-2 rounded-lg bg-sand px-4 py-3 text-sm font-medium text-brand">
                  <UsersIcon className="h-4 w-4" />
                  {queueLength} member{queueLength === 1 ? "" : "s"} waiting
                </p>
              ) : null}

              <div className="mt-6">
                {myReservation ? (
                  <p className="rounded-lg bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
                    {myReservation.status === "ready"
                      ? "A copy is being held for you. Collect it at the issue desk."
                      : "You are in the queue for this book."}
                  </p>
                ) : onShelf ? (
                  <p className="rounded-lg bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
                    Available now. Take the shelf location above to the issue desk.
                  </p>
                ) : (
                  <ReserveButton bookId={book.id} />
                )}
              </div>
            </div>

            {alsoBorrowed.length > 0 ? (
              <div className="rounded-3xl border border-line bg-surface p-6">
                <h2 className="font-bold">Members who borrowed this also borrowed</h2>
                <ul className="mt-4 space-y-3">
                  {alsoBorrowed.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/catalogue/${item.id}`}
                        className="block rounded-lg border border-line p-3 text-sm hover:border-brand-light"
                      >
                        <span className="font-semibold">{item.title}</span>
                        <span className="mt-1 block text-muted">
                          {item.author} · {item.score} shared readers
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : related.length > 0 ? (
              <div className="rounded-3xl border border-line bg-surface p-6">
                <h2 className="font-bold">More in {book.category}</h2>
                <ul className="mt-4 space-y-3">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/catalogue/${item.id}`}
                        className="block rounded-lg border border-line p-3 text-sm hover:border-brand-light"
                      >
                        <span className="font-semibold">{item.title}</span>
                        <span className="mt-1 block text-muted">
                          {item.author} ·{" "}
                          {item.availableCopies > 0
                            ? `${item.availableCopies} on shelf`
                            : "All out"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
