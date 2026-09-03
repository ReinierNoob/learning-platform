import { courseWorkRpc } from "../../../../lib/course-work";
import { NextResponse } from "next/server";
import { getAccessToken, getLearningAccess, getModuleItems, getPublishedModule, getSessionUser, recordProgress } from "../../../../lib/platform";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sourceModuleId = Number(id);
  if (!Number.isInteger(sourceModuleId) || sourceModuleId < 1) return NextResponse.json({ error: "invalid_module" }, { status: 400 });

  const body = await request.json().then((value) => value && typeof value === "object" && !Array.isArray(value) ? value : {}).catch(() => ({}));
  const trainingId = String(body.trainingId ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(trainingId)) return NextResponse.json({ error: "invalid_training_id" }, { status: 400 });

  const token = await getAccessToken();
  const user = token ? await getSessionUser(token) : null;
  if (!token || !user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const access = await getLearningAccess(trainingId, token);
  if (!access.can_access || access.training_id !== trainingId) {
    return NextResponse.json({ error: "no_active_entitlement" }, { status: 403 });
  }

  const module = await getPublishedModule(trainingId, sourceModuleId, token);
  if (!module?.is_published) return NextResponse.json({ error: "module_not_found" }, { status: 404 });

  const antwoorden = body.antwoorden && typeof body.antwoorden === "object"
    ? body.antwoorden as Record<string, string>
    : {};

  if (body.contentVersion && body.contentVersion !== module.content_version) return NextResponse.json({ error: "content_changed" }, { status: 409 });
  if (!module.quiz.length || Object.keys(antwoorden).length !== module.quiz.length || module.quiz.some((q) => typeof antwoorden[q.nr] !== "string" || !Object.hasOwn(q.opties, antwoorden[q.nr]))) return NextResponse.json({ error: "answers_invalid" }, { status: 400 });
  if (module.content_version.startsWith("refactor-")) {
    if (body.contentVersion !== module.content_version) return NextResponse.json({ error: "content_changed" }, { status: 409 });
    try {
      const result = await courseWorkRpc("grade_course_module", { p_user_id: user.id, p_module_id: module.id, p_content_version: body.contentVersion, p_answers: antwoorden, p_started_at: typeof body.startedAt === "string" && Number.isFinite(Date.parse(body.startedAt)) && Date.parse(body.startedAt) <= Date.now() ? body.startedAt : null });
      return NextResponse.json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : "persistence_unavailable";
      return NextResponse.json({ error: code }, { status: code === "content_changed" ? 409 : code === "answers_invalid" ? 400 : 503 });
    }
  }

  const items = await getModuleItems(module.id, token);
  const content = items.find((item) => item.item_type === "content");
  const assessment = items.find((item) => item.item_type === "assessment");
  if (!assessment) return NextResponse.json({ error: "assessment_not_found" }, { status: 404 });

  if (content) await recordProgress(token, { itemId: content.id });
  const graded = await recordProgress(token, {
    itemId: assessment.id,
    answers: antwoorden,
    startedAt: new Date().toISOString(),
  });

  if (!graded.resultaten) return NextResponse.json({ error: "assessment_results_unavailable" }, { status: 503 });
  return NextResponse.json({ resultaten: graded.resultaten, score: graded.score });
}
