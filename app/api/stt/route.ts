// app/api/stt/route.ts
// POST /api/stt
// Body: multipart/form-data with an "audio" file field, and optionally a
// "language" field (ISO code hint — omit to let Scribe v2 auto-detect).
//
// Used by the on-demand Q&A flow: worker speaks a question, the client
// records it and posts the blob here, this returns the transcript (+
// detected language) so it can be handed to retrieval next.

import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const audio = form.get("audio");
    if (!(audio instanceof Blob)) {
        return NextResponse.json({ error: "Missing 'audio' file field" }, { status: 400 });
    }

    const languageCode = form.get("language")?.toString() || undefined;
    const filename = audio instanceof File ? audio.name : "question.webm";
    const mimeType = audio.type || "audio/webm";

    try {
        const result = await transcribeAudio(audio, filename, mimeType, languageCode);
        return NextResponse.json({
            text: result.text,
            languageCode: result.languageCode,
            languageProbability: result.languageProbability,
        });
    } catch (err: any) {
        console.error("STT transcription failed", err);
        return NextResponse.json({ error: err.message || "Transcription failed" }, { status: 502 });
    }
}