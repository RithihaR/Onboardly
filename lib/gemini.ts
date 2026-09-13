// app/lib/gemini.ts
// Grounded answer generation for the on-demand Q&A flow.
// The model chats naturally (greetings, small talk, follow-ups, using
// conversation history) but for any real content question it must answer
// ONLY from the provided context and say it doesn't know when the context
// doesn't cover it — that refusal is what drives confidence-gated escalation.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

const UNKNOWN_PHRASE = "I don't have that information";

export interface ConversationTurn {
    question: string;
    answer: string;
}

export async function generateAnswer(
    question: string,
    context: string,
    language: string = 'en',
    history: ConversationTurn[] = []
): Promise<{ answer: string; confidence: 'high' | 'medium' | 'low' }> {
    // Keep only the last few turns so the prompt doesn't grow unbounded.
    const recentHistory = history.slice(-6);
    const historyBlock = recentHistory.length
        ? `Conversation so far:\n${recentHistory
            .map((h) => `Worker: ${h.question}\nYou: ${h.answer}`)
            .join('\n')}\n\n`
        : '';

    const prompt = `You are a warm, friendly onboarding assistant chatbot for a frontline worker — think of yourself as a helpful colleague standing next to them, not a document reader.

Chat naturally. Respond to greetings, thanks, small talk, "how are you", and follow-up questions conversationally and briefly, using the conversation history below when it's relevant.

For any real question about workplace policies, safety, pay, equipment, or procedures, you must answer ONLY using the Context provided below — never guess or use outside knowledge. If the Context doesn't cover it, respond with exactly: "${UNKNOWN_PHRASE}"

Answer in ${language === 'en' ? 'English' : language === 'pa' ? 'Punjabi' : language === 'zh' ? 'Mandarin' : language}.
Keep it short (1-3 sentences) and conversational, like you're speaking out loud to someone standing next to you.

${historyBlock}Context:
${context}

Worker: ${question}
You:`;

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