import { NextRequest, NextResponse } from "next/server";
import {
  eawPublishableKey,
  getAccessToken,
  getLearningAccess,
  getPublishedModule,
  getSessionUser,
} from "../../../../../lib/platform";

const EXPECTED_SIGNED_URL_TTL_SECONDS = 900;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; chapter: string }> }) {
  const { id, chapter } = await params;
  const sourceModuleId = Number(id);
  const trainingId = request.nextUrl.searchParams.get("training_id")?.trim() ?? "";
  if (!Number.isInteger(sourceModuleId) || !/^hoofdstuk-[a-zA-Z0-9_-]+$/.test(chapter) || !/^[0-9a-f-]{36}$/i.test(trainingId)) {
    return new NextResponse("Invalid", { status: 400 });
  }

  const token = await getAccessToken();
  if (!token || !(await getSessionUser(token))) return new NextResponse("Unauthorized", { status: 401 });

  const access = await getLearningAccess(trainingId, token);
  if (!access.can_access || access.training_id !== trainingId) return new NextResponse("Forbidden", { status: 403 });

  const module = await getPublishedModule(trainingId, sourceModuleId, token);
  if (!module?.is_published) return new NextResponse("Not found", { status: 404 });

  const videoUrl = process.env.VIDEO_SUPABASE_URL?.replace(/\/+$/, "");
  if (!videoUrl) return new NextResponse("Video storage not configured", { status: 503 });
  const videoSignerUrl = process.env.COURSE_VIDEO_EDGE_URL ?? `${videoUrl}/functions/v1/secure-video-url`;

  const signed = await fetch(videoSignerUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-eaw-publishable-key": eawPublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courseId: trainingId, moduleId: sourceModuleId, chapter }),
    cache: "no-store",
  });

  const result = await signed.json().catch(() => ({})) as { signed_url?: string; expires_in?: number };
  if (!signed.ok || typeof result.signed_url !== "string" || result.expires_in !== EXPECTED_SIGNED_URL_TTL_SECONDS) {
    return new NextResponse("Video unavailable", { status: signed.ok ? 502 : signed.status });
  }

  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json(
      { url: result.signed_url, expiresIn: result.expires_in },
      { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } },
    );
  }

  const response = NextResponse.redirect(result.signed_url, 307);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
