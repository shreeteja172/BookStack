import { LogoMark } from "./icons";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-line/70 ${className}`} />;
}

type Variant = "dashboard" | "grid" | "detail" | "panels" | "table";

export function PageSkeleton({ variant }: { variant: Variant }) {
  return (
    <div className="min-h-screen bg-canvas text-ink" aria-busy="true" aria-label="Loading">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-12">
          <div className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <LogoMark className="h-5 w-5" />
            </span>
            BookStack
          </div>
          <Block className="h-9 w-40 rounded-lg" />
        </div>
      </header>
      <div className="h-0.5 w-full overflow-hidden bg-line">
        <div className="loading-bar h-full w-1/3 bg-brand" />
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <Block className="h-9 w-72" />
        <Block className="mt-3 h-5 w-48" />

        {variant === "dashboard" ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <Block key={item} className="h-24" />
              ))}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Block className="h-48" />
              <Block className="h-48" />
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              <Block className="h-72" />
              <Block className="h-72" />
            </div>
          </>
        ) : null}

        {variant === "grid" ? (
          <>
            <Block className="mt-8 h-14" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <Block key={item} className="h-80" />
              ))}
            </div>
          </>
        ) : null}

        {variant === "detail" ? (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <Block className="h-[32rem] rounded-3xl" />
              <Block className="h-56 rounded-3xl" />
            </div>
            <div className="space-y-6">
              <Block className="h-56 rounded-3xl" />
              <Block className="h-72 rounded-3xl" />
            </div>
          </div>
        ) : null}

        {variant === "panels" ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <Block key={item} className="h-24" />
              ))}
            </div>
            <Block className="mt-8 h-56" />
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Block className="h-72" />
              <Block className="h-72" />
            </div>
          </>
        ) : null}

        {variant === "table" ? (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Block className="h-64" />
              <Block className="h-64" />
            </div>
            <Block className="mt-8 h-96" />
          </>
        ) : null}
      </main>
    </div>
  );
}
