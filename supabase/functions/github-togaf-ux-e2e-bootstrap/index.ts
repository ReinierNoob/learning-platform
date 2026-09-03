import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.114.0";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.2.10";

const COURSE_ID = "f76eb8d2-3484-4207-8bf7-b7385cfbc7d9";
const OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const OIDC_AUDIENCE = "eaw-learning-platform-ux-e2e";
const REPOSITORY_ID = "1335281630";
const ACTOR_ID = "280711426";
const jwks = createRemoteJWKSet(new URL(`${OIDC_ISSUER}/.well-known/jwks`));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
});

async function githubClaims(req: Request) {
  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) throw new Error("github_oidc_required");
  const { payload } = await jwtVerify(token, jwks, { issuer: OIDC_ISSUER, audience: OIDC_AUDIENCE });
  if (String(payload.repository_id ?? "") !== REPOSITORY_ID) throw new Error("repository_not_allowed");
  if (String(payload.actor_id ?? "") !== ACTOR_ID) throw new Error("actor_not_allowed");
  if (String(payload.repository ?? "") !== "ReinierNoob/learning-platform") throw new Error("repository_name_not_allowed");
  if (String(payload.event_name ?? "") !== "pull_request") throw new Error("event_not_allowed");
  const workflow = String(payload.workflow_ref ?? "");
  if (!workflow.startsWith("ReinierNoob/learning-platform/.github/workflows/togaf-refactor-physical-ux-e2e.yml@")) throw new Error("workflow_not_allowed");
  const runId = String(payload.run_id ?? "");
  if (!/^\d+$/.test(runId)) throw new Error("run_id_missing");
  return { runId, actor: String(payload.actor ?? "") };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let claims: { runId: string; actor: string };
  try { claims = await githubClaims(req); }
  catch (error) { return json({ error: error instanceof Error ? error.message : "oidc_invalid" }, 401); }

  const rawBody = await req.json().catch(() => null);
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) return json({error:"invalid_body"},400);
  const body = rawBody as Record<string, unknown>;
  const action = String(body.action ?? "");
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return json({ error: "supabase_env_missing" }, 503);
  if (url.replace(/\/+$/, "") !== "https://mhjykzrljvtxauaatlom.supabase.co") return json({error:"test_project_required"},403);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  if (action === "create") {
    const suffix = crypto.randomUUID();
    const email = `e2e-togaf-ux-${claims.runId}-${suffix}@example.test`;
    const password = `E2e!${crypto.randomUUID()}aA9`;
    let userId: string | null = null, orderId: string | null = null, orderItemId: string | null = null, entitlementId: string | null = null;
    const cleanup = async () => {
      try { if (userId) await admin.from("enrollments").delete().eq("user_id", userId).eq("course_id", COURSE_ID); } catch {}
      try { if (entitlementId) await admin.from("entitlements").delete().eq("id", entitlementId); } catch {}
      try { if (orderItemId) await admin.from("order_items").delete().eq("id", orderItemId); } catch {}
      try { if (orderId) await admin.from("orders").delete().eq("id", orderId); } catch {}
      try { if (userId) await admin.from("profiles").delete().eq("user_id", userId); } catch {}
      try { if (userId) await admin.auth.admin.deleteUser(userId); } catch {}
    };
    try {
      const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { eaw_e2e: true, eaw_e2e_run_id: claims.runId, eaw_e2e_course_id: COURSE_ID } });
      if (created.error || !created.data.user) throw new Error(`create_user:${created.error?.message ?? "missing_user"}`);
      userId = created.data.user.id;
      const profile = await admin.from("profiles").upsert({ user_id:userId, first_name:"E2E", last_name:"UX Browser", locale:"nl-NL", account_status:"active" });
      if (profile.error) throw new Error(`profile:${profile.error.message}`);
      const order = await admin.from("orders").insert({ order_number:`E2E-TOGAF-UX-${claims.runId}-${suffix.slice(0,8)}`, purchaser_user_id:userId, customer_type:"consumer", status:"paid", subtotal_cents:0, vat_cents:0, total_cents:0, currency:"EUR", billing_snapshot:{test:true,purpose:"ux-browser-e2e",run_id:claims.runId}, paid_at:new Date().toISOString() }).select("id").single();
      if (order.error || !order.data?.id) throw new Error(`order:${order.error?.message ?? "missing_id"}`); orderId=order.data.id;
      const item = await admin.from("order_items").insert({ order_id:orderId, course_id:COURSE_ID, quantity:1, unit_price_cents:0, subtotal_cents:0, vat_rate_bps:2100, vat_cents:0, total_cents:0, product_snapshot:{title:"TOGAF Business Architectuur — RC1 test",access_description:"E2E physical UX browser test"} }).select("id").single();
      if (item.error || !item.data?.id) throw new Error(`order_item:${item.error?.message ?? "missing_id"}`); orderItemId=item.data.id;
      const entitlement = await admin.from("entitlements").insert({ user_id:userId, course_id:COURSE_ID, source_order_item_id:orderItemId, status:"active", starts_at:new Date(Date.now()-60000).toISOString(), ends_at:new Date(Date.now()+86400000).toISOString() }).select("id").single();
      if (entitlement.error || !entitlement.data?.id) throw new Error(`entitlement:${entitlement.error?.message ?? "missing_id"}`); entitlementId=entitlement.data.id;

      const linkResponse = await fetch(`${url}/auth/v1/admin/generate_link`, {
        method:"POST",
        headers:{ apikey:serviceKey, Authorization:`Bearer ${serviceKey}`, "Content-Type":"application/json" },
        body:JSON.stringify({ type:"magiclink", email }),
      });
      if (!linkResponse.ok) throw new Error(`generate_link:${linkResponse.status}`);
      const generated = await linkResponse.json() as Record<string, unknown>;
      const properties = (generated.properties ?? {}) as Record<string, unknown>;
      const tokenHash = String(generated.hashed_token ?? properties.hashed_token ?? "");
      if (!tokenHash) throw new Error("handoff_token_missing");
      return json({ ok:true, token_hash:tokenHash, training_id:COURSE_ID, user_id:userId, order_id:orderId, order_item_id:orderItemId, entitlement_id:entitlementId, run_id:claims.runId });
    } catch (error) {
      await cleanup();
      return json({ error:error instanceof Error ? error.message : "create_failed" }, 500);
    }
  }

  if (action === "cleanup" || action === "expire") {
    const userId = String(body.user_id ?? "");
    const orderId = String(body.order_id ?? "");
    const orderItemId = String(body.order_item_id ?? "");
    const entitlementId = String(body.entitlement_id ?? "");
    if (![userId,orderId,orderItemId,entitlementId].every((value) => /^[0-9a-f-]{36}$/i.test(value))) return json({ error:"invalid_cleanup_ids" },400);
    const user = await admin.auth.admin.getUserById(userId);
    if (user.error || !user.data.user || String(user.data.user.app_metadata?.eaw_e2e_run_id ?? "") !== claims.runId || user.data.user.app_metadata?.eaw_e2e_course_id !== COURSE_ID) return json({ error:"cleanup_scope_denied" },403);
    const orderScope = await admin.from("orders").select("id").eq("id",orderId).eq("purchaser_user_id",userId).single();
    const itemScope = await admin.from("order_items").select("id").eq("id",orderItemId).eq("order_id",orderId).eq("course_id",COURSE_ID).single();
    const entitlementScope = await admin.from("entitlements").select("id").eq("id",entitlementId).eq("user_id",userId).eq("course_id",COURSE_ID).eq("source_order_item_id",orderItemId).single();
    if (orderScope.error || itemScope.error || entitlementScope.error) return json({error:"cleanup_scope_denied"},403);
    if (action === "expire") {
      const expired = await admin.from("entitlements").update({ends_at:new Date(Date.now()-1000).toISOString()}).eq("id",entitlementId).eq("user_id",userId).eq("course_id",COURSE_ID);
      if (expired.error) return json({error:"expire_failed"},500);
      return json({ok:true,run_id:claims.runId});
    }
    for (const [table,column,value] of [["course_completions","user_id",userId],["enrollments","user_id",userId],["entitlements","id",entitlementId],["order_items","id",orderItemId],["orders","id",orderId],["profiles","user_id",userId]]) {
      let operation = admin.from(table).delete().eq(column,value);
      if (["course_completions","enrollments"].includes(table)) operation = operation.eq("course_id",COURSE_ID);
      const removed = await operation;
      if (removed.error) return json({error:`cleanup_failed:${table}`},500);
    }
    const deleted = await admin.auth.admin.deleteUser(userId);
    if (deleted.error) return json({ error:`delete_user:${deleted.error.message}` },500);
    return json({ ok:true, run_id:claims.runId });
  }

  return json({ error:"invalid_action" },400);
});

