import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <a href="#" className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-2xl text-white">▥</span>
          BookStack
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-indigo-600">Features</a>
          <a href="#how-it-works" className="hover:text-indigo-600">How it works</a>
          <a href="#about" className="hover:text-indigo-600">About</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Sign in</Link>
          <Link href="/sign-up" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Get started</Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-2 lg:px-12 lg:pb-28 lg:pt-24">
          <div>
            <p className="mb-6 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">The smarter way to manage your library</p>
            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">Every book.<br /><span className="text-indigo-600">One simple system.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">BookStack helps libraries organize their collection, manage members, and keep every checkout running smoothly—all in one beautiful workspace.</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link id="get-started" href="/sign-up" className="rounded-lg bg-indigo-600 px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">Start managing free →</Link>
              <a href="#how-it-works" className="rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 hover:border-indigo-300">See how it works</a>
            </div>
            <p className="mt-5 text-sm text-slate-500">No credit card required · Set up in minutes</p>
          </div>
          <div className="relative rounded-3xl bg-indigo-600 p-5 shadow-2xl shadow-indigo-200 lg:rotate-2">
            <div className="rounded-2xl bg-white p-5">
              <div className="mb-7 flex items-center justify-between"><div><p className="text-sm text-slate-500">Good morning, Alex</p><h2 className="text-xl font-bold">Library overview</h2></div><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">Today</span></div>
              <div className="grid grid-cols-3 gap-3"><div className="rounded-xl bg-indigo-50 p-4"><p className="text-xs text-slate-500">Total books</p><p className="mt-1 text-2xl font-bold text-indigo-700">12,486</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-slate-500">Checked out</p><p className="mt-1 text-2xl font-bold text-emerald-600">1,204</p></div><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-slate-500">Members</p><p className="mt-1 text-2xl font-bold text-amber-600">3,892</p></div></div>
              <div className="mt-6 flex items-center justify-between border-b pb-3"><h3 className="font-bold">Recent activity</h3><span className="text-sm text-indigo-600">View all</span></div>
              <div className="space-y-4 pt-4 text-sm"><p>📚 <b>The Midnight Library</b> <span className="float-right text-slate-400">Checked out</span></p><p>📖 <b>Atomic Habits</b> <span className="float-right text-slate-400">Returned</span></p><p>📗 <b>Project Hail Mary</b> <span className="float-right text-slate-400">Reserved</span></p></div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-slate-200 bg-white px-6 py-16 text-center lg:px-12"><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Everything you need</p><h2 className="mt-3 text-3xl font-bold">Run your library with confidence</h2><div className="mx-auto mt-10 grid max-w-7xl gap-6 text-left md:grid-cols-3"><div className="rounded-2xl border border-slate-100 p-6"><span className="text-2xl">📚</span><h3 className="mt-4 font-bold">Effortless cataloging</h3><p className="mt-2 text-slate-600">Keep your entire collection searchable, organized, and up to date.</p></div><div className="rounded-2xl border border-slate-100 p-6"><span className="text-2xl">⚡</span><h3 className="mt-4 font-bold">Simple circulation</h3><p className="mt-2 text-slate-600">Check books in and out in seconds with automatic due-date reminders.</p></div><div className="rounded-2xl border border-slate-100 p-6"><span className="text-2xl">📊</span><h3 className="mt-4 font-bold">Clear insights</h3><p className="mt-2 text-slate-600">Make better decisions with reports that show what your community loves.</p></div></div></section>
      </main>
      <footer id="about" className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">© 2024 BookStack · Built for libraries that inspire.</footer>
    </div>
  );
}
