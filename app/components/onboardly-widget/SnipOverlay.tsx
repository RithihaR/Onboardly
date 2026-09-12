"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

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

const WAVEFORM_BARS = [10, 22, 14, 26, 12, 20, 16, 24, 11, 18];

function Waveform({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-label="Click to speak"
            style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                height: 48, width: "100%", background: "none", border: "none",
                cursor: "pointer", padding: "0 8px",
            }}
        >
            {WAVEFORM_BARS.map((h, i) => (
                <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: OB.text }} />
            ))}
        </button>
    );
}

interface OnboardlyWidgetProps {
    language?: string;
    onAskQuestion?: (question: string) => void;
    onOpenFaq?: () => void;
    onSpeak?: () => void;
}

export default function OnboardlyWidget({
    language,
    onAskQuestion,
    onOpenFaq,
    onSpeak,
}: OnboardlyWidgetProps) {
    useOnboardlyFonts();

    const [expanded, setExpanded] = useState(true);
    const [question, setQuestion] = useState("");

    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const dragOffset = useRef<{ x: number; y: number } | null>(null);
    const [dragging, setDragging] = useState(false);

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
            setDragging(true);
        },
        [pos]
    );

    useEffect(() => {
        if (!dragging) return;
        function onMove(e: MouseEvent) {
            if (!dragOffset.current) return;
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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!question.trim()) return;
        onAskQuestion?.(question);
        setQuestion("");
    }

    if (!pos) return null;

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                onMouseDown={onDragStart}
                aria-label="Open Onboardly assistant"
                style={{
                    position: "fixed", left: pos.x, top: pos.y, width: 56, height: 56,
                    borderRadius: "50%", background: OB.cream, border: `1px solid ${OB.border}`,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)", color: OB.text,
                    cursor: dragging ? "grabbing" : "grab", ...cursive, fontSize: 20, fontWeight: 700,
                }}
            >
                OB
            </button>
        );
    }

    return (
        <div
            style={{
                position: "fixed", left: pos.x, top: pos.y, width: 340, background: OB.cream,
                border: `1px solid ${OB.border}`, borderRadius: 14, overflow: "hidden",
                boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
            }}
        >
            <div
                onMouseDown={onDragStart}
                style={{ padding: "16px 18px 14px", cursor: dragging ? "grabbing" : "grab", userSelect: "none", position: "relative" }}
            >
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: OB.dotRed }} />
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: OB.dotAmber }} />
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: OB.dotGreen }} />
                </div>

                <button
                    onClick={onOpenFaq}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="Frequently asked questions"
                    style={{
                        position: "absolute", top: 16, right: 16, width: 26, height: 26,
                        borderRadius: "50%", border: `1.5px solid ${OB.dotRed}`, color: OB.dotRed,
                        background: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    ?
                </button>

                <div style={{ textAlign: "center" }}>
                    <span style={{ ...cursive, fontSize: 30, color: OB.text, borderBottom: `2px solid ${OB.text}`, paddingBottom: 2 }}>
                        OnBoardly
                    </span>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 12px" }}>
                <button
                    onClick={() => setExpanded(false)}
                    aria-label="Minimize assistant"
                    style={{ background: "none", border: "none", color: OB.textMuted, cursor: "pointer", fontSize: 13, padding: 4 }}
                >
                    minimize
                </button>
            </div>

            <div style={{ padding: "16px 18px 6px" }}>
                <Waveform onClick={() => onSpeak?.()} />
                <p style={{ ...body, fontSize: 11, color: OB.textMuted, textAlign: "center", margin: "4px 0 0" }}>
                    Click to speak
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "14px 18px 8px" }}>
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type to ask questions…"
                    style={{
                        ...body, width: "100%", boxSizing: "border-box", padding: "12px 16px",
                        borderRadius: 999, border: `1.5px solid ${OB.text}`, fontSize: 14, color: OB.text,
                    }}
                />
            </form>

            <p style={{ ...body, fontSize: 10.5, color: OB.textMuted, textAlign: "center", margin: "6px 0 16px" }}>
                Brought to you by OnBoardly
            </p>
        </div>
    );
}