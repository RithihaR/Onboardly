// app/api/explain/route.ts
import { NextResponse } from 'next/server';
import { generateAnswer } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { question, context, language, workerId } = await req.json();

    if (!question || !context) {
      return NextResponse.json({ error: 'question and context are required' }, { status: 400 });
    }

    const { answer, confidence } = await generateAnswer(question, context, language || 'en');

    const escalate = confidence === 'low';

    // Log the interaction (best-effort — don't fail the response if logging breaks)
    try {
      const { data: interaction } = await supabase
        .from('interactions')
        .insert({
          worker_id: workerId ?? null,
          question_text: question,
          language: language || 'en',
          answer_text: escalate ? null : answer,
          confidence,
        })
        .select()
        .single();

      if (escalate && interaction) {
        await supabase.from('escalations').insert({
          worker_id: workerId ?? null,
          interaction_id: interaction.id,
          reason: 'Low confidence answer — routed to supervisor',
          priority: 'medium',
          status: 'open',
        });
      }
    } catch (logErr) {
      console.error('Logging interaction/escalation failed (non-fatal):', logErr);
    }

    if (escalate) {
      return NextResponse.json({
        escalate: true,
        message: "This has been sent to your supervisor.",
      });
    }

    return NextResponse.json({ escalate: false, answer, confidence });
  } catch (err: any) {
    console.error('Explain route error:', err.message);
    return NextResponse.json({ error: 'explain_unavailable', message: err.message }, { status: 502 });
  }
}