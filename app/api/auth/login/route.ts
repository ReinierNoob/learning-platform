import { NextResponse } from "next/server";
import { accessCookieName, refreshCookieName, supabasePublishableKey, supabaseUrl } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: supabasePublishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: String(email ?? "").trim().toLowerCase(), password }),
  });
  if (!response.ok) return NextResponse.json({ error: "Inloggen is niet gelukt. Verifieer eerst je e-mailadres." }, { status: 401 });
  const session = await response.json(); const result = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  result.cookies.set(accessCookieName, session.access_token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: session.expires_in });
  result.cookies.set(refreshCookieName, session.refresh_token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 2592000 });
  return result;
}
