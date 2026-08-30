import { NextResponse } from "next/server";

const answerKey: Record<string, number> = {
  "m6-assess-01": 1,
  "m6-assess-02": 1,
  "m6-assess-03": 1,
};

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });

  const body = await request.json().catch(() => null) as { answers?: Record<string, number> } | null;
  const answers = body?.answers ?? {};
  const results = Object.entries(answerKey).map(([id, correctIndex]) => ({
    id,
    correct: answers[id] === correctIndex,
  }));
  const correct = results.filter((item) => item.correct).length;

  return NextResponse.json({
    correct,
    total: results.length,
    passed: correct === results.length,
    results,
    profileUpdate: {
      "sa.m06.alternatieven-vergelijken": results[0]?.correct ? "demonstrated" : "needs_remediation",
      "sa.m06.adr-onderdelen": results[1]?.correct ? "demonstrated" : "needs_remediation",
      "sa.m06.adr-beoordelen": results[2]?.correct ? "demonstrated" : "needs_remediation",
    },
  });
}
