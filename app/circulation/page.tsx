import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { IssueForm, ReturnForm } from "@/components/circulation-forms";
import { ExchangeIcon } from "@/components/icons";
import { requireLibrarian } from "@/lib/session";
import {
  daysUntil,
  fineForPaise,
  formatRupees,
  getActiveLoansForLibrarian,
} from "@/lib/library";

export const metadata: Metadata = {
  title: "Circulation · BookStack",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function CirculationPage() {
  const user = await requireLibrarian();
  const loans = await getActiveLoansForLibrarian();
  const now = new Date();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <ExchangeIcon className="h-7 w-7 text-brand" />
          Circulation desk
        </h1>
        <p className="mt-2 text-muted">Issue and return copies, and track what is out.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <IssueForm />
          <ReturnForm />
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold">On loan right now ({loans.length})</h2>

          {loans.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-muted">
              Every copy is on the shelf.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-bold">Book</th>
                    <th className="px-5 py-3 font-bold">Barcode</th>
                    <th className="px-5 py-3 font-bold">Member</th>
                    <th className="px-5 py-3 font-bold">Due</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => {
                    const remaining = daysUntil(loan.dueAt, now);
                    const overdue = remaining < 0;

                    return (
                      <tr key={loan.id} className="border-b border-line last:border-0">
                        <td className="px-5 py-3">
                          <Link
                            href={`/catalogue/${loan.copy.bookId}`}
                            className="font-medium hover:text-brand"
                          >
                            {loan.copy.book.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">{loan.copy.barcode}</td>
                        <td className="px-5 py-3 text-muted">{loan.user.email}</td>
                        <td className="px-5 py-3 text-muted">{dateFormat.format(loan.dueAt)}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              overdue ? "bg-ember/10 text-ember" : "bg-brand/10 text-brand"
                            }`}
                          >
                            {overdue
                              ? `${-remaining}d late · ${formatRupees(fineForPaise(loan.dueAt, now))}`
                              : `${remaining}d left`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
