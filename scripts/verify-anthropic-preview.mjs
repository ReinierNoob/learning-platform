const isVercelPreview = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview";

if (!isVercelPreview) {
  console.log("Anthropic preview verification skipped outside Vercel Preview.");
  process.exit(0);
}

const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.anthropic_API_KEY || "").trim();
if (!apiKey) {
  throw new Error("Anthropic Preview verification failed: ANTHROPIC_API_KEY missing");
}

const model = (process.env.ANTHROPIC_MODEL || "claude-sonnet-5").trim();
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model,
    max_tokens: 16,
    system: "This is a connectivity check. Reply only with OK.",
    messages: [{ role: "user", content: "Check the connection." }],
  }),
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  const type = body?.error?.type || "unknown_error";
  throw new Error(`Anthropic Preview verification failed: HTTP ${response.status}, type ${type}`);
}

const hasText = Array.isArray(body?.content) && body.content.some((item) => item?.type === "text" && item?.text);
console.log(`Anthropic Preview verification passed: model=${body?.model || model}, text=${Boolean(hasText)}`);
