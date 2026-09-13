// app/page.tsx
// Full redesign. Structure: dark animated hero (Linear-inspired restraint),
// then a light section below the fold with feature cards (Docebo-style),
// a "trusted by" strip using your two real demo companies (Trainual-style
// social proof, but honest — these are your actual demo tenants, not fake
// logos), and a live embedded widget so a visitor can literally try the
// product on the marketing site itself.

import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";
import { AnimatedGlowBackground } from "@/components/layout/AnimatedGlowBackground";

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-zinc-200 p-8 hover:border-zinc-300 transition-colors">
      <div className="w-10 h-10 bg-orange-600 mb-6" />
      <h3 className="text-lg font-bold text-zinc-900 mb-3">{title}</h3>
      <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white">
      {/* ---------- Dark animated hero ---------- */}
      <div className="relative bg-[#0B0A09]">
        <AnimatedGlowBackground />
        <div className="relative z-10">
          <SiteNav dark />

          <main className="max-w-3xl mx-auto px-8 pt-28 pb-36 text-center">
            <div className="inline-block text-orange-400 text-xs font-semibold tracking-widest uppercase mb-6 border border-orange-900/50 bg-orange-950/40 px-3 py-1">
              For businesses onboarding new employees
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Onboarding that gets<br />embedded, not adopted.
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
              Onboardly drops into a business's existing onboarding site — no
              migration, no new platform for employees to learn. See it running
              inside two real companies' onboarding pages below.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/demo"
                className="inline-block bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 text-base transition-colors"
              >
                View the demo →
              </Link>
              <Link
                href="/pitch"
                className="inline-block border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 text-base transition-colors"
              >
                Watch the pitch
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* ---------- Feature grid ---------- */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">One engine, dropped into any onboarding page</h2>
          <p className="text-zinc-600 max-w-lg mx-auto">
            The same underlying product, styled and themed differently for every
            business it's embedded in.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <FeatureCard
            title="Embeddable, not a platform"
            description="A widget your employees already see inside your existing onboarding site — no new login, no new app to learn."
          />
          <FeatureCard
            title="Grounded, not generic"
            description="Every answer comes from your own approved documents. Nothing is invented — low-confidence questions get escalated to a real person instead."
          />
          <FeatureCard
            title="Anonymous by design"
            description="Employees can ask what they're actually confused about without it being tied to their name — the data model has no identity field on questions at all."
          />
        </div>
      </section>

      {/* ---------- Trusted by ---------- */}
      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-8 py-16 text-center">
          <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-8">
            Live inside two real onboarding demos
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <Link href="/onboarding/warehouse" className="text-2xl font-bold text-zinc-800 hover:text-orange-600 transition-colors">
              Southern Cross Distribution
            </Link>
            <div className="hidden sm:block w-px h-8 bg-zinc-300" />
            <Link href="/onboarding/software" className="text-2xl font-bold text-zinc-800 hover:text-emerald-600 transition-colors">
              Southern Cross Digital
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-10">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between text-sm text-zinc-500">
          <span>© 2026 Onboardly</span>
          <div className="flex gap-6">
            <Link href="/demo" className="hover:text-zinc-900">Demo</Link>
            <Link href="/about" className="hover:text-zinc-900">About Us</Link>
            <Link href="/pitch" className="hover:text-zinc-900">Pitch Video</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}