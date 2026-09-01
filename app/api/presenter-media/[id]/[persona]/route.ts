import { NextRequest, NextResponse } from "next/server";
import {
  getAccessToken,
  getCourseBySlug,
  getLearningAccess,
  getPublishedModule,
  getSessionUser,
} from "../../../../../lib/platform";

const COURSE_SLUG = "solution-architectuur-ontwerppraktijk";
const MEDIA_BUCKET = "cursus-videos";
const SIGNED_URL_TTL_SECONDS = 900;
const personas = new Set(["eva", "alexander"]);

function presenterAssetName(persona: string) {
  return persona === "eva" ? "eva-intro-v1" : "alexander-explainer-v1";
}

function storageTarget(videoUrl: string, signedUrl: string) {
  if (signedUrl.startsWith("http")) return signedUrl;
  const baseUrl = videoUrl.replace(/\/+$/, "");
  const signedPath = signedUrl.startsWith("/") ? signedUrl : `/${signedUrl}`;
  const storagePrefix = signedPath.startsWith("/storage/v1/") ? "" : "/storage/v1";
  return `${baseUrl}${storagePrefix}${signedPath}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; persona: string }> },
) {
  const { id, persona } = await params;
  const sourceModuleId = Number(id);
  const normalizedPersona = persona.toLowerCase();
  const type = request.nextUrl.searchParams.get("type") === "captions" ? "captions" : "video";

  if (!Number.isInteger(sourceModuleId) || sourceModuleId < 1 || sourceModuleId > 10 || !personas.has(normalizedPersona)) {
    return new NextResponse("Invalid", { status: 400 });
  }

  const token = await getAccessToken();
  if (!token || !(await getSessionUser(token))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const course = await getCourseBySlug(COURSE_SLUG, token);
  if (!course) return new NextResponse("Not found", { status: 404 });

  const access = await getLearningAccess(course.id, token);
  if (!access.can_access || access.training_id !== course.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const module = await getPublishedModule(course.id, sourceModuleId, token);
  if (!module?.is_published) return new NextResponse("Not found", { status: 404 });

  const videoUrl = process.env.VIDEO_SUPABASE_URL;
  const serviceKey = process.env.VIDEO_SUPABASE_SERVICE_ROLE_KEY;
  if (!videoUrl || !serviceKey) {
    return new NextResponse("Media storage not configured", { status: 503 });
  }

  const extension = type === "captions" ? "vtt" : "mp4";
  const objectPath = `solution-architecture/presenter/module-${String(sourceModuleId).padStart(2, "0")}/${presenterAssetName(normalizedPersona)}.${extension}`;

  const signed = await fetch(`${videoUrl}/storage/v1/object/sign/${MEDIA_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
    cache: "no-store",
  });

  const result = await signed.json().catch(() => ({})) as { signedURL?: string };
  if (!signed.ok || !result.signedURL) {
    return new NextResponse("Media unavailable", { status: 404 });
  }

  const target = storageTarget(videoUrl, result.signedURL);

  if (type === "captions") {
    const captions = await fetch(target, { cache: "no-store" });
    if (!captions.ok) return new NextResponse("Captions unavailable", { status: 404 });
    return new NextResponse(await captions.text(), {
      status: 200,
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json(
      { url: target, expiresIn: SIGNED_URL_TTL_SECONDS, type },
      { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } },
    );
  }

  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
