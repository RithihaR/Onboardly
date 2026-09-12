import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: 'i1', workerId: 'w1', name: 'Worker One', language: 'pa', percentComplete: 40, lastActiveStep: 'mod2' },
  ]);
}