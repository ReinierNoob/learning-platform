import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VIDEO_PATH = "module1/hoofdstuk-1.mp4";
const BUCKET = "cursus-videos";
const SAMPLE = 1024 * 1024;

function markers(buffer: ArrayBuffer) {
  const text = Buffer.from(buffer).toString("latin1");
  return ["ftyp", "moov", "mdat", "avc1", "avc3", "hvc1", "hev1", "mp4a", "vp09", "av01"]
    .filter((marker) => text.includes(marker));
}

export async function GET() {
  const videoUrl = process.env.VIDEO_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "https://jtdcinvkpprgnwvtwvms.supabase.co";
  const serviceKey = process.env.VIDEO_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ ok: false, error: "video_storage_not_configured" }, { status: 503 });

  const signed = await fetch(`${videoUrl}/storage/v1/object/sign/${BUCKET}/${VIDEO_PATH}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 300 }),
    cache: "no-store",
  });
  const result = await signed.json().catch(() => ({}));
  if (!signed.ok || !result.signedURL) return NextResponse.json({ ok: false, error: "sign_failed", signStatus: signed.status }, { status: 502 });
  const target = result.signedURL.startsWith("http") ? result.signedURL : `${videoUrl}${result.signedURL}`;

  const head = await fetch(target, { method: "HEAD", cache: "no-store" });
  const size = Number(head.headers.get("content-length") ?? 0);
  const first = await fetch(target, { headers: { Range: `bytes=0-${SAMPLE - 1}` }, cache: "no-store" });
  const firstBuffer = await first.arrayBuffer();

  let lastStatus: number | null = null;
  let lastContentRange: string | null = null;
  let lastMarkers: string[] = [];
  if (size > SAMPLE) {
    const start = Math.max(0, size - SAMPLE);
    const last = await fetch(target, { headers: { Range: `bytes=${start}-${size - 1}` }, cache: "no-store" });
    lastStatus = last.status;
    lastContentRange = last.headers.get("content-range");
    lastMarkers = markers(await last.arrayBuffer());
  }

  return NextResponse.json({
    ok: head.ok && (first.status === 200 || first.status === 206),
    head: {
      status: head.status,
      contentType: head.headers.get("content-type"),
      contentLength: size || null,
      acceptRanges: head.headers.get("accept-ranges"),
    },
    firstRange: {
      status: first.status,
      contentType: first.headers.get("content-type"),
      contentRange: first.headers.get("content-range"),
      acceptRanges: first.headers.get("accept-ranges"),
      markers: markers(firstBuffer),
    },
    lastRange: {
      status: lastStatus,
      contentRange: lastContentRange,
      markers: lastMarkers,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
