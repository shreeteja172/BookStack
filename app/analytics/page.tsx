import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { BarList, ColumnChart, DonutStat } from "@/components/charts";
import { InsightsIcon } from "@/components/icons";
import { requireLibrarian } from "@/lib/session";
import { formatRupees } from "@/lib/library";
import {
  getCategoryDemand,
  getCirculationHealth,
  getMonthlyTrend,
  getPurchaseSuggestions,
  getTopBooks,
  getTopMembers,
} from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Analytics · BookStack",
};

export default async function AnalyticsPage() {
  const user = await requireLibrarian();

  const [topBooks, categories, trend, members, health, suggestions] = await Promise.all([
    getTopBooks(),
    getCategoryDemand(),
    getMonthlyTrend(),
    getTopMembers(),
    getCirculationHealth(),
    getPurchaseSuggestions(),
  ]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <InsightsIcon className="h-7 w-7 text-brand" />
          Analytics
        </h1>
        <p className="mt-2 text-muted">
          Built from {health.total} loans across the whole borrowing history.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total loans" value={health.total} />
          <Stat label="Out right now" value={health.active} tone="brand-light" />
          <Stat label="Overdue right now" value={health.overdueNow} tone="ember" />
          <Stat label="Fines collected" value={formatRupees(health.finesCollectedPaise)} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Loans per month">
            <ColumnChart rows={trend} />
          </Panel>
          <Panel title="Return discipline">
            <DonutStat
              percent={health.lateRate}
              label={`${health.lateRate}% of loans came back late`}
              caption={`${health.late} of ${health.total} loans attracted a fine.`}
            />
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Most borrowed books">
            <BarList rows={topBooks} />
          </Panel>
          <Panel title="Demand by category">
            <BarList rows={categories} />
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Most active members">
            <BarList rows={members} />
          </Panel>

          <Panel title="Consider buying more copies">
            <p className="mb-4 text-sm text-muted">
              Ranked by loans per copy. A high number means the shelf empties faster than the
              library can refill it.
            </p>
            <ul className="space-y-3">
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3"
                >
                  <div>
                    <Link
                      href={`/catalogue/${item.id}`}
                      className="font-semibold hover:text-brand"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted">
                      {item.loans} loans across {item.copies} copies
                      {item.waiting > 0 ? ` · ${item.waiting} waiting now` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-ember/10 px-3 py-1 text-xs font-bold text-ember">
                    {item.demandPerCopy} per copy
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      </main>
    </div>
  );
}

function Stat({
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="mb-5 text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}
