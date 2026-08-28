import Link from "next/link";
import { LogoMark } from "@/components/icons";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <LogoMark className="h-5 w-5" />
          </span>
          BookStack
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-6 py-8 text-center text-sm text-muted">
        © 2024 BookStack · Built for libraries that inspire.
      </footer>
    </div>
  );
}
