import { NextResponse } from "next/server";
import { getAccessToken, getLearningAccess, getModuleItems, getPublishedModule, getSessionUser, recordProgress } from "../../../../lib/platform";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sourceModuleId = Number(id);
  if (!Number.isInteger(sourceModuleId)) return NextResponse.json({ error: "invalid_module" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const trainingId = String(body.trainingId ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(trainingId)) return NextResponse.json({ error: "invalid_training_id" }, { status: 400 });

  const token = await getAccessToken();
  if (!token || !(await getSessionUser(token))) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const access = await getLearningAccess(trainingId, token);
  if (!access.can_access || access.training_id !== trainingId) {
    return NextResponse.json({ error: "no_active_entitlement" }, { status: 403 });
  }

  const module = await getPublishedModule(trainingId, sourceModuleId, token);
  if (!module?.is_published) return NextResponse.json({ error: "module_not_found" }, { status: 404 });

  const antwoorden = body.antwoorden && typeof body.antwoorden === "object"
    ? body.antwoorden as Record<string, string>
    : {};

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
