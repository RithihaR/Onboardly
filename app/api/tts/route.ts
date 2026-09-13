// app/api/tts/route.ts
// POST /api/tts
// Body (JSON): { text: string, language?: string, mode?: "narration" | "answer" }
//   - mode "narration" (default for module playback) -> Multilingual v2, tuned
//     for stable, lifelike longform narration (induction/HR modules)
//   - mode "answer" -> Flash v2.5, tuned for ~75ms latency (on-demand Q&A,
//     where the worker is waiting live for a spoken response)
//
// Response: raw audio bytes (audio/mpeg) on success, or JSON { error } on failure.

import { NextRequest, NextResponse } from "next/server";
import { narrateModule, speakAnswer } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
    let body: { text?: string; language?: string; mode?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
    }

    const { text, language = "en", mode = "narration" } = body;
    if (!text || !text.trim()) {
        return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    }
    if (mode !== "narration" && mode !== "answer") {
        return NextResponse.json({ error: "'mode' must be 'narration' or 'answer'" }, { status: 400 });
    }

    try {
        const audio = mode === "answer"
            ? await speakAnswer(text, language)
            : await narrateModule(text, language);

        return new NextResponse(new Uint8Array(audio), {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": String(audio.length),
            },
        });
    } catch (err: any) {
        console.error("TTS synthesis failed", err);
        return NextResponse.json({ error: err.message || "Speech synthesis failed" }, { status: 502 });
    }
}