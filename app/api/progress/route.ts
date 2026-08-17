import { NextResponse } from "next/server";
import { getAccessToken, supabasePublishableKey, supabaseUrl } from "@/lib/supabase";

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const response = await fetch(`${supabaseUrl}/functions/v1/record-progress`, {
    method: "POST",
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({ error: "progress_unavailable" }));
  return NextResponse.json(result, { status: response.status });
}
