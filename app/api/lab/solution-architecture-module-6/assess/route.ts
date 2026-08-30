import { NextResponse } from "next/server";

const answerKey: Record<string, number> = {
  "m6-assess-01": 1,
  "m6-assess-02": 1,
  "m6-assess-03": 1,
};

const remediationByQuestion: Record<string, string[]> = {
  "m6-assess-01": ["m6-trade-off-repair-v1", "m6-attributen-standard-v1"],
  "m6-assess-02": ["m6-adr-anatomie-standard-v1"],
  "m6-assess-03": ["m6-consequenties-repair-v1"],
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
  const remediationSequence = Array.from(new Set(
    results.flatMap((item) => item.correct ? [] : remediationByQuestion[item.id] ?? []),
  ));

  return NextResponse.json({
    correct,
    total: results.length,
    passed: correct === results.length,
    results,
    remediationSequence,
    profileUpdate: {
      "sa.m06.alternatieven-vergelijken": results[0]?.correct ? "demonstrated" : "needs_remediation",
      "sa.m06.adr-onderdelen": results[1]?.correct ? "demonstrated" : "needs_remediation",
      "sa.m06.adr-beoordelen": results[2]?.correct ? "demonstrated" : "needs_remediation",
    },
  });
}
