import { NextResponse } from "next/server";
import {
  accessCookieName,
  eawPublishableKey,
  eawSupabaseUrl,
  refreshCookieName,
} from "../../../../lib/platform";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const accessToken = String(body.accessToken ?? "").trim();
  const refreshToken = String(body.refreshToken ?? "").trim();
  if (!accessToken || !refreshToken) return NextResponse.json({ error: "missing_tokens" }, { status: 400 });

  const userResponse = await fetch(`${eawSupabaseUrl}/auth/v1/user`, {
    headers: { apikey: eawPublishableKey, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!userResponse.ok) return NextResponse.json({ error: "invalid_session" }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  const cookieBase = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
  response.cookies.set(accessCookieName, accessToken, { ...cookieBase, maxAge: 55 * 60 });
  response.cookies.set(refreshCookieName, refreshToken, { ...cookieBase, maxAge: 30 * 24 * 60 * 60 });
  return response;
}
