// lib/elevenlabs.ts
// Thin wrapper around the ElevenLabs API. Server-side only — ELEVENLABS_API_KEY
// must never be exposed to the browser (don't prefix it with NEXT_PUBLIC_).
//
// Currently wraps:
//   - transcribeAudio()  -> Scribe v2 speech-to-text (worker's spoken question)
//   - narrateModule()    -> Multilingual v2 text-to-speech (long-form induction narration)
//   - speakAnswer()      -> Flash v2.5 text-to-speech (low-latency spoken Q&A answers)

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const STT_ENDPOINT = "https://api.elevenlabs.io/v1/speech-to-text";

// A single premade ElevenLabs voice ("Rachel"), used for every language — the
// Multilingual v2 / Flash v2.5 models handle the language switch themselves,
// so one voice can narrate English, Punjabi, or Mandarin text. Override via
// ELEVENLABS_VOICE_ID in .env.local once the team picks a voice they prefer.
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

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

/**
 * Calls ElevenLabs' text-to-speech endpoint with the given model and returns
 * raw MP3 bytes. Shared by narrateModule() and speakAnswer() — the only
 * difference between the two is which model (and therefore latency/quality
 * trade-off) is used.
 */
async function synthesizeSpeech(text: string, modelId: string, voiceId: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error(
      "Missing ELEVENLABS_API_KEY — add it to .env.local (server-side only, do not prefix with NEXT_PUBLIC_)"
    );
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({ text, model_id: modelId }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS request failed (${res.status}): ${errBody}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

/**
 * Narrates a full induction/HR module using Multilingual v2 — tuned for
 * stable, lifelike longform narration rather than low latency, since the
 * worker is listening to a briefing rather than waiting on a live answer.
 *
 * @param text     The module's content in the target language (already
 *                 translated — this function does not translate).
 * @param language ISO code of the text's language (en/pa/zh) — informational,
 *                 not sent to ElevenLabs; the model detects spoken-language
 *                 output from the text itself.
 * @param voiceId  Optional override of the default narration voice.
 */
export async function narrateModule(
  text: string,
  language: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<Buffer> {
  return synthesizeSpeech(text, "eleven_multilingual_v2", voiceId);
}

/**
 * Synthesizes a spoken answer to a worker's on-demand question using Flash
 * v2.5 — optimized for ~75ms latency since the worker is waiting live for
 * a response, rather than for narration quality.
 *
 * @param text     The grounded answer text, in the target language.
 * @param language ISO code of the text's language (en/pa/zh) — informational only.
 * @param voiceId  Optional override of the default answer voice.
 */
export async function speakAnswer(
  text: string,
  language: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<Buffer> {
  return synthesizeSpeech(text, "eleven_flash_v2_5", voiceId);
}
