// app/api/questions/route.ts
// Serves the end-of-module quiz question for a given module, and checks
// submitted answers server-side so the correct answer / free-text
// keywords never reach the client bundle.
//   GET  /api/questions?moduleId=mod1        -> the question, answer key stripped
//   POST /api/questions { moduleId, answer } -> { correct: boolean }

import { NextRequest, NextResponse } from "next/server";
import { QUIZ_QUESTIONS } from "@/lib/quizQuestions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");

  if (!moduleId) {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
  }

  const question = QUIZ_QUESTIONS[moduleId];
  if (!question) {
    return NextResponse.json(
      { error: "No quiz question configured for this module" },
      { status: 404 }
    );
  }

  // Strip the answer key (correctIndex / correctAnswer / keywords) before
  // sending to the client.
  if (question.type === "multiple_choice") {
    return NextResponse.json({
      moduleId,
      type: question.type,
      prompt: question.prompt,
      options: question.options,
    });
  }

  return NextResponse.json({
    moduleId,
    type: question.type,
    prompt: question.prompt,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { moduleId, answer } = body as { moduleId?: string; answer?: unknown };

  if (!moduleId) {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
  }

  const question = QUIZ_QUESTIONS[moduleId];
  if (!question) {
    return NextResponse.json(
      { error: "No quiz question configured for this module" },
      { status: 404 }
    );
  }

  let correct = false;
  if (question.type === "multiple_choice") {
    correct = typeof answer === "number" && answer === question.correctIndex;
  } else if (question.type === "true_false") {
    correct = typeof answer === "boolean" && answer === question.correctAnswer;
  } else if (question.type === "free_text") {
    const normalized = typeof answer === "string" ? answer.toLowerCase() : "";
    // Correct if the answer mentions at least one of the required keywords.
    correct = question.keywords.some((kw) => normalized.includes(kw.toLowerCase()));
  }

  return NextResponse.json({ correct });
}
