import { NextRequest, NextResponse } from "next/server";
import {
  eawPublishableKey,
  getAccessToken,
  getCourseBySlug,
  getLearningAccess,
  getPublishedModule,
  getSessionUser,
} from "../../../../../lib/platform";

const COURSE_SLUG = "solution-architectuur-ontwerppraktijk";
const EXPECTED_SIGNED_URL_TTL_SECONDS = 900;
const personas = new Set(["eva", "alexander"]);

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

  const mediaSupabaseUrl = process.env.VIDEO_SUPABASE_URL?.replace(/\/+$/, "");
  if (!mediaSupabaseUrl) return new NextResponse("Media storage not configured", { status: 503 });
  const mediaEdgeUrl = `${mediaSupabaseUrl}/functions/v1/course-presenter-media`;

  const upstream = await fetch(mediaEdgeUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-eaw-publishable-key": eawPublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courseId: course.id, module: sourceModuleId, persona: normalizedPersona, type }),
    cache: "no-store",
  });

  if (type === "captions") {
    const body = await upstream.text();
    if (!upstream.ok) return new NextResponse(body || "Captions unavailable", { status: upstream.status });
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const result = await upstream.json().catch(() => ({})) as { url?: string; expiresIn?: number };
  if (!upstream.ok || !result.url || result.expiresIn !== EXPECTED_SIGNED_URL_TTL_SECONDS) {
    return new NextResponse("Media unavailable", { status: upstream.ok ? 502 : upstream.status });
  }

  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json(
      { url: result.url, expiresIn: result.expiresIn, type },
      { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } },
    );
  }

  const response = NextResponse.redirect(result.url, 307);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
