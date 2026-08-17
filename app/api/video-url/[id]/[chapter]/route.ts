import { NextResponse } from "next/server";
import { getAccessToken, getCourseBySlug, getLearningAccess, getSessionUser } from "../../../../../lib/platform";

const COURSE_SLUG = "togaf-business-architecture-readiness";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; chapter: string }> }) {
  const { id, chapter } = await params;
  const sourceModuleId = Number(id);
  if (!Number.isInteger(sourceModuleId) || !/^hoofdstuk-[a-zA-Z0-9_-]+$/.test(chapter)) return new NextResponse("Invalid", { status: 400 });

  const token = await getAccessToken();
  if (!token || !(await getSessionUser(token))) return new NextResponse("Unauthorized", { status: 401 });
  const course = await getCourseBySlug(COURSE_SLUG, token);
  if (!course || !(await getLearningAccess(course.id, token)).can_access) return new NextResponse("Forbidden", { status: 403 });

  const videoUrl = process.env.VIDEO_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "https://jtdcinvkpprgnwvtwvms.supabase.co";
  const serviceKey = process.env.VIDEO_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return new NextResponse("Video storage not configured", { status: 503 });
  const objectPath = `module${sourceModuleId}/${chapter}.mp4`;
  const signed = await fetch(`${videoUrl}/storage/v1/object/sign/cursus-videos/${objectPath}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 1800 }),
    cache: "no-store",
  });
  const result = await signed.json().catch(() => ({}));
  if (!signed.ok || !result.signedURL) return new NextResponse("Video unavailable", { status: 404 });
  const target = result.signedURL.startsWith("http") ? result.signedURL : `${videoUrl}${result.signedURL}`;
  return NextResponse.redirect(target, 307);
}
