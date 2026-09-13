"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import FaqPanel from "./FaqPanel";

const OB = {
    border: "#D7E0C9",
    cream: "#FFFFFF",
    text: "#16233D",
    textMuted: "#5C6B7A",
    dotRed: "#C1794F",
    sand: "#DDE5D0",
};

const cursive = { fontFamily: "'Caveat', 'Segoe Script', cursive" };
const body = { fontFamily: "'Inter', sans-serif" };
const disp = { fontFamily: "'Fraunces', serif" };

function useOnboardlyFonts() {
    useEffect(() => {
        if (document.getElementById("ob-widget-fonts")) return;
        const link = document.createElement("link");
        link.id = "ob-widget-fonts";
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&display=swap";
        document.head.appendChild(link);
    }, []);
}

// ---------- Typewriter effect for the welcome screen ----------
function useTypewriter(lines: string[], speedMs = 22) {
    const [displayed, setDisplayed] = useState<string[]>([]);
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed([]);
        setDone(false);
        let lineIndex = 0;
        let charIndex = 0;
        let cancelled = false;

        function step() {
            if (cancelled) return;
            if (lineIndex >= lines.length) {
                setDone(true);
                return;
            }
            const currentLine = lines[lineIndex];
            charIndex++;
            setDisplayed((prev) => {
                const next = [...prev];
                next[lineIndex] = currentLine.slice(0, charIndex);
                return next;
            });
            if (charIndex >= currentLine.length) {
                lineIndex++;
                charIndex = 0;
                setTimeout(step, 350);
            } else {
                setTimeout(step, speedMs);
            }
        }

        step();
        return () => {
            cancelled = true;
        };
    }, [lines, speedMs]);

    return { displayed, done };
}

// ---------- Language data ----------
const TOP_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "zh", label: "Mandarin" },
    { code: "ar", label: "Arabic" },
    { code: "vi", label: "Vietnamese" },
    { code: "pa", label: "Punjabi" },
    { code: "hi", label: "Hindi" },
];

const MORE_LANGUAGES = [
    { code: "af", label: "Afrikaans" }, { code: "hy", label: "Armenian" },
    { code: "bn", label: "Bengali" }, { code: "bg", label: "Bulgarian" },
    { code: "ca", label: "Catalan" }, { code: "hr", label: "Croatian" },
    { code: "cs", label: "Czech" }, { code: "da", label: "Danish" },
    { code: "nl", label: "Dutch" }, { code: "fil", label: "Filipino" },
    { code: "fi", label: "Finnish" }, { code: "fr", label: "French" },
    { code: "ka", label: "Georgian" }, { code: "de", label: "German" },
    { code: "el", label: "Greek" }, { code: "gu", label: "Gujarati" },
    { code: "he", label: "Hebrew" }, { code: "hu", label: "Hungarian" },
    { code: "id", label: "Indonesian" }, { code: "it", label: "Italian" },
    { code: "ja", label: "Japanese" }, { code: "kn", label: "Kannada" },
    { code: "ko", label: "Korean" }, { code: "ms", label: "Malay" },
    { code: "ml", label: "Malayalam" }, { code: "mr", label: "Marathi" },
    { code: "ne", label: "Nepali" }, { code: "no", label: "Norwegian" },
    { code: "fa", label: "Persian" }, { code: "pl", label: "Polish" },
    { code: "pt", label: "Portuguese" }, { code: "ro", label: "Romanian" },
    { code: "ru", label: "Russian" }, { code: "es", label: "Spanish" },
    { code: "sw", label: "Swahili" }, { code: "sv", label: "Swedish" },
    { code: "ta", label: "Tamil" }, { code: "te", label: "Telugu" },
    { code: "th", label: "Thai" }, { code: "tr", label: "Turkish" },
    { code: "uk", label: "Ukrainian" }, { code: "ur", label: "Urdu" },
].sort((a, b) => a.label.localeCompare(b.label));

const ALL_LANGUAGES = [...TOP_LANGUAGES, ...MORE_LANGUAGES];
function languageLabel(code: string) {
    return ALL_LANGUAGES.find((l) => l.code === code)?.label ?? "English";
}

// ---------- Mic level meter ----------
const IDLE_BARS = [10, 22, 14, 26, 12, 20, 16, 24, 11, 18];
const MIN_BAR_HEIGHT = 4;
const MAX_BAR_HEIGHT = 32;
const BAR_WEIGHTS = [0.5, 0.8, 0.65, 1, 0.55, 0.9, 0.6, 0.95, 0.5, 0.75];

