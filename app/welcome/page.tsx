
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const OB = {
    sand: "#EDE7D9",
    sandLine: "#CBBFA0",
    ink: "#14181F",
    inkMuted: "#5B6472",
    amber: "#E8A93B",
    dotRed: "#8B3A2E",
};

const disp = { fontFamily: "'Space Grotesk', sans-serif" };
const body = { fontFamily: "'IBM Plex Sans', sans-serif" };
const cursive = { fontFamily: "'Caveat', 'Segoe Script', cursive" };

const TOP_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "zh", label: "Mandarin" },
    { code: "ar", label: "Arabic" },
    { code: "vi", label: "Vietnamese" },
    { code: "pa", label: "Punjabi" },
    { code: "hi", label: "Hindi" },
];

const MORE_LANGUAGES = [
    { code: "af", label: "Afrikaans" },
    { code: "hy", label: "Armenian" },
    { code: "as", label: "Assamese" },
    { code: "az", label: "Azerbaijani" },
    { code: "be", label: "Belarusian" },
    { code: "bn", label: "Bengali" },
    { code: "bs", label: "Bosnian" },
    { code: "bg", label: "Bulgarian" },
    { code: "ca", label: "Catalan" },
    { code: "ceb", label: "Cebuano" },
    { code: "ny", label: "Chichewa" },
    { code: "hr", label: "Croatian" },
    { code: "cs", label: "Czech" },
    { code: "da", label: "Danish" },
    { code: "nl", label: "Dutch" },
    { code: "et", label: "Estonian" },
    { code: "fil", label: "Filipino" },
    { code: "fi", label: "Finnish" },
    { code: "fr", label: "French" },
    { code: "gl", label: "Galician" },
    { code: "ka", label: "Georgian" },
    { code: "de", label: "German" },
    { code: "el", label: "Greek" },
    { code: "gu", label: "Gujarati" },
    { code: "ha", label: "Hausa" },
    { code: "he", label: "Hebrew" },
    { code: "hu", label: "Hungarian" },
    { code: "is", label: "Icelandic" },
    { code: "id", label: "Indonesian" },
    { code: "ga", label: "Irish" },
    { code: "it", label: "Italian" },
    { code: "ja", label: "Japanese" },
    { code: "jv", label: "Javanese" },
    { code: "kn", label: "Kannada" },
    { code: "kk", label: "Kazakh" },
    { code: "ky", label: "Kirghiz" },
    { code: "ko", label: "Korean" },
    { code: "lv", label: "Latvian" },
    { code: "ln", label: "Lingala" },
    { code: "lt", label: "Lithuanian" },
    { code: "lb", label: "Luxembourgish" },
    { code: "mk", label: "Macedonian" },
    { code: "ms", label: "Malay" },
    { code: "ml", label: "Malayalam" },
    { code: "mr", label: "Marathi" },
    { code: "ne", label: "Nepali" },
    { code: "no", label: "Norwegian" },
    { code: "ps", label: "Pashto" },
    { code: "fa", label: "Persian" },
    { code: "pl", label: "Polish" },
    { code: "pt", label: "Portuguese" },
    { code: "ro", label: "Romanian" },
    { code: "ru", label: "Russian" },
    { code: "sr", label: "Serbian" },
    { code: "sd", label: "Sindhi" },
    { code: "sk", label: "Slovak" },
    { code: "sl", label: "Slovenian" },
    { code: "so", label: "Somali" },
    { code: "es", label: "Spanish" },
    { code: "sw", label: "Swahili" },
    { code: "sv", label: "Swedish" },
    { code: "ta", label: "Tamil" },
    { code: "te", label: "Telugu" },
    { code: "th", label: "Thai" },
    { code: "tr", label: "Turkish" },
    { code: "uk", label: "Ukrainian" },
    { code: "ur", label: "Urdu" },
    { code: "cy", label: "Welsh" },
].sort((a, b) => a.label.localeCompare(b.label));

export default function WelcomePage() {
    const router = useRouter();
    const [step, setStep] = useState<"welcome" | "language">("welcome");
    const [query, setQuery] = useState("");

    const filteredMore = useMemo(() => {
        if (!query.trim()) return MORE_LANGUAGES;
        return MORE_LANGUAGES.filter((l) =>
            l.label.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

    function selectLanguage(code: string) {
        localStorage.setItem("onboardly_language", code);
        router.push("/onboarding");
    }

    if (step === "welcome") {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: OB.sand,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        border: `1px solid ${OB.sandLine}`,
                        borderRadius: 14,
                        padding: "44px 40px",
                        maxWidth: 440,
                        textAlign: "center",
                    }}
                >
                    <div style={{ ...cursive, fontSize: 36, color: OB.ink, marginBottom: 4 }}>
                        OnBoardly
                    </div>
                    <p style={{ ...body, fontSize: 14, color: OB.inkMuted, lineHeight: 1.6, margin: "16px 0 28px" }}>
                        Your onboarding assistant. Listen to each module in your own language,
                        ask questions any time by typing or speaking, and get answers grounded
                        in what your employer has actually told us — never guessed.
                    </p>
                    <button
                        onClick={() => setStep("language")}
                        style={{
                            ...disp,
                            background: OB.ink,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "14px 32px",
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: OB.sand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    border: `1px solid ${OB.sandLine}`,
                    borderRadius: 14,
                    padding: "40px 36px",
                    width: "100%",
                    maxWidth: 480,
                }}
            >
                <h1 style={{ ...disp, fontSize: 20, color: OB.ink, margin: "0 0 4px", textAlign: "center" }}>
                    Choose your language
                </h1>
                <p style={{ ...body, fontSize: 12.5, color: OB.inkMuted, textAlign: "center", margin: "0 0 24px" }}>
                    You can change this later
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        marginBottom: 22,
                    }}
                >
                    {TOP_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => selectLanguage(lang.code)}
                            style={{
                                ...body,
                                fontSize: 14.5,
                                fontWeight: 600,
                                padding: "13px 12px",
                                borderRadius: 8,
                                border: `1.5px solid ${OB.sandLine}`,
                                background: "#fff",
                                color: OB.ink,
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = OB.sand)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>

                <div style={{ borderTop: `1px solid ${OB.sandLine}`, paddingTop: 18 }}>
                    <p style={{ ...body, fontSize: 11.5, color: OB.inkMuted, textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 10px" }}>
                        More languages
                    </p>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search languages…"
                        style={{
                            ...body,
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "10px 14px",
                            borderRadius: 999,
                            border: `1.5px solid ${OB.sandLine}`,
                            fontSize: 13.5,
                            marginBottom: 10,
                        }}
                    />
                    <div
                        style={{
                            maxHeight: 180,
                            overflowY: "auto",
                            border: `1px solid ${OB.sandLine}`,
                            borderRadius: 8,
                        }}
                    >
                        {filteredMore.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => selectLanguage(lang.code)}
                                style={{
                                    ...body,
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "10px 14px",
                                    fontSize: 13.5,
                                    color: OB.ink,
                                    background: "none",
                                    border: "none",
                                    borderBottom: `1px solid ${OB.sand}`,
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = OB.sand)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                                {lang.label}
                            </button>
                        ))}
                        {filteredMore.length === 0 && (
                            <div style={{ ...body, fontSize: 13, color: OB.inkMuted, padding: "12px 14px" }}>
                                No matches.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}