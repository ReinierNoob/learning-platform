import { NextResponse } from "next/server";
import { getAccessToken, getCourseBySlug, getLearningAccess, getModuleItems, getModuleServerOnlyBySource, getSessionUser, parseAnswerKey, recordProgress } from "../../../../lib/platform";

const COURSE_SLUG = "togaf-business-architecture-readiness";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sourceModuleId = Number(id);
  if (!Number.isInteger(sourceModuleId)) return NextResponse.json({ error: "invalid_module" }, { status: 400 });

  const token = await getAccessToken();
  if (!token || !(await getSessionUser(token))) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const course = await getCourseBySlug(COURSE_SLUG, token);
  if (!course) return NextResponse.json({ error: "course_not_found" }, { status: 404 });
  const access = await getLearningAccess(course.id, token);
  if (!access.can_access) return NextResponse.json({ error: "no_active_entitlement" }, { status: 403 });

  const module = await getModuleServerOnlyBySource(course.id, sourceModuleId);
  if (!module?.system_instruction) return NextResponse.json({ error: "module_not_found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const antwoorden = body.antwoorden && typeof body.antwoorden === "object" ? body.antwoorden as Record<string, string> : {};
  const key = parseAnswerKey(module.system_instruction);
  if (!key.size) return NextResponse.json({ error: "answer_key_unavailable" }, { status: 503 });

  const resultaten = (module.quiz ?? []).map((question: { nr: number }) => {
    const expected = key.get(Number(question.nr));
    const given = String(antwoorden[String(question.nr)] ?? antwoorden[question.nr] ?? "").toUpperCase();
    return {
      nr: Number(question.nr),
      correct: Boolean(expected && given === expected.answer),
      juisteAntwoord: expected?.answer ?? "",
      uitleg: expected?.explanation ?? "",
    };
  });

  const items = await getModuleItems(module.id, token);
  const content = items.find((item) => item.item_type === "content");
  const assessment = items.find((item) => item.item_type === "assessment");
  if (content) await recordProgress(token, { itemId: content.id });
  if (assessment) await recordProgress(token, { itemId: assessment.id, answers: antwoorden, startedAt: new Date().toISOString() });

  return NextResponse.json({ resultaten });
}
