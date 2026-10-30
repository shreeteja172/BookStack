import Link from "next/link";
import { getPublicStats, getRecentActivity } from "@/lib/library";
import { getPopularBooks } from "@/lib/recommendations";
import { BookCover } from "@/components/book-cover";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BookmarkIcon,
  BooksIcon,
  CirculationIcon,
  InsightsIcon,
  LogoMark,
  MapPinIcon,
  SearchIcon,
  UsersIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Find it",
    body: "Search by title, author or ISBN from anywhere with Ctrl K. See how many copies are on the shelf right now.",
  },
  {
    title: "Walk to it",
    body: "The floor map lights up the exact floor, shelf and row. No more wandering the aisles.",
  },
  {
    title: "Borrow it",
    body: "Check it out from your phone. Renew or return online, and join a fair queue when every copy is out.",
  },
];

const stack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Server Actions",
  "Prisma 7",
  "Neon Postgres",
  "Better Auth",
  "Tailwind CSS 4",
  "ZXing barcode engine",
  "Open Library API",
];

export default async function Home() {
  const [stats, activity, popular] = await Promise.all([
    getPublicStats(),
    getRecentActivity(12),
    getPopularBooks(5),
  ]);
  const numbers = new Intl.NumberFormat("en-IN");
  const ticker = activity.length > 0 ? [...activity, ...activity] : [];

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
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
              Built with
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in" className="hidden text-sm font-semibold text-brand hover:text-ink sm:inline">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:px-12 lg:pb-28 lg:pt-24">
            <div className="rise">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-brand shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-light opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
                </span>
                Live · {numbers.format(stats.loans)} loans tracked and counting
              </p>
              <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
                The library that
                <br />
                <span className="text-gradient">knows every shelf.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                Search the whole collection in a keystroke, walk straight to the right row, borrow
                from your phone, and let the system recommend what to read next.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  id="get-started"
                  href="/sign-up"
                  className="rounded-xl bg-ember px-7 py-4 text-center font-semibold text-white shadow-lg shadow-ember/30 transition hover:-translate-y-0.5 hover:brightness-95"
                >
                  Start borrowing free
                </Link>
                <a
                  href="#features"
                  className="rounded-xl border border-line bg-surface px-7 py-4 text-center font-semibold text-brand transition hover:-translate-y-0.5 hover:border-brand-light"
                >
                  Explore features
                </a>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
                <div>
                  <dt className="text-sm text-muted">Titles</dt>
                  <dd className="mt-1 text-3xl font-bold">{numbers.format(stats.books)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Physical copies</dt>
                  <dd className="mt-1 text-3xl font-bold">{numbers.format(stats.copies)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Readers</dt>
                  <dd className="mt-1 text-3xl font-bold">{numbers.format(stats.members)}</dd>
                </div>
              </dl>
            </div>

            <HeroShowcase books={popular} />
          </div>
        </section>

        {ticker.length > 0 ? (
          <section className="border-y border-line bg-surface py-4" aria-label="Recent library activity">
            <div className="flex overflow-hidden">
              <ul className="marquee flex shrink-0 gap-10 pr-10">
                {ticker.map((item, index) => (
                  <li key={`${item.id}-${index}`} className="flex shrink-0 items-center gap-3 text-sm">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.state === "Returned" ? "bg-brand-light" : "bg-ember"
                      }`}
                    />
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-muted">{item.state.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-ember">
              More than a catalogue
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Built like a product, not a spreadsheet.
            </h2>
            <p className="mt-4 text-lg text-muted">
              Every feature is wired to real data: live shelf status, a borrowing history that powers
              recommendations, and analytics that tell the library what to buy next.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-6">
            <Tile className="md:col-span-4" icon={MapPinIcon} title="Shelf-level floor map" body="Every copy knows its floor, shelf and row. The book page draws the floor plan and pins the nearest copy on the shelf.">
              <MiniFloorMap />
            </Tile>
            <Tile className="md:col-span-2" icon={SearchIcon} title="Search in a keystroke" body="Press Ctrl K anywhere for instant search across titles, authors and ISBNs.">
              <MiniPalette />
            </Tile>
            <Tile className="md:col-span-2" icon={CirculationIcon} title="Scan to catalogue" body="Point a webcam at the barcode. Title, author, publisher and summary fill themselves in.">
              <MiniScanner />
            </Tile>
            <Tile className="md:col-span-2" icon={UsersIcon} title="A queue that is fair" body="When every copy is out, readers queue. A returned copy is held for whoever is first.">
              <MiniQueue />
            </Tile>
            <Tile className="md:col-span-2" icon={BookmarkIcon} title="Picked for you" body="Collaborative filtering over real loans: readers who borrowed this also borrowed that.">
              <MiniRecommendations />
            </Tile>
            <Tile className="md:col-span-3" icon={InsightsIcon} title="Analytics that make decisions" body="Daily activity, category demand, late-return rate, and which titles need more copies.">
              <MiniHeatmap />
            </Tile>
            <Tile className="md:col-span-3" icon={BooksIcon} title="Rules the system enforces" body="Loan limits, renewal caps, live overdue fines and borrowing blocks are checked on the server, not just hidden in the UI.">
              <MiniRules />
            </Tile>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-y border-line bg-surface px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-widest text-ember">How it works</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">From search to shelf in three steps.</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="relative rounded-3xl border border-line bg-canvas p-8">
                  <span className="text-gradient text-6xl font-bold">0{index + 1}</span>
                  <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 leading-7 text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand px-8 py-14 text-white sm:px-14">
            <p className="relative text-sm font-bold uppercase tracking-widest text-white/70">
              Live from the database
            </p>
            <div className="relative mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <BigStat value={numbers.format(stats.loans)} label="loans recorded" />
              <BigStat value={numbers.format(stats.copies)} label="copies tracked to the row" />
              <BigStat value={numbers.format(stats.reviews)} label="reader reviews" />
              <BigStat value={numbers.format(stats.members)} label="members" />
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 px-6 pb-24 lg:px-12">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-muted">Built with</p>
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {stack.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mx-auto mt-20 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Your next book is <span className="text-gradient">one search away.</span>
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-xl bg-ember px-7 py-4 font-semibold text-white shadow-lg shadow-ember/30 transition hover:-translate-y-0.5 hover:brightness-95"
              >
                Create a free account
              </Link>
              <Link
                href="/sign-in"
                className="rounded-xl border border-line bg-surface px-7 py-4 font-semibold text-brand transition hover:-translate-y-0.5 hover:border-brand-light"
              >
                I already have one
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted lg:px-12">
          <span className="flex items-center gap-2 font-semibold text-ink">
            <LogoMark className="h-4 w-4 text-brand" />
            BookStack
          </span>
          <span>© {new Date().getFullYear()} BookStack · A library management system</span>
        </div>
      </footer>
    </div>
  );
}

type ShowcaseBook = { id: string; title: string; author: string; isbn: string };

function HeroShowcase({ books }: { books: ShowcaseBook[] }) {
  const placements = [
    "left-0 top-16 -rotate-12",
    "left-[18%] top-6 -rotate-6",
    "left-[36%] top-0 z-10 scale-110",
    "left-[54%] top-6 rotate-6",
    "left-[72%] top-16 rotate-12",
  ];

  return (
    <div className="rise relative mx-auto h-[26rem] w-full max-w-lg sm:h-[30rem]" style={{ animationDelay: "150ms" }}>
      <div className="absolute inset-x-0 top-4 h-72">
        {books.slice(0, 5).map((book, index) => (
          <Link
            key={book.id}
            href={`/catalogue/${book.id}`}
            className={`absolute h-48 w-32 overflow-hidden rounded-xl shadow-2xl shadow-ink/30 ring-1 ring-black/5 transition duration-300 hover:z-20 hover:-translate-y-3 hover:rotate-0 sm:h-56 sm:w-36 ${placements[index]}`}
          >
            <BookCover title={book.title} author={book.author} seed={book.id} isbn={book.isbn} eager />
          </Link>
        ))}
      </div>

      <div className="float absolute bottom-16 left-0 w-60 rounded-2xl border border-line bg-surface p-4 shadow-xl">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
          <MapPinIcon className="h-4 w-4 text-brand" />
          Where to find it
        </p>
        <p className="mt-2 font-bold">Floor 2 · Shelf E · Row 3</p>
        <div className="mt-3 flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <span key={row} className={`h-3 flex-1 rounded ${row === 2 ? "bg-brand" : "bg-line"}`} />
          ))}
        </div>
      </div>

      <div className="float-delay absolute bottom-0 right-0 w-64 rounded-2xl border border-line bg-surface p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ember/15 text-ember">
            <BookmarkIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold">A copy is held for you</p>
            <p className="text-xs text-muted">You were first in the queue</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  className,
  icon: Icon,
  title,
  body,
  children,
}: {
  className?: string;
  icon: (props: { className?: string }) => React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-brand-light hover:shadow-xl hover:shadow-brand/10 ${className ?? ""}`}
    >
      <div className="flex h-44 items-center justify-center bg-canvas/70 p-6">{children}</div>
      <div className="p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Icon className="h-5 w-5 text-brand" />
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
      </div>
    </div>
  );
}

function MiniFloorMap() {
  const shelves = ["A", "B", "C", "D", "E", "F"];

  return (
    <svg viewBox="0 0 420 130" className="h-full w-full max-w-md" aria-hidden>
      <rect x="2" y="2" width="416" height="126" rx="12" fill="none" stroke="var(--color-line)" strokeWidth="2" />
      {shelves.map((shelf, index) => {
        const x = 24 + (index % 3) * 132;
        const y = 22 + Math.floor(index / 3) * 52;
        return (
          <g key={shelf}>
            <text x={x} y={y + 4} fontSize="10" fontWeight="700" fill="var(--color-muted)">
              {shelf}
            </text>
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <rect
                key={row}
                x={x + 12 + row * 17}
                y={y - 8}
                width="15"
                height="22"
                rx="3"
                fill={shelf === "E" && row === 2 ? "var(--color-brand)" : "var(--color-line)"}
              />
            ))}
          </g>
        );
      })}
      <circle className="pin-pulse" cx={24 + 132 + 12 + 2 * 17 + 7.5} cy={22 + 52 + 3} r="6" fill="var(--color-brand-light)" />
      <circle cx={24 + 132 + 12 + 2 * 17 + 7.5} cy={22 + 52 + 3} r="4" fill="#fff" />
      <rect x="180" y="122" width="60" height="6" rx="3" fill="var(--color-brand)" />
    </svg>
  );
}

function MiniPalette() {
  return (
    <div className="w-full max-w-[15rem] rounded-xl border border-line bg-surface shadow-lg">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5 text-sm">
        <SearchIcon className="h-4 w-4 text-brand" />
        <span>kleppm</span>
        <span className="h-4 w-px animate-pulse bg-ink" />
        <kbd className="ml-auto rounded border border-line px-1 font-mono text-[10px] text-muted">Ctrl K</kbd>
      </div>
      <div className="space-y-1 p-1.5 text-xs">
        <div className="rounded-lg bg-brand/10 px-2.5 py-2">
          <p className="font-semibold">Designing Data-Intensive Apps</p>
          <p className="text-muted">Martin Kleppmann · 2/3 on shelf</p>
        </div>
        <div className="px-2.5 py-1.5 text-muted">Browse the catalogue</div>
      </div>
    </div>
  );
}

function MiniScanner() {
  const bars = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3];

  return (
    <div className="relative flex h-28 w-48 items-center justify-center rounded-xl border-2 border-dashed border-brand-light bg-surface">
      <div className="flex h-16 items-stretch gap-[2px]">
        {bars.map((width, index) => (
          <span key={index} className="bg-ink" style={{ width: `${width + 1}px` }} />
        ))}
      </div>
      <span className="scan-line absolute left-3 right-3 h-0.5 rounded bg-ember shadow-[0_0_12px_2px] shadow-ember/60" />
    </div>
  );
}

