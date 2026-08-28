import Link from "next/link";
import {
  BooksIcon,
  CirculationIcon,
  InsightsIcon,
  LogoMark,
} from "@/components/icons";

const features = [
  {
    icon: BooksIcon,
    title: "Effortless cataloging",
    body: "Keep your entire collection searchable, organized, and up to date.",
  },
  {
    icon: CirculationIcon,
    title: "Simple circulation",
    body: "Check books in and out in seconds with automatic due-date reminders.",
  },
  {
    icon: InsightsIcon,
    title: "Clear insights",
    body: "Make better decisions with reports that show what your community loves.",
  },
];

const activity = [
  { title: "The Midnight Library", state: "Checked out" },
  { title: "Atomic Habits", state: "Returned" },
  { title: "Project Hail Mary", state: "Reserved" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <LogoMark className="h-5 w-5" />
          </span>
          BookStack
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <a href="#features" className="hover:text-brand">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-brand">
            How it works
          </a>
          <a href="#about" className="hover:text-brand">
            About
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm font-semibold text-brand hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
          >
            Get started
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-2 lg:px-12 lg:pb-28 lg:pt-24">
          <div>
            <p className="mb-6 inline-flex rounded-full bg-sand px-4 py-2 text-sm font-semibold text-brand">
              The smarter way to manage your library
            </p>
            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Every book.
              <br />
              <span className="text-brand">One simple system.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              BookStack helps libraries organize their collection, manage members, and keep
              every checkout running smoothly—all in one beautiful workspace.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                id="get-started"
                href="/sign-up"
                className="rounded-lg bg-ember px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-ember/25 hover:brightness-95"
              >
                Start managing free
              </Link>
              <a
                href="#how-it-works"
                className="rounded-lg border border-line bg-surface px-6 py-3.5 text-center font-semibold text-brand hover:border-brand-light"
              >
                See how it works
              </a>
            </div>
            <p className="mt-5 text-sm text-muted">No credit card required · Set up in minutes</p>
          </div>

          <div className="relative rounded-3xl bg-brand p-5 shadow-2xl shadow-brand/25 lg:rotate-2">
            <div className="rounded-2xl bg-surface p-5">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Good morning, Alex</p>
                  <h2 className="text-xl font-bold">Library overview</h2>
                </div>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-brand">
                  Today
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-brand/10 p-4">
                  <p className="text-xs text-muted">Total books</p>
                  <p className="mt-1 text-2xl font-bold text-brand">12,486</p>
                </div>
                <div className="rounded-xl bg-brand-light/15 p-4">
                  <p className="text-xs text-muted">Checked out</p>
                  <p className="mt-1 text-2xl font-bold text-brand-light">1,204</p>
                </div>
                <div className="rounded-xl bg-sand p-4">
                  <p className="text-xs text-muted">Members</p>
                  <p className="mt-1 text-2xl font-bold text-ember">3,892</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-b border-line pb-3">
                <h3 className="font-bold">Recent activity</h3>
                <span className="text-sm text-brand">View all</span>
              </div>
              <ul className="space-y-4 pt-4 text-sm">
                {activity.map((item) => (
                  <li key={item.title} className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-muted">{item.state}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-y border-line bg-surface px-6 py-16 text-center lg:px-12"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-ember">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-bold">Run your library with confidence</h2>
          <div className="mx-auto mt-10 grid max-w-7xl gap-6 text-left md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-line p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer
        id="about"
        className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-muted"
      >
        © 2024 BookStack · Built for libraries that inspire.
      </footer>
    </div>
  );
}
