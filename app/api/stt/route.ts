import { NextResponse } from 'next/server';
import { transcribeAudio } from '../../../lib/elevenlabs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'audio file is required' }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const result = await transcribeAudio(audioBuffer, audioFile.name);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('STT route error:', err.message);
    return NextResponse.json({ error: 'stt_unavailable', message: err.message }, { status: 502 });
  }
}