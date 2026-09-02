import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@6";

const GITHUB_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_JWKS = createRemoteJWKSet(new URL("https://token.actions.githubusercontent.com/.well-known/jwks"));
const EXPECTED_AUDIENCE = "eaw-learning-platform-ux-e2e";
const EXPECTED_REPOSITORY = "ReinierNoob/learning-platform";
const EXPECTED_REPOSITORY_ID = "1335281630";
const EXPECTED_WORKFLOW = "ReinierNoob/learning-platform/.github/workflows/solution-architecture-physical-ux-e2e.yml@";
const COURSE_SLUG = "solution-architectuur-ontwerppraktijk";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

function requiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function authorizeGithubOidc(req: Request) {
  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) throw new Error("missing_oidc_token");

  const { payload } = await jwtVerify(token, GITHUB_JWKS, {
    issuer: GITHUB_ISSUER,
    audience: EXPECTED_AUDIENCE,
  });

  if (payload.repository !== EXPECTED_REPOSITORY) throw new Error("unexpected_repository");
  if (String(payload.repository_id ?? "") !== EXPECTED_REPOSITORY_ID) throw new Error("unexpected_repository_id");
  if (payload.event_name !== "pull_request") throw new Error("unexpected_event");
  if (typeof payload.workflow_ref !== "string" || !payload.workflow_ref.startsWith(EXPECTED_WORKFLOW)) {
    throw new Error("unexpected_workflow");
  }
}

