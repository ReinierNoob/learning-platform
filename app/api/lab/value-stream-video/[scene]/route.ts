import { getAccessToken } from "../../../../../lib/platform";

const POC_SIGNER_URL = "https://jtdcinvkpprgnwvtwvms.supabase.co/functions/v1/secure-poc-video-url";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scene: string }> },
) {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ error: "authentication_required" }, { status: 401 });
  }

  const { scene } = await params;
  const response = await fetch(POC_SIGNER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scene }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || typeof data.signed_url !== "string") {
    const status = [400, 401, 403, 404].includes(response.status) ? response.status : 502;
    return Response.json(
      { error: typeof data.error === "string" ? data.error : "video_unavailable" },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { url: data.signed_url, expires_in: data.expires_in ?? 900 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
