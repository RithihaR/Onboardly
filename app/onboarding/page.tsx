// app/onboarding/page.tsx
//
// PLACEHOLDER IMAGES — replace these five constants with your real assets
// once you have them. Everything else in the file references these, so
// swapping the URLs is the only change needed later.

"use client";
const COMPANY_LOGO_URL = "/warehouse-logo.png";
const AVATAR_URL = "/user (1).png";
const PREV_ARROW_URL = "/left.png";
const NEXT_ARROW_URL = "/right.png";
const MODULE_IMAGE_URL = "/warehouse-image.avif";



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
const WORKER_DISPLAY_NAME = "Jacob Nair Rudhrakumar Spiteri Jeyasingh";
const COMPANY_NAME = "Southern Cross Distribution";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function HeaderDivider() {
  // self-stretch makes it span the full height of the flex row it's in,
  // as long as the parent uses items-stretch (not items-center).
  return <div className="w-px self-stretch bg-white/30" />;
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
    <div className="min-h-screen flex flex-col">
      {/* Top bar — orange background, full-height dividers (items-stretch, not items-center) */}
      <header className="flex items-stretch justify-between bg-orange-600 text-white px-6 py-3 border-b border-orange-700 shrink-0">
        <div className="flex items-stretch gap-4">
          <div className="flex items-center gap-3">
            <img src={COMPANY_LOGO_URL} alt={COMPANY_NAME} className="w-10 h-10 object-contain shrink-0" />
            <div className="text-sm font-medium">{COMPANY_NAME}</div>
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
            <img src={AVATAR_URL} alt="Avatar" className="w-7 h-7 object-cover" />
            <div className="hidden md:block leading-tight">
              <div className="text-[10px]">Logged in as</div>
              <div className="text-sm font-medium">{WORKER_DISPLAY_NAME}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content — warehouse photo background with a dark overlay for legibility */}
      <main
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(9,14,30,0.78), rgba(9,14,30,0.88)), url('/warehouse.jfif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {loadingModule || !current ? (
          <div className="text-zinc-200">Loading module…</div>
        ) : (
          <div className="bg-white shadow-2xl max-w-3xl w-full p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-800 mb-6">
                {current.title}
              </h1>
              <div className="whitespace-pre-wrap leading-relaxed text-zinc-700 text-[15px]">
                {current.content}
              </div>
            </div>
            <img
              src={MODULE_IMAGE_URL}
              alt=""
              className="w-full sm:w-40 h-40 object-cover shrink-0"
            />
          </div>
        )}
      </main>

      {error && (
        <div className="bg-red-950/60 text-red-300 text-sm px-6 py-2 border-t border-red-900">
          {error}
        </div>
      )}

      {/* Bottom bar */}
      <footer className="bg-orange-600 border-t border-indigo-900 px-6 py-4 shrink-0">
        {/* Progress bar: white = progress made, orange = remaining */}
        <div className="flex items-center gap-2 mb-4">
          {moduleList.map((m, i) => (
            <div
              key={m.id}
              className={`h-1.5 flex-1 ${i <= index ? "bg-white" : "bg-indigo-900"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="disabled:opacity-30 disabled:cursor-default"
          >
            <img src={PREV_ARROW_URL} alt="Previous module" className="h-8" />
          </button>

          {!acknowledged ? (
            <button
              onClick={handleAcknowledge}
              disabled={saving}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 text-sm disabled:opacity-60 disabled:cursor-default transition-colors"
            >
              {saving ? "Saving…" : "I understand this module"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {isLast && <span className="text-white text-xs font-medium">All modules complete ✓</span>}
              <button
                onClick={handleNext}
                disabled={isLast}
                className="disabled:opacity-30 disabled:cursor-default"
              >
                <img src={NEXT_ARROW_URL} alt="Next module" className="h-8" />
              </button>
            </div>
          )}
        </div>
      </footer>

      <OnboardlyWidget />
    </div>
  );
}