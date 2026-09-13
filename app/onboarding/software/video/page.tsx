// app/onboarding/software/video/page.tsx
// A standalone page for the Southern Cross Digital video module.
// Kept separate from OnboardingExperience.tsx on purpose since that
// shared component is being worked on elsewhere right now.

import Link from "next/link";

const YOUTUBE_VIDEO_ID = "i-QyW8D3ei0";

export default function SoftwareVideoModulePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <header className="flex items-center justify-between bg-slate-900 border-b border-slate-800 text-white px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/software-logo.png" alt="Southern Cross Digital" className="w-10 h-10 object-contain" />
          <div className="text-sm font-medium">Southern Cross Digital</div>
        </div>
        <Link href="/onboarding/software" className="text-sm text-emerald-400 hover:text-emerald-300">
          ← Back to modules
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="bg-white shadow-2xl max-w-3xl w-full p-8 sm:p-10">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Video Module</div>
          <h1 className="text-2xl font-bold text-emerald-700 mb-6">Engineering Culture Walkthrough</h1>

          <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 */ }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
              title="Engineering Culture Walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <p className="text-zinc-600 text-sm mt-6 leading-relaxed">
            Watch this short video, then head back to continue your onboarding modules.
          </p>

          <Link
            href="/onboarding/software"
            className="inline-block mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 text-sm transition-colors"
          >
            ← Back to modules
          </Link>
        </div>
      </main>
    </div>
  );
}