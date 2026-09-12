"use client";

import React, { useState } from "react";

const OB = {
    border: "#E4DFD3",
    cream: "#FFFFFF",
    text: "#2B2620",
    textMuted: "#8A8271",
    dotRed: "#8B3A2E",
};

const body = { fontFamily: "'IBM Plex Sans', sans-serif" };

const FAQS = [
    {
        module: "PPE & General Safety",
        q: "Do I need gloves just for lifting boxes?",
        a: "Gloves are required for cutting, grinding, or chemical handling — general lifting doesn't need them unless your supervisor says otherwise.",
    },
    {
        module: "Equipment Safety",
        q: "What should I do if equipment stops working mid-task?",
        a: "Stop operating it immediately, apply the shut-off if applicable, and report it to your supervisor. Don't attempt a repair yourself.",
    },
    {
        module: "Pay & Entitlements",
        q: "If I think I've been underpaid, who do I talk to?",
        a: "Raise it with HR or the Fair Work Ombudsman — this is a standard part of your entitlements, regardless of visa status.",
    },
    {
        module: "PPE & General Safety",
        q: "My safety boots are worn out — do I pay for replacements?",
        a: "No, report worn or damaged PPE to your supervisor; replacement is provided by the site.",
    },
];

export default function FaqPanel() {
    const [query, setQuery] = useState("");

    const filtered = FAQS.filter(
        (f) =>
            f.q.toLowerCase().includes(query.toLowerCase()) ||
            f.module.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div style={{ padding: "0 18px 16px" }}>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search common questions…"
                style={{
                    ...body,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: `1.5px solid ${OB.border}`,
                    fontSize: 13,
                    color: OB.text,
                    marginBottom: 12,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 220,
                    overflowY: "auto",
                }}
            >
                {filtered.map((f, i) => (
                    <div
                        key={i}
                        style={{
                            background: OB.cream,
                            border: `1px solid ${OB.border}`,
                            borderRadius: 10,
                            padding: "10px 12px",
                        }}
                    >
                        <div
                            style={{
                                ...body,
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: OB.dotRed,
                                textTransform: "uppercase",
                                marginBottom: 3,
                                letterSpacing: 0.3,
                            }}
                        >
                            {f.module}
                        </div>
                        <div style={{ ...body, fontWeight: 600, fontSize: 12.5, color: OB.text, marginBottom: 4 }}>
                            {f.q}
                        </div>
                        <div style={{ ...body, fontSize: 11.5, color: OB.textMuted, lineHeight: 1.45 }}>
                            {f.a}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ ...body, fontSize: 12, color: OB.textMuted, padding: "8px 0" }}>
                        No matches — try a different search.
                    </div>
                )}
            </div>
        </div>
    );
}