function MiniQueue() {
  const people = ["AK", "RS", "MP", "JT"];

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-16 w-11 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white shadow-md">
        1 copy
      </span>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
      {people.map((initials, index) => (
        <span
          key={initials}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
            index === 0 ? "bg-ember text-white ring-4 ring-ember/20" : "bg-line text-muted"
          }`}
        >
          {initials}
        </span>
      ))}
    </div>
  );
}

function MiniRecommendations() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full max-w-[14rem]" aria-hidden>
      {[
        [40, 30],
        [40, 90],
      ].map(([x, y]) => (
        <g key={`r${y}`}>
          <line x1={x} y1={y} x2="180" y2="30" stroke="var(--color-line)" strokeWidth="2" />
          <line x1={x} y1={y} x2="180" y2="90" stroke="var(--color-line)" strokeWidth="2" />
          <circle cx={x} cy={y} r="14" fill="var(--color-sand)" />
        </g>
      ))}
      <line x1="110" y1="60" x2="180" y2="30" stroke="var(--color-brand)" strokeWidth="3" />
      <line x1="40" y1="30" x2="110" y2="60" stroke="var(--color-brand)" strokeWidth="3" />
      <circle cx="110" cy="60" r="16" fill="var(--color-brand)" />
      <rect x="170" y="14" width="22" height="32" rx="4" fill="var(--color-ember)" />
      <rect x="170" y="74" width="22" height="32" rx="4" fill="var(--color-brand-light)" />
    </svg>
  );
}

function MiniHeatmap() {
  const cells = Array.from({ length: 7 * 18 }, (_, index) => {
    const wave = Math.sin(index * 0.37) + Math.cos(index * 0.11);
    return Math.max(0, Math.min(1, (wave + 1.2) / 3));
  });

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {cells.map((level, index) => (
        <span
          key={index}
          className="h-3 w-3 rounded-[3px]"
          style={{
            background: level < 0.2 ? "var(--color-line)" : "var(--color-brand)",
            opacity: level < 0.2 ? 1 : 0.3 + level * 0.7,
          }}
        />
      ))}
    </div>
  );
}

function MiniRules() {
  const rules = [
    ["3", "books at once"],
    ["14", "day loans"],
    ["2", "renewals max"],
    ["₹5", "per day overdue"],
  ];

  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-2">
      {rules.map(([value, label]) => (
        <div key={label} className="rounded-xl border border-line bg-surface px-3 py-2">
          <p className="text-xl font-bold text-brand">{value}</p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-5xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-white/75">{label}</p>
    </div>
  );
}
