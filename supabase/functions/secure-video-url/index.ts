import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const VIDEO_BUCKET = "cursus-videos";
const SIGNED_URL_TTL_SECONDS = 900;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHAPTER = /^hoofdstuk-[a-zA-Z0-9_-]+$/;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  },
});

function requiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function validateUser(baseUrl: string, token: string, publishableKey: string) {
  const userInfo = await fetch(`${baseUrl}/auth/v1/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (userInfo.ok) {
    const body = await userInfo.json().catch(() => ({})) as { sub?: string };
    if (body.sub) return body.sub;
  }

  const legacy = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!legacy.ok) return null;
  const body = await legacy.json().catch(() => ({})) as { id?: string };
  return body.id ?? null;
}

async function validateEntitlement(
  baseUrl: string,
  token: string,
  publishableKey: string,
  courseId: string,
  sourceModuleId: number,
) {
  const accessResponse = await fetch(`${baseUrl}/rest/v1/rpc/get_my_learning_access`, {
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
    `${baseUrl}/rest/v1/course_modules?course_id=eq.${encodeURIComponent(courseId)}&source_module_id=eq.${sourceModuleId}&is_published=eq.true&select=id&limit=1`,
    { headers: { apikey: publishableKey, Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!moduleResponse.ok) return false;
  const modules = await moduleResponse.json().catch(() => []) as Array<{ id?: string }>;
  return Boolean(modules[0]?.id);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authorization = req.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
    const publishableKey = req.headers.get("x-eaw-publishable-key")?.trim() ?? "";
    if (!token || !publishableKey) return json({ error: "authentication_required" }, 401);

    const payload = await req.json().catch(() => null) as null | { courseId?: string; moduleId?: number; chapter?: string };
    const courseId = String(payload?.courseId ?? "").toLowerCase();
    const moduleId = Number(payload?.moduleId);
    const chapter = String(payload?.chapter ?? "");
    if (!UUID.test(courseId) || !Number.isInteger(moduleId) || moduleId < 1 || moduleId > 1000 || !CHAPTER.test(chapter)) {
      return json({ error: "invalid_video_reference" }, 400);
    }

    const supabaseUrl = requiredEnv("SUPABASE_URL").replace(/\/+$/, "");
    const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!(await validateUser(supabaseUrl, token, publishableKey))) return json({ error: "invalid_session" }, 401);
    if (!(await validateEntitlement(supabaseUrl, token, publishableKey, courseId, moduleId))) {
      return json({ error: "learning_access_denied" }, 403);
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const objectPath = `module${moduleId}/${chapter}.mp4`;
    const signed = await admin.storage.from(VIDEO_BUCKET).createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);
    if (signed.error || !signed.data?.signedUrl) {
      if (signed.error) console.error("Video signing failed", signed.error.message);
      return json({ error: "video_not_found" }, 404);
    }

    return json({ signed_url: signed.data.signedUrl, expires_in: SIGNED_URL_TTL_SECONDS });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unknown video signer error");
    return json({ error: "video_unavailable" }, 503);
  }
});
