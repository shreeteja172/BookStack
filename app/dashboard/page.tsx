import Link from "next/link";
import type { Metadata } from "next";
import { SignOutButton } from "@/components/sign-out-button";
import { requireUser } from "@/lib/session";
import { isLibrarian } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dashboard · BookStack",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const librarian = isLibrarian(user);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-2xl text-white">
            ▥
          </span>
          BookStack
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-600 sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || "reader"}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              librarian ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {librarian ? "Librarian" : "Member"}
          </span>
        </div>
        <p className="mt-2 text-slate-600">
          {librarian
            ? "You have full access to the catalogue and member records."
            : "Browse the catalogue and keep track of what you've borrowed."}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6">
            <span className="text-2xl">📚</span>
            <h2 className="mt-4 font-bold">Your loans</h2>
            <p className="mt-2 text-slate-600">Nothing checked out yet.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6">
            <span className="text-2xl">🔖</span>
            <h2 className="mt-4 font-bold">Reservations</h2>
            <p className="mt-2 text-slate-600">No books on hold.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6">
            <span className="text-2xl">{librarian ? "⚙️" : "🔍"}</span>
            <h2 className="mt-4 font-bold">{librarian ? "Manage catalogue" : "Find a book"}</h2>
            <p className="mt-2 text-slate-600">
              {librarian
                ? "Add titles and manage members once those screens are built."
                : "Search the collection once the catalogue is built."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
