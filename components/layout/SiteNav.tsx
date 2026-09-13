// components/layout/SiteNav.tsx
// One shared navbar for the marketing side of the site (landing, demo
// chooser, about, pitch). Use THIS everywhere instead of each page
// writing its own — that inconsistency was the bug causing the logo/links
// to "disappear" on some pages.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/demo", label: "Demo" },
  { href: "/about", label: "About Us" },
  { href: "/pitch", label: "Pitch Video" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-200">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-600" />
        <span className="font-bold text-lg text-zinc-900">Onboardly</span>
      </Link>
      <div className="flex items-center gap-8 text-sm font-medium text-zinc-600">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "text-zinc-900 font-semibold" : "hover:text-zinc-900"}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}