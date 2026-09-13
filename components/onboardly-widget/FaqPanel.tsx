"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

const OB = {
    border: "#D7E0C9",
    cream: "#FFFFFF",
    text: "#16233D",
    textMuted: "#5C6B7A",
    sand: "#DDE5D0",
};

const body = { fontFamily: "'Inter', sans-serif" };

interface FaqEntry {
    q: string;
    a: string;
}

// Words too common/short to be useful for matching a question by keyword.
const STOPWORDS = new Set([
    "the", "a", "an", "is", "are", "do", "does", "did", "i", "you", "we",
    "it", "to", "for", "of", "in", "on", "at", "and", "or", "my", "me",
    "what", "why", "how", "when", "where", "just", "if", "this", "that",
]);

function keywordsOf(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// In-memory cache so switching FAQ tabs or reopening the panel for the same
// module doesn't re-trigger a Gemini call every time.
const faqCache = new Map<string, FaqEntry[]>();

interface FaqPanelProps {
    moduleContent?: string;
    language?: string;
}

export default function FaqPanel({ moduleContent, language = "en" }: FaqPanelProps) {
    const [query, setQuery] = useState("");
    const [faqs, setFaqs] = useState<FaqEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestedFor = useRef<string | null>(null);

    useEffect(() => {
        if (!moduleContent || !moduleContent.trim()) {
            setFaqs([]);
            return;
        }

        const cacheKey = `${language}::${moduleContent}`;
        const cached = faqCache.get(cacheKey);
        if (cached) {
            setFaqs(cached);
            return;
        }

        if (requestedFor.current === cacheKey) return; // already in flight
        requestedFor.current = cacheKey;

        setLoading(true);
        setError(null);
        fetch("/api/faqs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: moduleContent, language }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                const result: FaqEntry[] = data.faqs || [];
                faqCache.set(cacheKey, result);
                setFaqs(result);
            })
            .catch((err) => {
                console.error("Failed to load FAQs", err);
                setError("Couldn't load FAQs for this module.");
            })
            .finally(() => setLoading(false));
    }, [moduleContent, language]);

    // Keyword-overlap matching instead of requiring the whole typed phrase to
    // appear verbatim — so "why do I need gloves" matches a FAQ containing
    // "gloves" even though the wording differs.
    const filtered = useMemo(() => {
        if (!query.trim()) return faqs;
        const queryWords = keywordsOf(query);
        if (queryWords.length === 0) return faqs;

        return faqs
            .map((f) => {
                const haystack = keywordsOf(`${f.q} ${f.a}`);
                const overlap = queryWords.filter((w) => haystack.includes(w)).length;
                return { f, overlap };
            })
            .filter((x) => x.overlap > 0)
            .sort((a, b) => b.overlap - a.overlap)
            .map((x) => x.f);
    }, [query, faqs]);

    return (
        <div style={{ padding: "12px 18px 16px" }}>
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
                    border: `1.5px solid ${OB.text}`,
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
                {loading && (
                    <div style={{ ...body, fontSize: 12, color: OB.textMuted, padding: "8px 0" }}>
                        Generating FAQs for this module…
                    </div>
                )}
                {error && (
                    <div style={{ ...body, fontSize: 12, color: OB.textMuted, padding: "8px 0" }}>
                        {error}
                    </div>
                )}
                {!loading &&
                    !error &&
                    filtered.map((f, i) => (
                        <div
                            key={i}
                            style={{
                                background: OB.sand,
                                border: `1px solid ${OB.border}`,
                                borderRadius: 10,
                                padding: "10px 12px",
                            }}
                        >
                            <div style={{ ...body, fontWeight: 600, fontSize: 12.5, color: OB.text, marginBottom: 4 }}>
                                {f.q}
                            </div>
                            <div style={{ ...body, fontSize: 11.5, color: OB.textMuted, lineHeight: 1.45 }}>
                                {f.a}
                            </div>
                        </div>
                    ))}
                {!loading && !error && faqs.length > 0 && filtered.length === 0 && (
                    <div style={{ ...body, fontSize: 12, color: OB.textMuted, padding: "8px 0" }}>
                        No matches — try a different search.
                    </div>
                )}
                {!loading && !error && faqs.length === 0 && (
                    <div style={{ ...body, fontSize: 12, color: OB.textMuted, padding: "8px 0" }}>
                        No FAQs available for this module yet.
                    </div>
                )}
            </div>
        </div>
    );
}