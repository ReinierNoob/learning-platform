import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

type AssessmentResult = {
  nr: number;
  correct: boolean;
  juisteAntwoord: string;
  uitleg: string;
  keuzeUitleg?: string;
};

function parseFeedback(systemInstruction: unknown) {
  const prefix = "FEEDBACK_V1 ";
  const encoded = String(systemInstruction ?? "").split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length).trim();
  if (!encoded) return {} as Record<string, Record<string, string>>;
  try {
    const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))));
  } catch {
    return {} as Record<string, Record<string, string>>;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "authentication_required" }, 401);

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: authorization } });
    if (!userResponse.ok) return json({ error: "invalid_session" }, 401);
    const user = await userResponse.json();
    const payload = await req.json().catch(() => ({}));
    if (!/^[0-9a-f-]{36}$/i.test(payload.itemId ?? "")) return json({ error: "invalid_item" }, 400);

    const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
    const itemResponse = await fetch(`${supabaseUrl}/rest/v1/module_items?id=eq.${encodeURIComponent(payload.itemId)}&select=id,item_type,module_id`, { headers: serviceHeaders });
    if (!itemResponse.ok) return json({ error: "item_lookup_failed" }, 502);
    const [item] = await itemResponse.json();
    if (!item) return json({ error: "item_not_found" }, 404);

    let score: number | null = null;
    let resultaten: AssessmentResult[] | null = null;
    if (item.item_type === "assessment") {
      const moduleResponse = await fetch(`${supabaseUrl}/rest/v1/course_modules?id=eq.${encodeURIComponent(item.module_id)}&select=quiz,system_instruction`, { headers: serviceHeaders });
      if (!moduleResponse.ok) return json({ error: "assessment_lookup_failed" }, 502);
      const [module] = await moduleResponse.json();
      const questions = Array.isArray(module?.quiz) ? module.quiz : [];
      const answerKey = new Map<number, { answer: string; explanation: string }>();
      for (const match of String(module?.system_instruction ?? "").matchAll(/(?:^|\n)\s*(\d+)\s*=\s*([A-D])\s*\(([^\n]+)\)/g)) {
        answerKey.set(Number(match[1]), { answer: match[2], explanation: match[3] });
      }
      if (!questions.length || answerKey.size < questions.length) throw new Error("Assessment answer key is incomplete");

      const answers = payload.answers && typeof payload.answers === "object" ? payload.answers as Record<string, unknown> : {};
      if (questions.some((question: { nr: number }) => !String(answers[String(question.nr)] ?? "").trim())) return json({ error: "answers_incomplete" }, 400);
      const feedback = parseFeedback(module?.system_instruction);
      let correct = 0;
      resultaten = questions.map((question: { nr: number }) => {
        const nr = Number(question.nr);
        const expected = answerKey.get(nr)!;
        const given = String(answers[String(nr)] ?? "").toUpperCase();
        const isCorrect = given === expected.answer;
        if (isCorrect) correct += 1;
        return { nr, correct: isCorrect, juisteAntwoord: expected.answer, uitleg: expected.explanation, keuzeUitleg: feedback[String(nr)]?.[given] };
      });
      score = Math.round((correct / questions.length) * 10000) / 100;
    }

    const progressResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/complete_module_item`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ p_user_id: user.id, p_module_item_id: item.id, p_score: score, p_started_at: payload.startedAt ?? null }),
    });
    if (!progressResponse.ok) {
      console.error("Progress RPC failed", (await progressResponse.text()).slice(0, 400));
      return json({ error: "progress_rejected" }, 409);
    }
    return json({ progress: await progressResponse.json(), resultaten, score });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unknown progress error");
    return json({ error: "progress_unavailable" }, 503);
  }
});
