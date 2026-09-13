// components/onboarding/OnboardingExperience.tsx
//
// New in this version: an optional `videoModule` on CompanyConfig. If set,
// it's appended as a synthetic final step in the flow — clicking "next"
// past the last real module reveals it, inside the same header/footer/
// progress bar as everything else, instead of being a separate page only
// reachable by typing a URL.
//
// The video step is NOT a real row in your induction_modules table, so:
// - it's added client-side after the real module list loads
// - its content is never fetched from /api/modules
// - acknowledging it does NOT call /api/progress (there's no real module
//   id for it to reference, and your module_progress table likely has a
//   foreign key to induction_modules — calling it would just error)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OnboardlyWidget from "@/components/onboardly-widget/OnboardlyWidget";

interface ModuleListItem {
  id: string;
  title: string;
  display_order: number;
}

interface ModuleDetail {
  id: string;
  title: string;
  order: number;
  version: string;
  category: string;
  content: string;
}

export interface CompanyConfig {
  companyId: string;
  companyName: string;
  workerId: string;
  workerDisplayName: string;
  theme: "orange" | "slate";
  logoUrl: string;
  avatarUrl: string;
  prevArrowUrl: string;
  nextArrowUrl: string;
  moduleImageUrl: string;
  backgroundImageUrl: string;
  videoModule?: { title: string; youtubeId: string }; // optional final video step
}

const THEMES = {
  orange: {
    bar: "bg-orange-600 border-orange-700",
    progressTrack: "bg-indigo-900",
    title: "text-blue-800",
  },
  slate: {
    bar: "bg-slate-900 border-slate-800",
    progressTrack: "bg-slate-700",
    title: "text-emerald-600",
  },
};

const VIDEO_MODULE_ID = "video-module";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function HeaderDivider() {
  return <div className="w-px self-stretch bg-white/30" />;
}

function DemoMetaBar({ onEnterFullscreen }: { onEnterFullscreen: () => void }) {
  return (
    <div className="flex items-center justify-between bg-zinc-950 text-zinc-300 text-xs px-4 py-1.5 shrink-0">
      <Link href="/demo" className="hover:text-white flex items-center gap-1">
        ← Back to Onboardly demo
      </Link>
      <button onClick={onEnterFullscreen} className="hover:text-white flex items-center gap-1">
        ⛶ Fullscreen
      </button>
    </div>
  );
}

