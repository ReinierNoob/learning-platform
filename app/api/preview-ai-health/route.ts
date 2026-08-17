import { NextResponse } from "next/server";
import { generateTutorReply, hasConfiguredAiProvider } from "../../../lib/ai";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!hasConfiguredAiProvider()) {
    return NextResponse.json({ ok: false, error: "ai_not_configured" }, { status: 503 });
  }

  const result = await generateTutorReply(
    "Dit is een technische configuratiecheck. Antwoord uitsluitend met OK.",
    [{ role: "user", content: "Controleer de verbinding." }],
  );

  if (!result) {
    return NextResponse.json({ ok: false, error: "ai_unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    provider: result.provider,
    model: result.model,
    reply_present: Boolean(result.reply),
  });
}
