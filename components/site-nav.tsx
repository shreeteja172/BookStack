import Link from "next/link";
import { LogoMark } from "./icons";
import { SignOutButton } from "./sign-out-button";

type SiteNavProps = {
  email: string;
  librarian: boolean;
};

export function SiteNav({ email, librarian }: SiteNavProps) {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/catalogue", label: "Catalogue" },
    ...(librarian
      ? [
          { href: "/circulation", label: "Circulation" },
          { href: "/analytics", label: "Analytics" },
          { href: "/members", label: "Members" },
        ]
      : []),
  ];

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-12">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <LogoMark className="h-5 w-5" />
            </span>
            BookStack
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">{email}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
