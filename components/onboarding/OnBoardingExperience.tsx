// components/onboarding/OnboardingExperience.tsx
//
// New in this version: a thin "demo meta bar" above the company-branded
// header, with a link back to the Onboardly site and a Fullscreen toggle.
// Clicking Fullscreen hides the meta bar and requests real browser
// fullscreen, so the demo looks exactly like what a business's actual
// onboarding page would show — no visible "this is a demo" chrome at all.
// A small always-visible exit control stays in the corner so there's
// never a dead end even in immersive mode.

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

// End-of-module quiz question, as served by GET /api/questions?moduleId=...
// (answer key already stripped server-side — see app/api/questions/route.ts).
type QuizQuestion =
  | { moduleId: string; type: "multiple_choice"; prompt: string; options: string[] }
  | { moduleId: string; type: "true_false"; prompt: string }
  | { moduleId: string; type: "free_text"; prompt: string };

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

  // End-of-module quiz gate: reading the content isn't enough to advance —
  // the quiz question for the current module (if one is configured) must
  // be answered correctly first. "content" = reading the module,
  // "quiz" = answering its question. Answering wrong just re-prompts; the
  // learner can always bail back to "content" to re-read before retrying.
  const [moduleView, setModuleView] = useState<"content" | "quiz">("content");
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
  const [freeTextAnswer, setFreeTextAnswer] = useState("");
  const [quizError, setQuizError] = useState<string | null>(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);

  useEffect(() => {
    fetch(`/api/modules?company=${config.companyId}`)
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
  }, [config.companyId]);

  useEffect(() => {
    if (moduleList.length === 0) return;
    const id = moduleList[index].id;
    setLoadingModule(true);
    setAcknowledged(false);
    setError(null);

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
  }, [moduleList, index, config.companyId]);

  // Load this module's quiz question (if any) and reset quiz UI state
  // whenever the module changes. If no question is configured for a
  // module, `question` stays null and the original "I understand this
  // module" flow is used for it instead of the quiz gate.
  useEffect(() => {
    if (moduleList.length === 0) return;
    const id = moduleList[index].id;
    setModuleView("content");
    setQuestion(null);
    setSelectedOption(null);
    setSelectedBool(null);
    setFreeTextAnswer("");
    setQuizError(null);

    fetch(`/api/questions?moduleId=${id}`)
      .then((r) => r.json())
      .then((data: QuizQuestion) => {
        if ((data as any).error) throw new Error((data as any).error);
        setQuestion(data);
      })
      .catch(() => {
        // No question configured for this module (or it failed to load) —
        // fall back to the plain acknowledge flow, nothing to gate on.
        setQuestion(null);
      });
  }, [moduleList, index]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Keep our `immersive` state in sync if the user exits fullscreen via
  // Esc or the browser's own UI, not just our own exit button.
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
      // Some browsers block this without a direct user gesture, or in
      // certain iframe contexts — the immersive UI still works either way,
      // it just won't be TRUE browser fullscreen in that case.
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

  const quizAnswerProvided =
    question?.type === "multiple_choice"
      ? selectedOption !== null
      : question?.type === "true_false"
      ? selectedBool !== null
      : question?.type === "free_text"
      ? freeTextAnswer.trim().length > 0
      : false;

  async function handleQuizSubmit() {
    if (!current || !question || !quizAnswerProvided) return;
    const answer =
      question.type === "multiple_choice"
        ? selectedOption
        : question.type === "true_false"
        ? selectedBool
        : freeTextAnswer;

    setCheckingAnswer(true);
    setQuizError(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: current.id, answer }),
      });
      const data = await res.json();
      if (data.correct) {
        await handleAcknowledge();
      } else {
        setQuizError("Not quite — try again, or go back to the module to review.");
      }
    } catch (err) {
      console.error("Failed to check quiz answer", err);
      setQuizError("Couldn't check your answer — try again.");
    } finally {
      setCheckingAnswer(false);
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

  return (
    <div className="min-h-screen flex flex-col relative">
      {!immersive && <DemoMetaBar onEnterFullscreen={enterFullscreen} />}

      {/* Always-visible tiny exit control, even in immersive mode — never a dead end */}
      {immersive && (
        <button
          onClick={exitFullscreen}
          className="fixed top-2 right-2 z-60 bg-black/40 hover:bg-black/60 text-white text-xs px-2.5 py-1 rounded-none"
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
        ) : moduleView === "quiz" && question ? (
          <div className="bg-white shadow-2xl max-w-3xl w-full p-8 sm:p-10 flex flex-col gap-6">
            <div>
              <div className="text-xs font-semibold text-zinc-500 mb-2 tracking-wide">QUICK CHECK</div>
              <h2 className={`text-xl font-bold ${theme.title}`}>{question.prompt}</h2>
            </div>

            {question.type === "multiple_choice" && (
              <div className="flex flex-col gap-2">
                {question.options.map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 border border-zinc-300 rounded px-3 py-2 cursor-pointer hover:bg-zinc-50"
                  >
                    <input
                      type="radio"
                      name="quiz-option"
                      checked={selectedOption === i}
                      onChange={() => setSelectedOption(i)}
                    />
                    <span className="text-zinc-700 text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === "true_false" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedBool(true)}
                  className={`px-6 py-2 text-sm font-medium border rounded ${
                    selectedBool === true ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-700"
                  }`}
                >
                  True
                </button>
                <button
                  onClick={() => setSelectedBool(false)}
                  className={`px-6 py-2 text-sm font-medium border rounded ${
                    selectedBool === false ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-700"
                  }`}
                >
                  False
                </button>
              </div>
            )}

            {question.type === "free_text" && (
              <textarea
                value={freeTextAnswer}
                onChange={(e) => setFreeTextAnswer(e.target.value)}
                rows={4}
                placeholder="Type your answer…"
                className="border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-700"
              />
            )}

            {quizError && <div className="text-red-600 text-sm">{quizError}</div>}

            <div className="flex items-center gap-4">
              <button
                onClick={handleQuizSubmit}
                disabled={!quizAnswerProvided || checkingAnswer}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 text-sm disabled:opacity-60 disabled:cursor-default transition-colors"
              >
                {checkingAnswer ? "Checking…" : "Submit answer"}
              </button>
              <button
                onClick={() => setModuleView("content")}
                className="text-sm text-zinc-500 underline hover:text-zinc-700"
              >
                ← Back to module
              </button>
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
            moduleView === "quiz" ? (
              // Submit / Back to module controls live on the quiz card itself.
              <span className="text-white/70 text-xs">Answer the question above to continue</span>
            ) : question ? (
              <button
                onClick={() => setModuleView("quiz")}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 text-sm transition-colors"
              >
                Continue to quiz →
              </button>
            ) : (
              <button
                onClick={handleAcknowledge}
                disabled={saving}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 text-sm disabled:opacity-60 disabled:cursor-default transition-colors"
              >
                {saving ? "Saving…" : "I understand this module"}
              </button>
            )
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