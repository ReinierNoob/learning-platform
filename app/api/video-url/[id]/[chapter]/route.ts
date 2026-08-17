import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/supabase";

const videoGatewayUrl = "https://jtdcinvkpprgnwvtwvms.supabase.co/functions/v1/secure-video-url";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; chapter: string }> },
) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { id, chapter } = await params;
  const moduleId = Number(id);
  if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 8 || !/^hoofdstuk-[1-9][0-9]*$/.test(chapter)) {
    return NextResponse.json({ error: "invalid_video_reference" }, { status: 400 });
  }

  const response = await fetch(videoGatewayUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ moduleId, chapter }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.signed_url) {
    return NextResponse.json(
      { error: result.error ?? "video_unavailable" },
      { status: response.status || 503 },
    );
  }

  const redirect = NextResponse.redirect(result.signed_url, { status: 307 });
  redirect.headers.set("Cache-Control", "private, no-store");
  redirect.headers.set("Referrer-Policy", "no-referrer");
  return redirect;
}
