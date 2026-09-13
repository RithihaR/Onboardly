// components/layout/SiteNav.tsx
// Now supports a `dark` variant for use over the landing page's dark hero,
// while staying the light version everywhere else (demo, about, pitch).

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/demo", label: "Demo" },
  { href: "/about", label: "About Us" },
  { href: "/pitch", label: "Pitch Video" },
];

export function SiteNav({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={`flex items-center justify-between px-8 py-5 ${
        dark ? "border-b border-white/10" : "border-b border-zinc-200"
      }`}
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-600" />
        <span className={`font-bold text-lg ${dark ? "text-white" : "text-zinc-900"}`}>Onboardly</span>
      </Link>
      <div className={`flex items-center gap-8 text-sm font-medium ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              pathname === l.href
                ? dark ? "text-white font-semibold" : "text-zinc-900 font-semibold"
                : dark ? "hover:text-white" : "hover:text-zinc-900"
            }
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}