function useMicLevels(active: boolean) {
    const [levels, setLevels] = useState<number[]>(IDLE_BARS);
    const [micError, setMicError] = useState<string | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!active) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            audioCtxRef.current?.close().catch(() => { });
            audioCtxRef.current = null;
            analyserRef.current = null;
            streamRef.current = null;
            setLevels(IDLE_BARS);
            return;
        }
        let cancelled = false;
        async function start() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioCtxRef.current = audioCtx;
                const source = audioCtx.createMediaStreamSource(stream);
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyserRef.current = analyser;
                const dataArray = new Uint8Array(analyser.fftSize);

                function tick() {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteTimeDomainData(dataArray);
                    let sumSquares = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        const normalized = (dataArray[i] - 128) / 128;
                        sumSquares += normalized * normalized;
                    }
                    const volume = Math.sqrt(sumSquares / dataArray.length);
                    const next = BAR_WEIGHTS.map((weight) => {
                        const height = MIN_BAR_HEIGHT + volume * weight * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * 3;
                        return Math.round(Math.min(MAX_BAR_HEIGHT, Math.max(MIN_BAR_HEIGHT, height)));
                    });
                    setLevels(next);
                    rafRef.current = requestAnimationFrame(tick);
                }
                tick();
            } catch (err) {
                console.error("Mic access failed", err);
                setMicError("Couldn't access the microphone. Check your browser permissions.");
            }
        }
        start();
        return () => {
            cancelled = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            audioCtxRef.current?.close().catch(() => { });
        };
    }, [active]);

    return { levels, micError };
}

function Waveform({ levels, listening, onClick }: { levels: number[]; listening: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-label={listening ? "Stop listening" : "Click to speak"}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, height: 48, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}
        >
            {levels.map((h, i) => (
                <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: listening ? OB.dotRed : OB.text, transition: listening ? "none" : "height 0.15s ease" }} />
            ))}
        </button>
    );
}

