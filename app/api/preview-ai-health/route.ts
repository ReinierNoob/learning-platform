import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "ai_not_configured" }, { status: 503 });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: "Dit is een technische configuratiecheck. Antwoord uitsluitend met OK.",
      input: "Controleer de verbinding.",
      max_output_tokens: 10,
    }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: "ai_unavailable", upstream_status: response.status }, { status: 503 });
  }

  const reply = result.output_text ?? result.output?.flatMap((item: any) => item.content ?? []).map((item: any) => item.text ?? "").join("") ?? "";
  return NextResponse.json({ ok: true, model, reply_present: Boolean(String(reply).trim()) });
}
