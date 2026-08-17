import { NextResponse } from "next/server";
import { getAccessToken, getLearningAccess, getPublishedModule, getSessionUser } from "../../../../lib/platform";

type ChatMessage = { role: string; content: string };

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
  if (!module?.tutor_instruction || !module.is_published) {
    return NextResponse.json({ error: "tutor_not_available" }, { status: 404 });
  }

  const messages: unknown[] = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const safeMessages = messages
    .filter((item: unknown): item is ChatMessage => Boolean(item && typeof item === "object" && "role" in item && "content" in item))
    .map((item: ChatMessage) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content).slice(0, 6000),
    }));

  if (!safeMessages.length) return NextResponse.json({ error: "message_required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
  if (!apiKey) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: module.tutor_instruction,
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
