import { NextResponse } from "next/server";
import { generateTutorReply, hasConfiguredAiProvider } from "../../../../lib/ai";
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
      role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(item.content).slice(0, 6000),
    }));

  if (!safeMessages.length) return NextResponse.json({ error: "message_required" }, { status: 400 });
  if (!hasConfiguredAiProvider()) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const result = await generateTutorReply(module.tutor_instruction, safeMessages);
  if (!result) return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });

  return NextResponse.json({ reply: result.reply });
}
