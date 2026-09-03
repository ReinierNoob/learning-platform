import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.114.0";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const key = req.headers.get("apikey") ?? "";
  if (!token || !key) return json({ error: "authentication_required" }, 401);
  const url = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/+$/, "");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !service) return json({ error: "persistence_unavailable" }, 503);
  try {
    // Derive identity from the configured issuer; never authorize with user_metadata or submitted user IDs.
    let userId: string | null = null;
    const oauth = await fetch(`${url}/auth/v1/oauth/userinfo`, { headers: { Authorization: `Bearer ${token}` } });
    if (oauth.ok) userId = (await oauth.json()).sub ?? null;
    if (!userId) {
      const user = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
      if (user.ok) userId = (await user.json()).id ?? null;
    }
    if (!userId) return json({ error: "authentication_required" }, 401);
    const text = await req.text();
    if (text.length > 200000) return json({ error: "invalid_request" }, 413);
    const body = JSON.parse(text);
    if (!body || Array.isArray(body) || typeof body !== "object" || !UUID.test(String(body.p_module_id ?? "")) || typeof body.p_content_version !== "string") return json({ error: "invalid_request" }, 400);
    if (body.p_user_id !== userId) return json({ error: "identity_mismatch" }, 403);
    const action = body.action;
    if (!["course_practice_work", "grade_course_module"].includes(action)) return json({ error: "invalid_action" }, 400);
    const args: Record<string, unknown> = { p_user_id: userId, p_module_id: body.p_module_id, p_content_version: body.p_content_version };
    if (action === "course_practice_work") {
      if (!(body.p_text === null || (typeof body.p_text === "string" && body.p_text.trim().length > 0 && body.p_text.length <= 24000)) || !(body.p_expected_id === null || UUID.test(String(body.p_expected_id ?? "")))) return json({ error: "invalid_work" }, 400);
      args.p_text = body.p_text; args.p_expected_id = body.p_expected_id;
    } else {
      if (!body.p_answers || Array.isArray(body.p_answers) || typeof body.p_answers !== "object") return json({ error: "answers_invalid" }, 400);
      args.p_answers = body.p_answers;
      args.p_started_at = typeof body.p_started_at === "string" && Number.isFinite(Date.parse(body.p_started_at)) && Date.parse(body.p_started_at) <= Date.now() ? body.p_started_at : null;
    }
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    // Each service-only RPC checks active entitlement and module/version again, in the write transaction.
    const result = await admin.rpc(action, args);
    if (result.error) {
      const code = result.error.message;
      if (["work_conflict", "content_changed"].includes(code)) return json({ error: code }, 409);
      if (["answers_invalid", "invalid_work"].includes(code)) return json({ error: code }, 400);
      if (code === "no_active_entitlement") return json({ error: code }, 403);
      if (["module_not_found", "practice_not_found"].includes(code)) return json({ error: code }, 404);
      return json({ error: "persistence_unavailable" }, 503);
    }
    return json(result.data);
  } catch (error) {
    return json({ error: error instanceof SyntaxError ? "invalid_request" : "persistence_unavailable" }, error instanceof SyntaxError ? 400 : 503);
  }
});
