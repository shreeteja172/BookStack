import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { CancelReservationButton } from "@/components/reserve-button";
import { AlertIcon, BookmarkIcon, BooksIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import { BookCover } from "@/components/book-cover";
import { RenewLoanButton, ReturnLoanButton } from "@/components/borrow-buttons";
import { requireUser } from "@/lib/session";
import { isLibrarian } from "@/lib/roles";
import {
  MAX_ACTIVE_LOANS,
  MAX_RENEWALS,
  daysUntil,
  fineForPaise,
  formatRupees,
  getLibraryStats,
  getMemberLoans,
  getMemberReservations,
  getMemberStats,
} from "@/lib/library";
import { getPersonalRecommendations } from "@/lib/recommendations";

export const metadata: Metadata = {
  title: "Dashboard · BookStack",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function DashboardPage() {
  const user = await requireUser();
  const librarian = isLibrarian(user);

  const [{ active, history }, reservations, stats, libraryStats, picks] = await Promise.all([
    getMemberLoans(user.id),
    getMemberReservations(user.id),
    getMemberStats(user.id),
    librarian ? getLibraryStats() : Promise.resolve(null),
    getPersonalRecommendations(user.id),
  ]);

  const now = new Date();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian={librarian} />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || "reader"}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              librarian ? "bg-brand text-white" : "bg-sand text-brand"
            }`}
          >
            {librarian ? "Librarian" : "Member"}
          </span>
        </div>
        <p className="mt-2 text-muted">
          {stats.activeCount} of {MAX_ACTIVE_LOANS} loans in use
          {stats.overdueCount > 0 ? ` · ${stats.overdueCount} overdue` : ""}
        </p>

        {librarian && libraryStats ? (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Books" value={libraryStats.books} />
            <StatCard label="Copies" value={libraryStats.copies} />
            <StatCard label="On loan" value={libraryStats.onLoan} tone="brand-light" />
            <StatCard label="Overdue" value={libraryStats.overdueLoans} tone="ember" />
            <StatCard label="Members" value={libraryStats.members} />
          </section>
        ) : (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Books completed" value={stats.completed} />
            <StatCard label="Currently borrowed" value={stats.activeCount} tone="brand-light" />
            <StatCard label="Reservations" value={stats.reservations} />
            <StatCard
              label="Fine due"
              value={formatRupees(stats.outstandingFinePaise)}
              tone={stats.outstandingFinePaise > 0 ? "ember" : "brand"}
            />
          </section>
        )}

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <BooksIcon className="h-5 w-5 text-brand" />
            Currently borrowed
          </h2>

          {active.length === 0 ? (
            <EmptyState
              title="Nothing checked out"
              body="Find something in the catalogue and collect it at the issue desk."
              actionHref="/catalogue"
              actionLabel="Browse catalogue"
            />
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {active.map((loan) => {
                const remaining = daysUntil(loan.dueAt, now);
                const overdue = remaining < 0;
                const fine = fineForPaise(loan.dueAt, now);

                return (
                  <li
                    key={loan.id}
                    className="rounded-2xl border border-line bg-surface p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/catalogue/${loan.copy.bookId}`}
                          className="font-bold hover:text-brand"
                        >
                          {loan.copy.book.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted">{loan.copy.book.author}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          overdue ? "bg-ember/10 text-ember" : "bg-brand/10 text-brand"
                        }`}
                      >
                        {overdue ? `${-remaining}d overdue` : `${remaining}d left`}
                      </span>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                      <ClockIcon className="h-4 w-4" />
                      Due {dateFormat.format(loan.dueAt)}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <MapPinIcon className="h-4 w-4" />
                      Return to Floor {loan.copy.floor} · Shelf {loan.copy.shelf} · Row{" "}
                      {loan.copy.row}
                    </p>

                    {overdue ? (
                      <p className="mt-4 flex items-center gap-2 rounded-lg bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">
                        <AlertIcon className="h-4 w-4" />
                        Fine so far {formatRupees(fine)}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-line pt-4">
                      <ReturnLoanButton loanId={loan.id} />
                      <RenewLoanButton loanId={loan.id} />
                      <span className="self-center text-xs text-muted">
                        Renewed {loan.renewals} of {MAX_RENEWALS} times
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Picked for you</h2>
          <p className="mt-1 text-sm text-muted">{picks[0]?.reason ?? "Popular right now"}</p>

          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((pick) => (
              <li key={pick.id}>
                <Link
                  href={`/catalogue/${pick.id}`}
                  className="flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand-light"
                >
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg shadow-sm">
                    <BookCover title={pick.title} author={pick.author} seed={pick.id} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{pick.title}</p>
                    <p className="mt-1 truncate text-sm text-muted">{pick.author}</p>
                    <span className="mt-2 inline-block rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold text-brand">
                      {pick.category}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <BookmarkIcon className="h-5 w-5 text-brand" />
            Reservations
          </h2>

          {reservations.length === 0 ? (
            <EmptyState
              title="No books on hold"
              body="When every copy is out, reserve a book and we will hold the next one returned."
              actionHref="/catalogue"
              actionLabel="Find a book"
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {reservations.map((reservation) => (
                <li
                  key={reservation.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5"
                >
                  <div>
                    <Link
                      href={`/catalogue/${reservation.bookId}`}
                      className="font-bold hover:text-brand"
                    >
                      {reservation.book.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      {reservation.status === "ready"
                        ? "A copy is held for you. Borrow it now."
                        : `Position ${reservation.position} in the queue`}
                    </p>
                  </div>
                  <CancelReservationButton reservationId={reservation.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {history.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold">Borrowing history</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-bold">Book</th>
                    <th className="px-5 py-3 font-bold">Issued</th>
                    <th className="px-5 py-3 font-bold">Returned</th>
                    <th className="px-5 py-3 font-bold">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((loan) => (
                    <tr key={loan.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 font-medium">{loan.copy.book.title}</td>
                      <td className="px-5 py-3 text-muted">{dateFormat.format(loan.issuedAt)}</td>
                      <td className="px-5 py-3 text-muted">
                        {loan.returnedAt ? dateFormat.format(loan.returnedAt) : "-"}
                      </td>
                      <td className="px-5 py-3">
                        {loan.fineCents > 0 ? (
                          <span className="font-semibold text-ember">
                            {formatRupees(loan.fineCents)}
                          </span>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "brand",
}: {
  label: string;
  value: number | string;
  tone?: "brand" | "brand-light" | "ember";
}) {
  const toneClass =
    tone === "ember" ? "text-ember" : tone === "brand-light" ? "text-brand-light" : "text-brand";

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-muted">{body}</p>
      <Link
        href={actionHref}
        className="mt-5 inline-block rounded-lg border border-line px-5 py-2.5 font-semibold text-brand hover:border-brand-light"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
