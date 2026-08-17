import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  eawBaseUrl,
  refreshCookieName,
  supabasePublishableKey,
  supabaseUrl,
} from "./lib/config";

function clearSession(response: NextResponse) {
  response.cookies.set(accessCookieName, "", { path: "/", maxAge: 0 });
  response.cookies.set(refreshCookieName, "", { path: "/", maxAge: 0 });
  return response;
}

export async function proxy(request: NextRequest) {
  if (request.cookies.get(accessCookieName)?.value) return NextResponse.next();

  const refreshToken = request.cookies.get(refreshCookieName)?.value;
  if (!refreshToken) return NextResponse.next();

  const refresh = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  }).catch(() => null);

  if (!refresh?.ok) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return clearSession(NextResponse.json({ error: "authentication_required" }, { status: 401 }));
    }
    return clearSession(NextResponse.redirect(`${eawBaseUrl}/account?learning=session-expired`));
  }

  const session = await refresh.json();
  if (!session?.access_token || !session?.refresh_token) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(accessCookieName, session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, Number(session.expires_in ?? 3600)),
  });
  response.cookies.set(refreshCookieName, session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export const config = {
  matcher: ["/leren/:path*", "/module/:path*", "/api/progress", "/api/video-url/:path*"],
};
