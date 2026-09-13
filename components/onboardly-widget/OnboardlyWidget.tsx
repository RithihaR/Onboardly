"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import FaqPanel from "./FaqPanel";

const OB = {
    border: "#E4DFD3",
    cream: "#FFFFFF",
    text: "#2B2620",
    textMuted: "#8A8271",
    amber: "#E8A93B",
    red: "#C0453B",
    green: "#7BAA5A",
    dotRed: "#8B3A2E",
    dotAmber: "#E0A83E",
    dotGreen: "#7BAA5A",
};

const cursive = { fontFamily: "'Caveat', 'Segoe Script', cursive" };
const body = { fontFamily: "'IBM Plex Sans', sans-serif" };

function useOnboardlyFonts() {
    useEffect(() => {
        if (document.getElementById("ob-widget-fonts")) return;
        const link = document.createElement("link");
        link.id = "ob-widget-fonts";
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
        document.head.appendChild(link);
    }, []);
}

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

function Waveform({
    levels,
    listening,
    onClick,
}: {
    levels: number[];
    listening: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            aria-label={listening ? "Stop listening" : "Click to speak"}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                height: 48,
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 8px",
            }}
        >
            {levels.map((h, i) => (
                <div
                    key={i}
                    style={{
                        width: 3,
                        height: h,
                        borderRadius: 2,
                        background: listening ? OB.dotRed : OB.text,
                        transition: listening ? "none" : "height 0.15s ease",
                    }}
                />
            ))}
        </button>
    );
}

interface OnboardlyWidgetProps {
    language?: string;
    moduleContent?: string;
    onAskQuestion?: (question: string, moduleContent?: string) => void;
    onVoiceCaptured?: (audioBlob: Blob) => void;
}

export default function OnboardlyWidget({
    language,
    moduleContent,
    onAskQuestion,
    onVoiceCaptured,
}: OnboardlyWidgetProps) {
    useOnboardlyFonts();

    const [expanded, setExpanded] = useState(true);
    const [view, setView] = useState<"ask" | "faq">("ask");
    const [question, setQuestion] = useState("");
    const [listening, setListening] = useState(false);

    const { levels, micError } = useMicLevels(listening);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const dragOffset = useRef<{ x: number; y: number } | null>(null);
    const [dragging, setDragging] = useState(false);
    const dragMovedRef = useRef(false);

    useEffect(() => {
        if (pos) return;
        const width = expanded ? 340 : 56;
        const height = expanded ? 420 : 56;
        setPos({
            x: window.innerWidth - width - 28,
            y: window.innerHeight - height - 28,
        });
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

    async function toggleListening() {
        if (listening) {
            setListening(false);
            const recorder = mediaRecorderRef.current;
            if (recorder && recorder.state !== "inactive") {
                recorder.stop();
            }
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            chunksRef.current = [];
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onVoiceCaptured?.(blob);
                stream.getTracks().forEach((t) => t.stop());
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
        onAskQuestion?.(question, moduleContent);
        setQuestion("");
    }

    if (!pos) return null;

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
                    position: "fixed",
                    left: pos.x,
                    top: pos.y,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: OB.cream,
                    border: `1px solid ${OB.border}`,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    color: OB.text,
                    cursor: dragging ? "grabbing" : "grab",
                    ...cursive,
                    fontSize: 20,
                    fontWeight: 700,
                }}
            >
                OB
            </button>
        );
    }

    return (
        <div
            style={{
                position: "fixed",
                left: pos.x,
                top: pos.y,
                width: 340,
                background: OB.cream,
                border: `1px solid ${OB.border}`,
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
            }}
        >
            <div
                onMouseDown={onDragStart}
                style={{
                    padding: "16px 18px 14px",
                    cursor: dragging ? "grabbing" : "grab",
                    userSelect: "none",
                    position: "relative",
                }}
            >
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: OB.dotRed }} />
                    <button
                        onClick={() => setExpanded(false)}
                        onMouseDown={(e) => e.stopPropagation()}
                        aria-label="Minimize assistant"
                        style={{
                            width: 11,
                            height: 11,
                            borderRadius: "50%",
                            background: OB.dotAmber,
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                        }}
                    />
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: OB.dotGreen }} />
                </div>

                <button
                    onClick={() => setView(view === "faq" ? "ask" : "faq")}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="Frequently asked questions"
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: `1.5px solid ${OB.dotRed}`,
                        background: view === "faq" ? OB.dotRed : "none",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <span style={{ color: view === "faq" ? OB.cream : OB.dotRed }}>?</span>
                </button>

                <div style={{ textAlign: "center" }}>
                    <span style={{ ...cursive, fontSize: 30, color: OB.text, borderBottom: `2px solid ${OB.text}`, paddingBottom: 2 }}>
                        OnBoardly
                    </span>
                </div>
            </div>

            {view === "faq" ? (
                <FaqPanel />
            ) : (
                <>
                    <div style={{ padding: "16px 18px 6px" }}>
                        <Waveform levels={levels} listening={listening} onClick={toggleListening} />
                        <p style={{ ...body, fontSize: 11, color: listening ? OB.dotRed : OB.textMuted, textAlign: "center", margin: "4px 0 0", fontWeight: listening ? 600 : 400 }}>
                            {micError ? micError : listening ? "Listening… click to stop" : "Click to speak"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: "14px 18px 8px" }}>
                        <input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type to ask questions…"
                            style={{
                                ...body,
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "12px 16px",
                                borderRadius: 999,
                                border: `1.5px solid ${OB.text}`,
                                fontSize: 14,
                                color: OB.text,
                            }}
                        />
                    </form>

                    <p style={{ ...body, fontSize: 10.5, color: OB.textMuted, textAlign: "center", margin: "6px 0 16px" }}>
                        Brought to you by OnBoardly
                    </p>
                </>
            )}
        </div>
    );
}