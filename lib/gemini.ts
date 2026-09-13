// app/lib/gemini.ts
// Grounded answer generation for the on-demand Q&A flow.
// The model is instructed to answer ONLY from the provided context and to
// say it doesn't know when the context doesn't cover the question — that
// refusal is what drives the confidence-gated escalation logic.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

const UNKNOWN_PHRASE = "I don't have that information";

export async function generateAnswer(
  question: string,
  context: string,
  language: string = 'en'
): Promise<{ answer: string; confidence: 'high' | 'medium' | 'low' }> {
  const prompt = `You are answering a frontline worker's question during onboarding.
Answer ONLY using the context below. Do not guess or use outside knowledge.
If the context does not contain the answer, respond with exactly: "${UNKNOWN_PHRASE}"
Answer in ${language === 'en' ? 'English' : language === 'pa' ? 'Punjabi' : language === 'zh' ? 'Mandarin' : language}.
Keep the answer short (2-3 sentences), spoken-friendly.

Context:
${context}

Question: ${question}`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const answer: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? UNKNOWN_PHRASE;

  // Confidence gate: if the model admits it doesn't know, or the context
  // was empty/very short, treat this as low confidence -> caller should escalate.
  const isUnknown = answer.toLowerCase().includes("don't have that information") || context.trim().length < 20;
  const confidence: 'high' | 'medium' | 'low' = isUnknown ? 'low' : 'high';

  return { answer, confidence };
}