import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getLearningAccess, getPublishedModule, getSessionUser } from "../../../../../lib/platform";

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

  const videoUrl = process.env.VIDEO_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "https://jtdcinvkpprgnwvtwvms.supabase.co";
  const serviceKey = process.env.VIDEO_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return new NextResponse("Video storage not configured", { status: 503 });

  const objectPath = `module${sourceModuleId}/${chapter}.mp4`;
  const expiresIn = 1800;
  const signed = await fetch(`${videoUrl}/storage/v1/object/sign/cursus-videos/${objectPath}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn }),
    cache: "no-store",
  });

  const result = await signed.json().catch(() => ({}));
  if (!signed.ok || !result.signedURL) return new NextResponse("Video unavailable", { status: 404 });

  const baseUrl = videoUrl.replace(/\/+$/, "");
  const signedPath = result.signedURL.startsWith("/") ? result.signedURL : `/${result.signedURL}`;
  const storagePrefix = signedPath.startsWith("/storage/v1/") ? "" : "/storage/v1";
  const target = result.signedURL.startsWith("http") ? result.signedURL : `${baseUrl}${storagePrefix}${signedPath}`;

  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json(
      { url: target, expiresIn },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.redirect(target, 307);
}
