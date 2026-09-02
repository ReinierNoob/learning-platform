import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const MEDIA_SUPABASE_URL = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/+$/, "");
const EAW_SUPABASE_URL = (Deno.env.get("EAW_SUPABASE_URL") ?? MEDIA_SUPABASE_URL).replace(/\/+$/, "");
const MEDIA_BUCKET = "cursus-videos";
const SIGNED_URL_TTL_SECONDS = 900;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PERSONA = /^[a-z0-9][a-z0-9_-]{0,63}$/;

async function validateEawUser(token: string, publishableKey: string) {
  if (!EAW_SUPABASE_URL) return null;
  const userInfo = await fetch(`${EAW_SUPABASE_URL}/auth/v1/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (userInfo.ok) {
    const body = await userInfo.json().catch(() => ({})) as { sub?: string };
    if (body.sub) return body.sub;
  }
  const legacy = await fetch(`${EAW_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!legacy.ok) return null;
  const body = await legacy.json().catch(() => ({})) as { id?: string };
  return body.id ?? null;
}

async function validateEntitlement(token: string, publishableKey: string, courseId: string, sourceModuleId: number) {
  if (!EAW_SUPABASE_URL) return false;
  const accessResponse = await fetch(`${EAW_SUPABASE_URL}/rest/v1/rpc/get_my_learning_access`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_course_id: courseId }),
    cache: "no-store",
  });
  if (!accessResponse.ok) return false;
  const raw = await accessResponse.json().catch(() => null) as null | Record<string, unknown> | Array<Record<string, unknown>>;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || row.can_access !== true || String(row.training_id ?? "") !== courseId) return false;

  const moduleResponse = await fetch(
    `${EAW_SUPABASE_URL}/rest/v1/course_modules?course_id=eq.${courseId}&source_module_id=eq.${sourceModuleId}&is_published=eq.true&select=id,is_published&limit=1`,
    { headers: { apikey: publishableKey, Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!moduleResponse.ok) return false;
  const modules = await moduleResponse.json().catch(() => []) as Array<{ id?: string; is_published?: boolean }>;
  return Boolean(modules[0]?.id && modules[0]?.is_published === true);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!MEDIA_SUPABASE_URL || !EAW_SUPABASE_URL) return new Response("Media storage not configured", { status: 503 });

  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const publishableKey = req.headers.get("x-eaw-publishable-key")?.trim() ?? "";
  if (!token || !publishableKey) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null) as null | { courseId?: string; module?: number; persona?: string; type?: string };
  const courseId = String(body?.courseId ?? "").toLowerCase();
  const sourceModuleId = Number(body?.module);
  const persona = String(body?.persona ?? "").toLowerCase();
  const type = body?.type === "captions" ? "captions" : "video";
  if (!UUID.test(courseId) || !Number.isInteger(sourceModuleId) || sourceModuleId < 1 || sourceModuleId > 1000 || !PERSONA.test(persona)) {
    return new Response("Invalid", { status: 400 });
  }

  const userId = await validateEawUser(token, publishableKey);
  if (!userId) return new Response("Unauthorized", { status: 401 });
  if (!(await validateEntitlement(token, publishableKey, courseId, sourceModuleId))) return new Response("Forbidden", { status: 403 });

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!serviceKey) return new Response("Media storage not configured", { status: 503 });
  const admin = createClient(MEDIA_SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const catalog = await admin
    .from("course_presenter_media_assets")
    .select("video_path,captions_path")
    .eq("course_id", courseId)
    .eq("source_module_id", sourceModuleId)
    .eq("persona", persona)
    .eq("is_active", true)
    .maybeSingle();
  if (catalog.error) return new Response("Media catalog unavailable", { status: 503 });
  if (!catalog.data) return new Response("Media unavailable", { status: 404 });

  if (type === "captions") {
    const downloaded = await admin.storage.from(MEDIA_BUCKET).download(catalog.data.captions_path);
    if (downloaded.error || !downloaded.data) return new Response("Media unavailable", { status: 404 });
    return new Response(await downloaded.data.text(), {
      status: 200,
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const signed = await admin.storage.from(MEDIA_BUCKET).createSignedUrl(catalog.data.video_path, SIGNED_URL_TTL_SECONDS);
  if (signed.error || !signed.data?.signedUrl) return new Response("Media unavailable", { status: 404 });
  return Response.json(
    { url: signed.data.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS },
    { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } },
  );
});
