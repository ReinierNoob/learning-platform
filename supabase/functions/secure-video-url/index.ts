import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Deploy to legacy video-storage project jtdcinvkpprgnwvtwvms.
const SHARED_SUPABASE_URL = "https://mhjykzrljvtxauaatlom.supabase.co";
const SHARED_PUBLISHABLE_KEY = "sb_publishable_qa9v9qDYMzr3Fr3h0N29gg_1Ip6gfb5";
const TOGAF_TRAINING_ID = "87ca0f96-3cb3-4d12-84bd-94cb77a3e603";
const VIDEO_BUCKET = "cursus-videos";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

function requiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "authentication_required" }, 401);

    const payload = await req.json().catch(() => ({}));
    const moduleId = Number(payload.moduleId);
    const chapter = String(payload.chapter ?? "");
    if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 8 || !/^hoofdstuk-[1-9][0-9]*$/.test(chapter)) {
      return json({ error: "invalid_video_reference" }, 400);
    }

    const userResponse = await fetch(`${SHARED_SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SHARED_PUBLISHABLE_KEY, Authorization: authorization },
    });
    if (!userResponse.ok) return json({ error: "invalid_session" }, 401);

    const accessResponse = await fetch(`${SHARED_SUPABASE_URL}/rest/v1/rpc/get_my_learning_access`, {
      method: "POST",
      headers: {
        apikey: SHARED_PUBLISHABLE_KEY,
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_training_id: TOGAF_TRAINING_ID }),
    });
    if (!accessResponse.ok) return json({ error: "learning_access_lookup_failed" }, 502);
    const access = await accessResponse.json();
    if (!access?.can_access || access.training_id !== TOGAF_TRAINING_ID) return json({ error: "learning_access_denied" }, 403);

    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const objectPath = `module${moduleId}/${chapter}.mp4`;
    const signResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${VIDEO_BUCKET}/${objectPath.split("/").map(encodeURIComponent).join("/")}`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 900 }),
      },
    );
    if (signResponse.status === 404) return json({ error: "video_not_found" }, 404);
    if (!signResponse.ok) return json({ error: "video_unavailable" }, 503);

    const signed = await signResponse.json();
    const signedPath = signed.signedURL ?? signed.signedUrl;
    if (!signedPath) return json({ error: "video_url_missing" }, 503);
    const signedUrl = signedPath.startsWith("http") ? signedPath : `${supabaseUrl}/storage/v1${signedPath}`;
    return json({ signed_url: signedUrl, expires_in: 900 });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unknown video signer error");
    return json({ error: "video_unavailable" }, 503);
  }
});
