import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get('language') || 'en';
  return NextResponse.json([
    { id: 'mod1', title: 'Welcome & PPE', order: 1, language },
    { id: 'mod2', title: 'Emergency Exits', order: 2, language },
  ]);
}