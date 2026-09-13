// app/about/page.tsx
import { SiteNav } from "@/components/layout/SiteNav";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <main className="max-w-2xl mx-auto px-8 py-20">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">About Us</h1>

        <p className="text-zinc-700 leading-relaxed mb-6">
          {/* TODO: replace with your real mission statement */}
          Onboardly started from a simple observation: every business
          re-invents onboarding, and most of it — the confusion, the
          repeated questions, the modules nobody reads — looks the same
          regardless of industry. We built an onboarding engine that drops
          into a business's existing site instead of asking them to adopt
          a whole new platform.
        </p>

        <h2 className="text-xl font-bold text-zinc-900 mb-4 mt-10">The team</h2>
        <ul className="space-y-3 text-zinc-700">
          <li><span className="font-semibold">Jessie</span> — Product & Frontend</li>
          <li><span className="font-semibold">Rithu</span> — Frontend & Widget</li>
          <li><span className="font-semibold">Jenny</span> — Pitch & Full-Stack</li>
          <li><span className="font-semibold">Jake</span> — Backend & Infrastructure</li>
          <li><span className="font-semibold">Suryaja</span> — Data & Voice Integration</li>
        </ul>
      </main>
    </div>
  );
}