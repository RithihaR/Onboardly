// MODULE PAGE GOES HERE
// ModuleViewer content lives here

// app/onboarding/page.tsx
// English-only for now — language switching removed. Still fetches from
// the same API route, just always requests "en" and skips the language
// picker UI entirely.
 
// app/onboarding/page.tsx
// The Tailwind-styled version, with the widget added at the bottom so it
// floats on top of the page as an overlay — it does not sit inside the
// white content card, it's a sibling to it.

"use client";

import { useEffect, useState } from "react";
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

const WORKER_ID = "W-1001";
const WORKER_DISPLAY_NAME = "Jessie Jeyasingh";
const COMPANY_NAME = "Southern Cross Distribution";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function OnboardingPage() {
  const [moduleList, setModuleList] = useState<ModuleListItem[]>([]);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<ModuleDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingModule, setLoadingModule] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((data: ModuleListItem[]) => {
        setModuleList(data);
        setLoadingList(false);
      })
      .catch((err) => {
        console.error("Failed to load module list", err);
        setError("Could not load the module list.");
        setLoadingList(false);
      });
  }, []);

  useEffect(() => {
    if (moduleList.length === 0) return;
    const id = moduleList[index].id;
    setLoadingModule(true);
    setAcknowledged(false);
    setError(null);

    fetch(`/api/modules?id=${id}&language=en`)
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
  }, [moduleList, index]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleAcknowledge() {
    if (!current) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: WORKER_ID, moduleId: current.id }),
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
    return <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-400">No modules found — check the induction_modules table.</div>;
  }

  const isLast = index === moduleList.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <header className="flex items-center justify-between bg-zinc-950 text-white px-6 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center font-bold text-sm">
            SC
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wide font-semibold">
              {COMPANY_NAME}
            </div>
<<<<<<< HEAD

            <OnboardlyWidget moduleContent={current?.content} />
=======
            <div className="font-semibold text-sm leading-tight">
              {current?.title ?? "Loading…"}
            </div>
          </div>
>>>>>>> 7ee52e3c86fedfd24a064c7eb25d896a0c06dd84
        </div>

        <div className="hidden sm:flex flex-col items-center text-xs text-zinc-400">
          <span className="uppercase tracking-wide text-[10px]">Cumulative Time</span>
          <span className="font-mono text-zinc-200 text-sm">{formatTime(seconds)}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wide">Logged in as</div>
              <div className="text-zinc-100 text-sm font-medium">{WORKER_DISPLAY_NAME}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900">
        {loadingModule || !current ? (
          <div className="text-zinc-400">Loading module…</div>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 sm:p-10">
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">
              {current.category}
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">
              {current.title}
            </h1>
            <div className="whitespace-pre-wrap leading-relaxed text-zinc-700 text-[15px]">
              {current.content}
            </div>
          </div>
        )}
      </main>

      {error && (
        <div className="bg-red-950/60 text-red-300 text-sm px-6 py-2 border-t border-red-900">
          {error}
        </div>
      )}

      <footer className="bg-zinc-950 border-t border-zinc-800 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          {moduleList.map((m, i) => (
            <div
              key={m.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < index ? "bg-orange-500" : i === index ? "bg-red-500" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-300 border border-zinc-700 rounded-md px-4 py-2 disabled:opacity-30 disabled:cursor-default hover:not(:disabled):bg-zinc-800 transition-colors"
          >
            ← Previous
          </button>

          <div className="text-xs text-zinc-500 font-medium">
            Module {index + 1} of {moduleList.length}
          </div>

          {!acknowledged ? (
            <button
              onClick={handleAcknowledge}
              disabled={saving}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-md text-sm disabled:opacity-60 disabled:cursor-default transition-colors shadow-lg shadow-red-950/50"
            >
              {saving ? "Saving…" : "I understand this module"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isLast}
              className="bg-orange-500 hover:bg-orange-400 text-zinc-900 font-bold px-6 py-2.5 rounded-md text-sm disabled:opacity-40 disabled:cursor-default transition-colors shadow-lg shadow-orange-950/30"
            >
              {isLast ? "All modules complete ✓" : "Next module →"}
            </button>
          )}
        </div>
      </footer>

      <OnboardlyWidget />
    </div>
  );
}