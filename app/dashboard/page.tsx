import Link from "next/link";
import type { Metadata } from "next";
import { SignOutButton } from "@/components/sign-out-button";
import { BooksIcon, BookmarkIcon, LogoMark, SearchIcon, SettingsIcon } from "@/components/icons";
import { requireUser } from "@/lib/session";
import { isLibrarian } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dashboard · BookStack",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const librarian = isLibrarian(user);

  const cards = [
    {
      icon: BooksIcon,
      title: "Your loans",
      body: "Nothing checked out yet.",
    },
    {
      icon: BookmarkIcon,
      title: "Reservations",
      body: "No books on hold.",
    },
    librarian
      ? {
          icon: SettingsIcon,
          title: "Manage catalogue",
          body: "Add titles and manage members once those screens are built.",
        }
      : {
          icon: SearchIcon,
          title: "Find a book",
          body: "Search the collection once the catalogue is built.",
        },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <LogoMark className="h-5 w-5" />
          </span>
          BookStack
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
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
              librarian ? "bg-brand text-white" : "bg-sand text-brand"
            }`}
          >
            {librarian ? "Librarian" : "Member"}
          </span>
        </div>
        <p className="mt-2 text-muted">
          {librarian
            ? "You have full access to the catalogue and member records."
            : "Browse the catalogue and keep track of what you've borrowed."}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-bold">{title}</h2>
              <p className="mt-2 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
