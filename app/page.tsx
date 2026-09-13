// app/page.tsx
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <main className="max-w-3xl mx-auto px-8 py-24 text-center">
        <div className="text-orange-600 text-sm font-semibold tracking-wide uppercase mb-4">
          For businesses onboarding new employees
        </div>
        <h1 className="text-5xl font-bold text-zinc-900 mb-6 leading-tight">
          Onboarding that gets embedded, not adopted.
        </h1>
        <p className="text-lg text-zinc-600 mb-10 max-w-xl mx-auto">
          Onboardly drops into a business's existing onboarding site — no migration,
          no new platform for employees to learn. See it running as if it were
          already part of two real companies' onboarding pages.
        </p>
        <Link
          href="/demo"
          className="inline-block bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 text-base transition-colors"
        >
          View the demo →
        </Link>
      </main>
    </div>
  );
}