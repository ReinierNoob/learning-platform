import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  getEawLoginUrl,
  getRefreshToken,
  getSessionUser,
  refreshCookieName,
} from "../../../../lib/platform";
import { getOAuthClientConfig, refreshOAuthToken } from "../../../../lib/oauth";

function safeLocalPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function backToEaw(request: NextRequest) {
  const response = NextResponse.redirect(new URL(getEawLoginUrl("/account"), request.url));
  response.cookies.delete(accessCookieName);
  response.cookies.delete(refreshCookieName);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return backToEaw(request);

  try {
    const { clientId } = getOAuthClientConfig(request.nextUrl.origin);
    const tokens = await refreshOAuthToken(refreshToken, clientId);
    const user = await getSessionUser(tokens.access_token);
    if (!user) return backToEaw(request);

    const next = safeLocalPath(request.nextUrl.searchParams.get("next"));
    const response = NextResponse.redirect(new URL(next, request.url));
    response.cookies.set(accessCookieName, tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    response.cookies.set(refreshCookieName, tokens.refresh_token || refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error(
      "Learning OAuth refresh failed",
      error instanceof Error ? error.message : "unknown",
    );
    return backToEaw(request);
  }
}