async function cleanup(admin: ReturnType<typeof createClient>, ids: {
  user_id?: string;
  order_id?: string;
  order_item_id?: string;
  entitlement_id?: string;
}) {
  const userId = String(ids.user_id ?? "");
  const orderId = String(ids.order_id ?? "");
  const orderItemId = String(ids.order_item_id ?? "");
  const entitlementId = String(ids.entitlement_id ?? "");
  for (const value of [userId, orderId, orderItemId, entitlementId]) {
    if (value && !UUID.test(value)) throw new Error("invalid_cleanup_reference");
  }

  if (userId) {
    const enrollments = await admin.from("enrollments").select("id").eq("user_id", userId);
    if (enrollments.error) throw enrollments.error;
    const enrollmentIds = (enrollments.data ?? []).map((row: { id: string }) => row.id);
    if (enrollmentIds.length) {
      const completions = await admin.from("course_completions").delete().in("enrollment_id", enrollmentIds);
      if (completions.error) throw completions.error;
      const deletedEnrollments = await admin.from("enrollments").delete().in("id", enrollmentIds);
      if (deletedEnrollments.error) throw deletedEnrollments.error;
    }
  }

  if (entitlementId) {
    const extensions = await admin.from("entitlement_extensions").delete().eq("entitlement_id", entitlementId);
    if (extensions.error) throw extensions.error;
    const entitlement = await admin.from("entitlements").delete().eq("id", entitlementId);
    if (entitlement.error) throw entitlement.error;
  } else if (userId) {
    const entitlements = await admin.from("entitlements").delete().eq("user_id", userId);
    if (entitlements.error) throw entitlements.error;
  }

  if (orderId) {
    for (const table of ["consents", "credit_notes", "digital_order_items", "invoices", "payments", "refunds"] as const) {
      const result = await admin.from(table).delete().eq("order_id", orderId);
      if (result.error) throw result.error;
    }
  }

  if (orderItemId) {
    const assignments = await admin.from("learner_assignments").delete().eq("order_item_id", orderItemId);
    if (assignments.error) throw assignments.error;
    const item = await admin.from("order_items").delete().eq("id", orderItemId);
    if (item.error) throw item.error;
  }

  if (orderId) {
    const order = await admin.from("orders").delete().eq("id", orderId);
    if (order.error) throw order.error;
  }

  if (userId) {
    const deletedUser = await admin.auth.admin.deleteUser(userId);
    if (deletedUser.error) throw deletedUser.error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  try {
    await authorizeGithubOidc(req);
  } catch (error) {
    console.error("GitHub UX OIDC rejected", error instanceof Error ? error.message : "unknown");
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const body = await req.json().catch(() => null) as null | {
    action?: string;
    user_id?: string;
    order_id?: string;
    order_item_id?: string;
    entitlement_id?: string;
  };

  if (body?.action === "cleanup") {
    try {
      await cleanup(admin, body);
      return json({ ok: true });
    } catch (error) {
      console.error("UX cleanup failed", error instanceof Error ? error.message : "unknown");
      return json({ ok: false, error: "cleanup_failed" }, 500);
    }
  }

  if (body?.action !== "create") return json({ ok: false, error: "invalid_action" }, 400);

  let userId = "";
  let orderId = "";
  let orderItemId = "";
  let entitlementId = "";
  try {
    const courseResult = await admin.from("courses").select("id,title,status").eq("slug", COURSE_SLUG).eq("status", "published").maybeSingle();
    if (courseResult.error) throw courseResult.error;
    if (!courseResult.data?.id) throw new Error("course_not_found");
    const courseId = String(courseResult.data.id);
    const courseTitle = String(courseResult.data.title ?? "Solution Architecture");

    const suffix = crypto.randomUUID();
    const email = `ux-e2e-${suffix}@example.invalid`;
    const createdUser = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (createdUser.error || !createdUser.data.user) throw createdUser.error ?? new Error("user_not_created");
    userId = createdUser.data.user.id;

    const now = new Date();
    const endsAt = new Date(now.getTime() + 60 * 60 * 1000);
    const orderNumber = `EAW-UX-${Date.now()}-${suffix.slice(0, 8)}`;
    const createdOrder = await admin.from("orders").insert({
      order_number: orderNumber,
      purchaser_user_id: userId,
      customer_type: "consumer",
      status: "paid",
      subtotal_cents: 0,
      vat_cents: 0,
      total_cents: 0,
      currency: "EUR",
      billing_snapshot: { test: true, source: "github-ux-e2e" },
      paid_at: now.toISOString(),
    }).select("id").single();
    if (createdOrder.error || !createdOrder.data?.id) throw createdOrder.error ?? new Error("order_not_created");
    orderId = String(createdOrder.data.id);

    const createdItem = await admin.from("order_items").insert({
      order_id: orderId,
      course_id: courseId,
      quantity: 1,
      unit_price_cents: 0,
      subtotal_cents: 0,
      vat_rate_bps: 0,
      vat_cents: 0,
      total_cents: 0,
      product_snapshot: { title: courseTitle, access_description: "Temporary GitHub physical UX E2E access" },
    }).select("id").single();
    if (createdItem.error || !createdItem.data?.id) throw createdItem.error ?? new Error("order_item_not_created");
    orderItemId = String(createdItem.data.id);

    const createdEntitlement = await admin.from("entitlements").insert({
      user_id: userId,
      course_id: courseId,
      source_order_item_id: orderItemId,
      status: "active",
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
    }).select("id").single();
    if (createdEntitlement.error || !createdEntitlement.data?.id) throw createdEntitlement.error ?? new Error("entitlement_not_created");
    entitlementId = String(createdEntitlement.data.id);

    const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) throw link.error;
    const tokenHash = link.data.properties?.hashed_token;
    if (!tokenHash) throw new Error("token_hash_missing");

    return json({
      ok: true,
      token_hash: tokenHash,
      training_id: courseId,
      user_id: userId,
      order_id: orderId,
      order_item_id: orderItemId,
      entitlement_id: entitlementId,
    });
  } catch (error) {
    console.error("UX bootstrap failed", error instanceof Error ? error.message : "unknown");
    try {
      await cleanup(admin, { user_id: userId, order_id: orderId, order_item_id: orderItemId, entitlement_id: entitlementId });
    } catch (cleanupError) {
      console.error("UX bootstrap rollback failed", cleanupError instanceof Error ? cleanupError.message : "unknown");
    }
    return json({ ok: false, error: "bootstrap_failed" }, 500);
  }
});
