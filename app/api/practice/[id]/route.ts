import { NextResponse } from "next/server";
import { courseWorkRpc } from "../../../../lib/course-work";
import { getAccessToken, getLearningAccess, getPublishedModule, getSessionUser } from "../../../../lib/platform";

async function handle(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moduleId = Number(id), trainingId = new URL(request.url).searchParams.get("trainingId") ?? "";
  if (!Number.isInteger(moduleId) || moduleId < 1 || !/^[0-9a-f-]{36}$/i.test(trainingId)) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const token = await getAccessToken(), user = token ? await getSessionUser(token) : null;
  if (!token || !user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const access = await getLearningAccess(trainingId, token);
  if (!access.can_access || access.training_id !== trainingId) return NextResponse.json({ error: "no_active_entitlement" }, { status: 403 });
  const module = await getPublishedModule(trainingId, moduleId, token);
  if (!module?.chapters.some((c) => c.practice)) return NextResponse.json({ error: "practice_not_found" }, { status: 404 });
  const body = request.method === "POST" ? await request.json().catch(() => null) : null;
  if (request.method === "POST" && (!body || typeof body.text !== "string" || !body.text.trim() || body.text.length > 24000 || body.contentVersion !== module.content_version || !(body.expectedId === null || (typeof body.expectedId === "string" && /^[0-9a-f-]{36}$/i.test(body.expectedId))))) {
    return NextResponse.json({ error: body?.contentVersion !== module.content_version ? "content_changed" : "invalid_work" }, { status: body?.contentVersion !== module.content_version ? 409 : 400 });
  }
  try {
    const work = await courseWorkRpc("course_practice_work", { p_user_id: user.id, p_module_id: module.id, p_content_version: module.content_version, p_text: body?.text ?? null, p_expected_id: body?.expectedId ?? null }, token);
    return NextResponse.json({ work }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "persistence_unavailable";
    return NextResponse.json({ error: code }, { status: ["work_conflict", "content_changed"].includes(code) ? 409 : 503 });
  }
}
export const GET = handle;
export const POST = handle;