// ---------- Language picker ----------
function LanguagePicker({ onSelect }: { onSelect: (code: string) => void }) {
    const [query, setQuery] = useState("");
    const filtered = useMemo(
        () => (query.trim() ? MORE_LANGUAGES.filter((l) => l.label.toLowerCase().includes(query.toLowerCase())) : MORE_LANGUAGES),
        [query]
    );

    return (
        <div style={{ padding: "0 18px 16px", flex: 1, overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {TOP_LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => onSelect(lang.code)}
                        style={{ ...body, fontSize: 13, fontWeight: 600, padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${OB.border}`, background: "#fff", color: OB.text, cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = OB.sand)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>

            <p style={{ ...body, fontSize: 10.5, color: OB.textMuted, textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 8px" }}>
                More languages
            </p>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                style={{ ...body, width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 999, border: `1.5px solid ${OB.border}`, fontSize: 12.5, marginBottom: 8 }}
            />
            <div style={{ maxHeight: 130, overflowY: "auto", border: `1px solid ${OB.border}`, borderRadius: 8 }}>
                {filtered.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => onSelect(lang.code)}
                        style={{ ...body, display: "block", width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 12.5, color: OB.text, background: "none", border: "none", borderBottom: `1px solid ${OB.sand}`, cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = OB.sand)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                        {lang.label}
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div style={{ ...body, fontSize: 12, color: OB.textMuted, padding: "10px 12px" }}>No matches.</div>
                )}
            </div>
        </div>
    );
}

// ---------- Main widget ----------
type Screen = "welcome" | "language" | "main";

interface OnboardlyWidgetProps {
    language?: string;
    moduleContent?: string;
    workerId?: string;
    onAskQuestion?: (question: string, moduleContent?: string) => void;
}

const WELCOME_LINES = [
    "Hi, I'm your Onboardly assistant.",
    "I'll walk you through your training and answer any questions along the way.",
];

export default function OnboardlyWidget({ moduleContent, workerId, onAskQuestion }: OnboardlyWidgetProps) {
    useOnboardlyFonts();

    const [expanded, setExpanded] = useState(true);
    const [screen, setScreen] = useState<Screen>("welcome");
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [view, setView] = useState<"ask" | "faq">("ask");
    const [question, setQuestion] = useState("");
    const [listening, setListening] = useState(false);

    // ---- Q&A pipeline state ----
    interface Turn {
        question: string;
        answer: string | null;
        escalated: boolean;
        audioUrl: string | null;
        error: string | null;
    }
    const [turns, setTurns] = useState<Turn[]>([]);
    const [thinking, setThinking] = useState(false);
    const [sttError, setSttError] = useState<string | null>(null);
    const audioElRef = useRef<HTMLAudioElement | null>(null);
    const conversationRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to the newest message whenever the conversation grows or
    // a new answer streams in — otherwise new turns land below the fold and
    // it looks like the question/answer just vanished.
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [turns, thinking]);

    useEffect(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem("onboardly_language") : null;
        if (saved) {
            setSelectedLanguage(saved);
            setScreen("main");
        }
    }, []);

    function chooseLanguage(code: string) {
        setSelectedLanguage(code);
        localStorage.setItem("onboardly_language", code);
        setScreen("main");
    }

    const { displayed, done } = useTypewriter(WELCOME_LINES);

    const { levels, micError } = useMicLevels(listening);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Position (drag to move)
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const dragOffset = useRef<{ x: number; y: number } | null>(null);
    const [dragging, setDragging] = useState(false);
    const dragMovedRef = useRef(false);

    // Size (drag corner to resize)
    const [size, setSize] = useState({ width: 340, height: 460 });
    const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const [resizing, setResizing] = useState(false);

    useEffect(() => {
        if (pos) return;
        const w = expanded ? size.width : 56;
        const h = expanded ? size.height : 56;
        setPos({ x: window.innerWidth - w - 28, y: window.innerHeight - h - 28 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onDragStart = useCallback(
        (e: React.MouseEvent) => {
            if (!pos) return;
            dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            dragMovedRef.current = false;
            setDragging(true);
        },
        [pos]
    );

    useEffect(() => {
        if (!dragging) return;
        function onMove(e: MouseEvent) {
            if (!dragOffset.current) return;
            dragMovedRef.current = true;
            setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        }
        function onUp() {
            setDragging(false);
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [dragging]);

    const onResizeStart = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
            setResizing(true);
        },
        [size]
    );

    useEffect(() => {
        if (!resizing) return;
        function onMove(e: MouseEvent) {
            if (!resizeStart.current) return;
            const dx = e.clientX - resizeStart.current.x;
            const dy = e.clientY - resizeStart.current.y;
            setSize({
                width: Math.min(520, Math.max(280, resizeStart.current.w + dx)),
                height: Math.min(680, Math.max(340, resizeStart.current.h + dy)),
            });
        }
        function onUp() {
            setResizing(false);
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [resizing]);

    // ---- Speak a piece of text via /api/tts and play it ----
    async function speak(text: string): Promise<string | null> {
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, language: selectedLanguage, mode: "answer" }),
            });
            if (!res.ok) throw new Error("TTS request failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            if (audioElRef.current) {
                audioElRef.current.src = url;
                // Autoplay may be blocked after an await — that's fine, the 🔊
                // replay button per message is the reliable fallback.
                audioElRef.current.play().catch(() => { });
            }
            return url;
        } catch (err) {
            console.error("Speak failed", err);
            return null;
        }
    }

    function replayAudio(url: string) {
        if (audioElRef.current) {
            audioElRef.current.src = url;
            audioElRef.current.currentTime = 0;
            audioElRef.current.play().catch((err) => console.error("Replay failed", err));
        }
    }

    // ---- Ask a question: /api/explain, grounded in moduleContent ----
    async function askQuestion(text: string) {
        if (!text.trim()) return;
        onAskQuestion?.(text, moduleContent);

        // History sent to Gemini = completed turns so far, oldest first.
        const historyForGemini = turns
            .filter((t) => t.answer !== null)
            .map((t) => ({ question: t.question, answer: t.answer as string }));

        const turnIndex = turns.length;
        setTurns((prev) => [...prev, { question: text, answer: null, escalated: false, audioUrl: null, error: null }]);
        setThinking(true);

        try {
            const res = await fetch("/api/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: text,
                    context: moduleContent || "",
                    language: selectedLanguage,
                    workerId,
                    history: historyForGemini,
                }),
            });
            const data = await res.json();

            if (data.error) throw new Error(data.message || data.error);

            const finalText = data.escalate ? data.message : data.answer;
            const audioUrl = await speak(finalText);

            setTurns((prev) => {
                const next = [...prev];
                next[turnIndex] = {
                    ...next[turnIndex],
                    answer: finalText,
                    escalated: !!data.escalate,
                    audioUrl,
                };
                return next;
            });
        } catch (err) {
            console.error("Ask question failed", err);
            setTurns((prev) => {
                const next = [...prev];
                next[turnIndex] = {
                    ...next[turnIndex],
                    error: "Sorry, I couldn't get an answer right now. Please try again.",
                };
                return next;
            });
        } finally {
            setThinking(false);
        }
    }

    // ---- Mic: record, send to /api/stt, then feed transcript into askQuestion ----
    async function toggleListening() {
        if (listening) {
            setListening(false);
            const recorder = mediaRecorderRef.current;
            if (recorder && recorder.state !== "inactive") recorder.stop();
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            chunksRef.current = [];
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });

                setThinking(true);
                setSttError(null);
                try {
                    const form = new FormData();
                    form.append("audio", blob, "question.webm");
                    form.append("language", selectedLanguage);
                    const res = await fetch("/api/stt", { method: "POST", body: form });
                    const data = await res.json();
                    if (data.error) throw new Error(data.message || data.error);
                    if (data.text) {
                        await askQuestion(data.text);
                    } else {
                        setThinking(false);
                        setSttError("Didn't catch that — try again.");
                    }
                } catch (err) {
                    console.error("STT failed", err);
                    setThinking(false);
                    setSttError("Couldn't transcribe that — try typing instead.");
                }
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setListening(true);
        } catch (err) {
            console.error("Could not start recording", err);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!question.trim()) return;
        askQuestion(question);
        setQuestion("");
    }

    if (!pos) return null;

    // ---------- Collapsed bubble ----------
    if (!expanded) {
        return (
            <button
                onClick={() => {
                    if (dragMovedRef.current) return;
                    setExpanded(true);
                }}
                onMouseDown={onDragStart}
                aria-label="Open Onboardly assistant"
                style={{
                    position: "fixed", left: pos.x, top: pos.y, width: 56, height: 56, borderRadius: "50%",
                    background: OB.cream, border: `1px solid ${OB.border}`, boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    color: OB.text, cursor: dragging ? "grabbing" : "grab", ...cursive, fontSize: 20, fontWeight: 700,
                }}
            >
                OB
            </button>
        );
    }

    return (
        <div
            style={{
                position: "fixed", left: pos.x, top: pos.y, width: size.width, height: size.height,
                background: OB.cream, border: `1px solid ${OB.border}`, borderRadius: 14, overflow: "hidden",
                boxShadow: "0 8px 28px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column",
            }}
        >
            <audio ref={audioElRef} style={{ display: "none" }} />

            {/* Title bar */}
            <div
                onMouseDown={onDragStart}
                style={{ padding: "14px 16px 10px", cursor: dragging ? "grabbing" : "grab", userSelect: "none", position: "relative", flexShrink: 0 }}
            >
                <button
                    onClick={() => setExpanded(false)}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="Minimize assistant"
                    style={{
                        position: "absolute", top: 14, left: 16, width: 22, height: 22, borderRadius: "50%",
                        border: `1.5px solid ${OB.border}`, background: "none", color: OB.textMuted, fontSize: 13,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    ×
                </button>

                {screen === "main" && (
                    <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: 6 }}>
                        <button
                            onClick={() => setScreen("language")}
                            onMouseDown={(e) => e.stopPropagation()}
                            aria-label="Change language"
                            title="Change language"
                            style={{
                                width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${OB.border}`,
                                background: "none", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            🌐
                        </button>
                        <button
                            onClick={() => setView(view === "faq" ? "ask" : "faq")}
                            onMouseDown={(e) => e.stopPropagation()}
                            aria-label="Frequently asked questions"
                            style={{
                                width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${OB.text}`,
                                background: view === "faq" ? OB.text : "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <span style={{ color: view === "faq" ? OB.cream : OB.text }}>?</span>
                        </button>
                    </div>
                )}

                <div style={{ textAlign: "center" }}>
                    <span style={{ ...cursive, fontSize: 26, color: OB.text, borderBottom: `2px solid ${OB.text}`, paddingBottom: 2 }}>
                        OnBoardly
                    </span>
                </div>
            </div>

            {/* Screens */}
            {screen === "welcome" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 20px", overflowY: "auto" }}>
                    <div
                        style={{
                            width: 64, height: 64, borderRadius: "50%", background: OB.sand, border: `1.5px solid ${OB.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, ...cursive, fontSize: 24, color: OB.text,
                        }}
                    >
                        OB
                    </div>
                    <div style={{ minHeight: 70, textAlign: "center", marginBottom: 20 }}>
                        {WELCOME_LINES.map((_, i) => (
                            <p key={i} style={{ ...body, fontSize: 13.5, color: OB.text, lineHeight: 1.6, margin: "0 0 8px" }}>
                                {displayed[i] || "\u00A0"}
                            </p>
                        ))}
                    </div>
                    <button
                        onClick={() => setScreen("language")}
                        disabled={!done}
                        style={{
                            ...disp, background: "#14181F", color: "#fff", border: "none", borderRadius: 999,
                            padding: "11px 28px", fontSize: 13.5, fontWeight: 600, cursor: done ? "pointer" : "default",
                            opacity: done ? 1 : 0.4, transition: "opacity 0.2s",
                        }}
                    >
                        Continue
                    </button>
                </div>
            )}

            {screen === "language" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <LanguagePicker onSelect={chooseLanguage} />
                </div>
            )}

            {screen === "main" && (
                view === "faq" ? (
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        <FaqPanel />
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "12px 18px 4px", flexShrink: 0 }}>
                            <Waveform levels={levels} listening={listening} onClick={toggleListening} />
                            <p style={{ ...body, fontSize: 11, color: listening ? OB.dotRed : OB.textMuted, textAlign: "center", margin: "4px 0 0", fontWeight: listening ? 600 : 400 }}>
                                {micError ? micError : listening ? "Listening… click to stop" : "Click to speak"}
                            </p>
                        </div>

                        {/* Conversation log */}
                        <div ref={conversationRef} style={{ flex: 1, overflowY: "auto", padding: "8px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                            {sttError && (
                                <p style={{ ...body, fontSize: 12.5, color: OB.dotRed, margin: 0 }}>{sttError}</p>
                            )}

                            {turns.map((turn, i) => (
                                <div key={i}>
                                    <p style={{ ...body, fontSize: 11.5, color: OB.textMuted, marginBottom: 6 }}>
                                        <strong>You asked:</strong> {turn.question}
                                    </p>

                                    {turn.error && (
                                        <p style={{ ...body, fontSize: 12.5, color: OB.dotRed, margin: 0 }}>{turn.error}</p>
                                    )}

                                    {turn.answer && (
                                        <div
                                            style={{
                                                background: turn.escalated ? "#FDECEA" : OB.sand,
                                                border: `1px solid ${turn.escalated ? OB.dotRed : OB.border}`,
                                                borderRadius: 10,
                                                padding: "10px 12px",
                                                fontSize: 13,
                                                color: OB.text,
                                                lineHeight: 1.5,
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 8,
                                                ...body,
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                {turn.escalated && <strong style={{ color: OB.dotRed }}>Escalated: </strong>}
                                                {turn.answer}
                                            </div>
                                            {turn.audioUrl && (
                                                <button
                                                    onClick={() => replayAudio(turn.audioUrl as string)}
                                                    aria-label="Play answer aloud"
                                                    title="Play aloud"
                                                    style={{
                                                        flexShrink: 0,
                                                        background: "none",
                                                        border: "none",
                                                        fontSize: 16,
                                                        cursor: "pointer",
                                                        padding: 0,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    🔊
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {!turn.answer && !turn.error && thinking && i === turns.length - 1 && (
                                        <p style={{ ...body, fontSize: 12.5, color: OB.textMuted, fontStyle: "italic", margin: 0 }}>
                                            Thinking…
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: "10px 18px 6px", flexShrink: 0 }}>
                            <input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Type to ask questions…"
                                style={{ ...body, width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 999, border: `1.5px solid ${OB.text}`, fontSize: 14, color: OB.text }}
                            />
                        </form>

                        <p style={{ ...body, fontSize: 10, color: OB.textMuted, textAlign: "center", margin: "4px 0 10px", flexShrink: 0 }}>
                            Speaking {languageLabel(selectedLanguage)} · Brought to you by OnBoardly
                        </p>
                    </>
                )
            )}

            {/* Resize handle */}
            <div
                onMouseDown={onResizeStart}
                style={{
                    position: "absolute", right: 2, bottom: 2, width: 16, height: 16, cursor: "nwse-resize",
                    background: `linear-gradient(135deg, transparent 50%, ${OB.border} 50%)`, borderRadius: 2,
                }}
            />
        </div>
    );
}