export function OnboardingExperience({ config }: { config: CompanyConfig }) {
  const theme = THEMES[config.theme];

  const [moduleList, setModuleList] = useState<ModuleListItem[]>([]);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<ModuleDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingModule, setLoadingModule] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [immersive, setImmersive] = useState(false);

  useEffect(() => {
    fetch(`/api/modules?company=${config.companyId}`)
      .then((r) => r.json())
      .then((data: ModuleListItem[]) => {
        const list: ModuleListItem[] = config.videoModule
          ? [...data, { id: VIDEO_MODULE_ID, title: config.videoModule.title, display_order: data.length + 1 }]
          : data;
        setModuleList(list);
        setLoadingList(false);
      })
      .catch((err) => {
        console.error("Failed to load module list", err);
        setError("Could not load the module list.");
        setLoadingList(false);
      });
  }, [config.companyId, config.videoModule]);

  useEffect(() => {
    if (moduleList.length === 0) return;
    const id = moduleList[index].id;
    setAcknowledged(false);
    setError(null);

    // The video step is synthetic, not a real module — never hit the API for it.
    if (id === VIDEO_MODULE_ID && config.videoModule) {
      setCurrent({
        id: VIDEO_MODULE_ID,
        title: config.videoModule.title,
        order: index + 1,
        version: "",
        category: "Video",
        content: "",
      });
      setLoadingModule(false);
      return;
    }

    setLoadingModule(true);
    fetch(`/api/modules?id=${id}&language=en&company=${config.companyId}`)
      .then((r) => r.json())
      .then((data: ModuleDetail) => {
        if ((data as any).error) throw new Error((data as any).error);
        setCurrent(data);
      })
      .catch((err) => {
        console.error("Failed to load module", err);
        setError("Could not load this module.");
      })
      .finally(() => setLoadingModule(false));
  }, [moduleList, index, config.companyId, config.videoModule]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onFsChange() {
      if (!document.fullscreenElement) setImmersive(false);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn("Fullscreen request failed, continuing in immersive UI only:", err);
    }
    setImmersive(true);
  }

  async function exitFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setImmersive(false);
  }

  async function handleAcknowledge() {
    if (!current) return;

    // Synthetic video step: no real module row to save progress against.
    if (current.id === VIDEO_MODULE_ID) {
      setAcknowledged(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: config.workerId, moduleId: current.id }),
      });
      if (!res.ok) throw new Error("Progress save failed");
      setAcknowledged(true);
    } catch (err) {
      console.error("Failed to save acknowledgement", err);
      setError("Couldn't save your acknowledgement — try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleNext() {
    setIndex((i) => Math.min(i + 1, moduleList.length - 1));
  }
  function handlePrev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  if (loadingList) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-400">Loading modules…</div>;
  }
  if (moduleList.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-400">No modules found for {config.companyName}.</div>;
  }

  const isLast = index === moduleList.length - 1;
  const isVideoStep = current?.id === VIDEO_MODULE_ID;

  return (
    <div className="min-h-screen flex flex-col relative">
      {!immersive && <DemoMetaBar onEnterFullscreen={enterFullscreen} />}

      {immersive && (
        <button
          onClick={exitFullscreen}
          className="fixed top-2 right-2 z-[60] bg-black/40 hover:bg-black/60 text-white text-xs px-2.5 py-1 rounded-none"
        >
          ✕ Exit
        </button>
      )}

      <header className={`flex items-stretch justify-between text-white px-6 py-3 border-b shrink-0 ${theme.bar}`}>
        <div className="flex items-stretch gap-4">
          <div className="flex items-center gap-3">
            <img src={config.logoUrl} alt={config.companyName} className="w-10 h-10 object-contain shrink-0" />
            <div className="text-sm font-medium">{config.companyName}</div>
          </div>

          <HeaderDivider />

          <div className="flex items-center gap-4">
            {current && <span className="font-semibold text-sm">{current.title}</span>}
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-[10px]">Cumulative Time</span>
              <span className="font-mono text-sm">{formatTime(seconds)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-stretch gap-4">
          <HeaderDivider />
          <div className="flex items-center gap-2">
            <img src={config.avatarUrl} alt="Avatar" className="w-7 h-7 object-cover" />
            <div className="hidden md:block leading-tight">
              <div className="text-[10px]">Logged in as</div>
              <div className="text-sm font-medium">{config.workerDisplayName}</div>
            </div>
          </div>
        </div>
      </header>

      <main
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{
          backgroundImage: `linear-gradient(rgba(9,14,30,0.78), rgba(9,14,30,0.88)), url('${config.backgroundImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {loadingModule || !current ? (
          <div className="text-zinc-200">Loading module…</div>
        ) : isVideoStep && config.videoModule ? (
          <div className="bg-white shadow-2xl max-w-3xl w-full p-8 sm:p-10">
            <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${theme.title}`}>Video</div>
            <h1 className={`text-2xl font-bold mb-6 ${theme.title}`}>{current.title}</h1>
            <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 */ }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${config.videoModule.youtubeId}`}
                title={current.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-2xl max-w-3xl w-full p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-1">
              <h1 className={`text-2xl font-bold mb-6 ${theme.title}`}>{current.title}</h1>
              <div className="whitespace-pre-wrap leading-relaxed text-zinc-700 text-[15px]">
                {current.content}
              </div>
            </div>
            <img src={config.moduleImageUrl} alt="" className="w-full sm:w-40 h-40 object-cover shrink-0" />
          </div>
        )}
      </main>

      {error && (
        <div className="bg-red-950/60 text-red-300 text-sm px-6 py-2 border-t border-red-900">{error}</div>
      )}

      <footer className={`border-t px-6 py-4 shrink-0 ${theme.bar}`}>
        <div className="flex items-center gap-2 mb-4">
          {moduleList.map((m, i) => (
            <div key={m.id} className={`h-1.5 flex-1 ${i <= index ? "bg-white" : theme.progressTrack}`} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={handlePrev} disabled={index === 0} className="disabled:opacity-30 disabled:cursor-default">
            <img src={config.prevArrowUrl} alt="Previous module" className="h-8" />
          </button>

          {!acknowledged ? (
            <button
              onClick={handleAcknowledge}
              disabled={saving}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 text-sm disabled:opacity-60 disabled:cursor-default transition-colors"
            >
              {saving ? "Saving…" : isVideoStep ? "I've watched this" : "I understand this module"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {isLast && <span className="text-white text-xs font-medium">All modules complete ✓</span>}
              <button onClick={handleNext} disabled={isLast} className="disabled:opacity-30 disabled:cursor-default">
                <img src={config.nextArrowUrl} alt="Next module" className="h-8" />
              </button>
            </div>
          )}
        </div>
      </footer>

      <OnboardlyWidget moduleContent={current?.content} />
    </div>
  );
}