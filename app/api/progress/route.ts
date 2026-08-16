import { NextResponse } from "next/server";
import { getAccessToken, supabasePublishableKey, supabaseUrl } from "../../../lib/supabase";

export async function POST(request: Request) {
  const token = await getAccessToken(); if (!token) return NextResponse.json({ error: "Log opnieuw in." }, { status: 401 });
  const response = await fetch(`${supabaseUrl}/functions/v1/record-progress`, {
    method: "POST",
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()), cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
