import { NextResponse } from "next/server";
import { getAccessToken, getCourseBySlug, getLearningAccess, getModuleServerOnlyBySource, getSessionUser } from "../../../../lib/platform";

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
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const safeMessages = messages
    .filter((item: unknown): item is { role: string; content: string } => Boolean(item && typeof item === "object" && "role" in item && "content" in item))
    .map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: String(item.content).slice(0, 6000) }));
  if (!safeMessages.length) return NextResponse.json({ error: "message_required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
  if (!apiKey) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: module.system_instruction,
      input: safeMessages.map((message) => ({ role: message.role, content: message.content })),
      max_output_tokens: 700,
    }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  const reply = result.output_text ?? result.output?.flatMap((item: any) => item.content ?? []).map((item: any) => item.text ?? "").join("") ?? "";
  return NextResponse.json({ reply: String(reply).trim() });
}
