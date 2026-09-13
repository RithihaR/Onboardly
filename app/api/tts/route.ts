import { NextResponse } from 'next/server';
import { narrateModule, speakAnswer } from '../../../lib/elevenlabs';

export async function POST(req: Request) {
  try {
    const { text, language, mode } = await req.json();

    if (!text || !language) {
      return NextResponse.json({ error: 'text and language are required' }, { status: 400 });
    }

    // mode: 'narration' for induction modules (Multilingual v2)
    //       'answer' for on-demand Q&A responses (Flash v2.5)
    const audioBuffer =
      mode === 'answer' ? await speakAnswer(text, language) : await narrateModule(text, language);

    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (err: any) {
    console.error('TTS route error:', err.message);
    // Fallback signal for the frontend: show text-only instead of crashing
    return NextResponse.json({ error: 'tts_unavailable', message: err.message }, { status: 502 });
  }
}