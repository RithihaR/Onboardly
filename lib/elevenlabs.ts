// lib/elevenlabs.ts
// Thin wrapper around the ElevenLabs API. Server-side only — ELEVENLABS_API_KEY
// must never be exposed to the browser (don't prefix it with NEXT_PUBLIC_).
//
// Currently wraps:
//   - transcribeAudio()  -> Scribe v2 speech-to-text (worker's spoken question)
//
// TTS (Multilingual v2 for module narration, Flash v2.5 for spoken answers)
// will be added here later as narrateModule() / speakAnswer().

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const STT_ENDPOINT = "https://api.elevenlabs.io/v1/speech-to-text";

export interface TranscriptionResult {
  text: string;
  languageCode: string;
  languageProbability: number;
  audioDurationSecs: number;
}

/**
 * Sends an audio clip to ElevenLabs Scribe v2 and returns the transcript.
 *
 * @param audio        Raw audio bytes (e.g. from a Next.js Request's file upload).
 * @param filename     Original filename — helps ElevenLabs infer the codec (e.g. "question.webm").
 * @param mimeType     The audio's MIME type (e.g. "audio/webm").
 * @param languageCode Optional ISO-639-1/3 hint (e.g. "en", "pa", "zh"). Omit to
 *                     let Scribe v2 auto-detect the language, which is the point
 *                     of using it here — the worker isn't asked to pick a language twice.
 */
export async function transcribeAudio(
  audio: Buffer | Blob,
  filename: string,
  mimeType: string,
  languageCode?: string
): Promise<TranscriptionResult> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error(
      "Missing ELEVENLABS_API_KEY — add it to .env.local (server-side only, do not prefix with NEXT_PUBLIC_)"
    );
  }

  const form = new FormData();
  form.append("model_id", "scribe_v2");
  const blob = audio instanceof Blob ? audio : new Blob([Uint8Array.from(audio)], { type: mimeType });
  form.append("file", blob, filename);
  if (languageCode) {
    form.append("language_code", languageCode);
  }

  const res = await fetch(STT_ENDPOINT, {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`ElevenLabs STT request failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return {
    text: data.text ?? "",
    languageCode: data.language_code ?? languageCode ?? "en",
    languageProbability: data.language_probability ?? 0,
    audioDurationSecs: data.audio_duration_secs ?? 0,
  };
}
