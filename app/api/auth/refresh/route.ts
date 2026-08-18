import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  eawPublishableKey,
  eawSupabaseUrl,
  refreshCookieName,
} from "../../../../lib/platform";

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("next") ?? "/";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  const refreshToken = request.cookies.get(refreshCookieName)?.value;
  if (!refreshToken) return NextResponse.redirect(new URL(process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account", request.url));

  const tokenResponse = await fetch(`${eawSupabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: eawPublishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) return NextResponse.redirect(new URL(process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account", request.url));

  const session = await tokenResponse.json();
  const response = NextResponse.redirect(new URL(next, request.url));
  const cookieBase = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
  response.cookies.set(accessCookieName, session.access_token, { ...cookieBase, maxAge: Math.max(60, Number(session.expires_in ?? 3600) - 60) });
  response.cookies.set(refreshCookieName, session.refresh_token, { ...cookieBase, maxAge: 30 * 24 * 60 * 60 });
  return response;
}
