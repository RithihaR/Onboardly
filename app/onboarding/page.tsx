// MODULE PAGE GOES HERE
// ModuleViewer content lives here

// app/onboarding/page.tsx
// One page, walks through all modules in order using local state — no
// dynamic routing needed. Fetches the module list once, then fetches each
// module's full content as you navigate. Acknowledge writes real progress
// via /api/progress; Next only unlocks after acknowledging the current one.
 
"use client";
 
import { useEffect, useState } from "react";
 
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
  availableLanguages: string[];
}
 
// TODO: replace with the real logged-in worker's id once auth exists.
const WORKER_ID = "W-1001";
 
const LANGS = [
  { code: "en", label: "English" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "zh", label: "中文" },
];
 
export default function OnboardingPage() {
  const [moduleList, setModuleList] = useState<ModuleListItem[]>([]);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState("en");
  const [current, setCurrent] = useState<ModuleDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingModule, setLoadingModule] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  // 1. Load the ordered module list once on mount.
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
 
  // 2. Whenever the current index or language changes, fetch that module's content.
  useEffect(() => {
    if (moduleList.length === 0) return;
    const id = moduleList[index].id;
    setLoadingModule(true);
    setAcknowledged(false);
    setError(null);
 
    fetch(`/api/modules?id=${id}&language=${language}`)
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
  }, [moduleList, index, language]);
 
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
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading modules…</div>;
  }
  if (moduleList.length === 0) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>No modules found — check the induction_modules table.</div>;
  }
 
  const isLast = index === moduleList.length - 1;
 
  return (
    <div style={{ minHeight: "100vh", background: "#F4F1E9", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {loadingModule || !current ? (
          <div>Loading module…</div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B9791C", marginBottom: 6 }}>
              MODULE {index + 1} OF {moduleList.length} · {current.category?.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 600, color: "#1A1F26", marginBottom: 18 }}>
              {current.title}
            </div>
 
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {LANGS.map((l) => {
                const translated = l.code === "en" || current.availableLanguages.includes(l.code);
                return (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1px solid ${language === l.code ? "#E8A93B" : "#CBBFA0"}`,
                      background: language === l.code ? "rgba(232,169,59,0.15)" : "#fff",
                      color: language === l.code ? "#B9791C" : "#3A4150",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {l.label}
                    {!translated && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>(not translated yet)</span>}
                  </button>
                );
              })}
            </div>
 
            <div style={{ background: "#fff", border: "1px solid #E2DFD6", borderRadius: 10, padding: 30 }}>
              <div style={{ fontSize: 15.5, lineHeight: 1.75, color: "#242A31" }}>{current.content}</div>
            </div>
 
            {error && <div style={{ marginTop: 12, fontSize: 13, color: "#C0453B" }}>{error}</div>}
 
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button
                onClick={handlePrev}
                disabled={index === 0}
                style={{
                  background: "transparent", border: "1px solid #3A4150", color: "#1A1F26",
                  borderRadius: 6, padding: "10px 16px", fontWeight: 700,
                  cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.4 : 1,
                }}
              >
                ← Previous
              </button>
 
              {!acknowledged ? (
                <button
                  onClick={handleAcknowledge}
                  disabled={saving}
                  style={{
                    background: "#1A1F26", color: "#fff", border: "none", borderRadius: 6,
                    padding: "10px 20px", fontWeight: 700,
                    cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving…" : "I understand this module"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={isLast}
                  style={{
                    background: "#E8A93B", color: "#0E1116", border: "none", borderRadius: 6,
                    padding: "10px 20px", fontWeight: 700,
                    cursor: isLast ? "default" : "pointer", opacity: isLast ? 0.4 : 1,
                  }}
                >
                  {isLast ? "All modules complete ✓" : "Next module →"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}