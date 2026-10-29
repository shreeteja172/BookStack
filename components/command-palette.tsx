"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

type Result = {
  id: string;
  title: string;
  author: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
};

type Item = {
  key: string;
  label: string;
  hint: string;
  href: string;
  tone?: "brand" | "ember";
};

export function CommandPalette({ librarian }: { librarian: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages: Item[] = [
    { key: "p-dash", label: "Go to dashboard", hint: "Page", href: "/dashboard" },
    { key: "p-cat", label: "Browse the catalogue", hint: "Page", href: "/catalogue" },
    { key: "p-avail", label: "Books on the shelf right now", hint: "Filter", href: "/catalogue?available=1" },
    ...(librarian
      ? [
          { key: "p-circ", label: "Open the circulation desk", hint: "Librarian", href: "/circulation" },
          { key: "p-new", label: "Add a new book", hint: "Librarian", href: "/catalogue/new" },
          { key: "p-ana", label: "View analytics", hint: "Librarian", href: "/analytics" },
          { key: "p-mem", label: "Manage members", hint: "Librarian", href: "/members" },
        ]
      : []),
  ];

  const trimmed = query.trim().toLowerCase();
  const matchingPages = trimmed ? pages.filter((page) => page.label.toLowerCase().includes(trimmed)) : pages;
  const bookItems: Item[] = (trimmed.length < 2 ? [] : results).map((book) => ({
    key: book.id,
    label: book.title,
    hint:
      book.availableCopies > 0
        ? `${book.author} · ${book.availableCopies}/${book.totalCopies} on shelf`
        : `${book.author} · all out`,
    href: `/catalogue/${book.id}`,
    tone: book.availableCopies > 0 ? "brand" : "ember",
  }));
  const items = [...bookItems, ...matchingPages];

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (trimmed.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results: Result[] };
        setResults(data.results);
        setActive(0);
      } catch {
        return;
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  function go(item: Item | undefined) {
    if (!item) {
      return;
    }

    close();
    router.push(item.href);
  }

  function onInputKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(items[active]);
    } else if (event.key === "Escape") {
      close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-muted hover:border-brand-light"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden md:inline">Search anything</span>
        <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold">
          Ctrl K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={close}
        >
          <div
            role="dialog"
            aria-label="Search"
            className="palette-in w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <SearchIcon className="h-5 w-5 text-brand" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search titles, authors, ISBNs, or jump to a page"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted"
              />
              {loading ? (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              ) : null}
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {items.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted">
                  {trimmed.length < 2 ? "Keep typing..." : "Nothing matched."}
                </li>
              ) : (
                items.map((item, index) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item)}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left ${
                        index === active ? "bg-brand/10" : ""
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{item.label}</span>
                        <span className="block truncate text-xs text-muted">{item.hint}</span>
                      </span>
                      {item.tone ? (
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            item.tone === "brand" ? "bg-brand" : "bg-ember"
                          }`}
                        />
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="flex gap-4 border-t border-line px-5 py-2.5 text-xs text-muted">
              <span>Up/Down to move</span>
              <span>Enter to open</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
