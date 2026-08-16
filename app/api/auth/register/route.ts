import { NextResponse } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const { email, password, firstName, lastName } = await request.json();
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/inloggen?geverifieerd=1`;
  const response = await fetch(`${supabaseUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST", headers: { apikey: supabasePublishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: String(email ?? "").trim().toLowerCase(), password, data: { first_name: firstName, last_name: lastName } }),
  });
  if (!response.ok) return NextResponse.json({ error: "Account aanmaken is niet gelukt." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
