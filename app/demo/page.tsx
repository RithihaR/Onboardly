// app/demo/page.tsx
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";

function TabCard({
  href, eyebrow, title, description, accentClass,
}: { href: string; eyebrow: string; title: string; description: string; accentClass: string }) {
  return (
    <Link href={href} className="block border border-zinc-200 hover:border-zinc-400 p-8 transition-colors flex-1">
      <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${accentClass}`}>{eyebrow}</div>
      <div className="text-2xl font-bold text-zinc-900 mb-3">{title}</div>
      <p className="text-zinc-600 text-sm leading-relaxed mb-6">{description}</p>
      <span className="text-sm font-semibold text-zinc-900">View this demo →</span>
    </Link>
  );
}

export default function DemoChooserPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <main className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-zinc-900 mb-3">Two industries, one onboarding engine</h1>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Same underlying product, dropped into two completely different
            companies' onboarding pages. Pick one to see it live.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <TabCard
            href="/onboarding/warehouse"
            eyebrow="Warehousing & Distribution"
            title="Southern Cross Distribution"
            description="A frontline warehouse operations onboarding flow — receiving stock, PPE, safety, and incident reporting."
            accentClass="text-orange-600"
          />
          <TabCard
            href="/onboarding/software"
            eyebrow="Software Engineering"
            title="Southern Cross Digital"
            description="A software engineering onboarding flow — engineering culture, dev workflow, and security/production practices."
            accentClass="text-emerald-600"
          />
        </div>
      </main>
    </div>
  );
}