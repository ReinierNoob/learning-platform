export type AiProvider = "anthropic" | "openai";

type TutorMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiReply = {
  provider: AiProvider;
  model: string;
  reply: string;
};

function anthropicApiKey() {
  return process.env.ANTHROPIC_API_KEY?.trim() || process.env.anthropic_API_KEY?.trim() || "";
}

async function callAnthropic(instructions: string, messages: TutorMessage[], maxTokens = 700): Promise<AiReply | null> {
  const apiKey = anthropicApiKey();
  if (!apiKey) return null;

  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      system: instructions,
      messages,
      max_tokens: maxTokens,
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const result = await response.json().catch(() => ({}));
  const content = Array.isArray(result.content) ? result.content : [];
  const reply = content
    .filter((block: any) => block?.type === "text" && typeof block.text === "string")
    .map((block: any) => block.text)
    .join("")
    .trim();

  if (!reply) return null;
  return { provider: "anthropic", model, reply };
}

async function callOpenAi(instructions: string, messages: TutorMessage[], maxTokens = 700): Promise<AiReply | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input: messages.map((message) => ({ role: message.role, content: message.content })),
      max_output_tokens: maxTokens,
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const result = await response.json().catch(() => ({}));
  const reply =
    result.output_text ??
    result.output
      ?.flatMap((item: any) => item.content ?? [])
      .map((item: any) => item.text ?? "")
      .join("") ??
    "";

  const normalized = String(reply).trim();
  if (!normalized) return null;
  return { provider: "openai", model, reply: normalized };
}

export function hasConfiguredAiProvider() {
  return Boolean(anthropicApiKey() || process.env.OPENAI_API_KEY?.trim());
}

export async function generateTutorReply(instructions: string, messages: TutorMessage[], maxTokens = 700): Promise<AiReply | null> {
  const anthropic = await callAnthropic(instructions, messages, maxTokens).catch(() => null);
  if (anthropic) return anthropic;

  return callOpenAi(instructions, messages, maxTokens).catch(() => null);
}
