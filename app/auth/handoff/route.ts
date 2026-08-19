import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  eawPublishableKey,
  eawSupabaseUrl,
  getLearningAccess,
  refreshCookieName,
} from "../../../lib/platform";

function safeLocalPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function failureRedirect(request: NextRequest, reason: string) {
  const target = new URL("/", request.url);
  target.searchParams.set("handoff", reason);
  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash")?.trim() ?? "";
  const trainingId = request.nextUrl.searchParams.get("training_id")?.trim() ?? "";
  const next = safeLocalPath(request.nextUrl.searchParams.get("next"));

  if (!tokenHash || !/^[0-9a-f-]{36}$/i.test(trainingId)) {
    return failureRedirect(request, "invalid");
  }

  const verifyResponse = await fetch(`${eawSupabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: eawPublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token_hash: tokenHash, type: "email" }),
    cache: "no-store",
  });

  const verified = await verifyResponse.json().catch(() => ({}));
  const verifiedAccessToken = String(verified.access_token ?? "");
  const verifiedRefreshToken = String(verified.refresh_token ?? "");
  if (!verifyResponse.ok || !verifiedAccessToken || !verifiedRefreshToken) {
    return failureRedirect(request, "expired-or-used");
  }

  // Refresh the newly verified session before calling the Data API. The token returned
  // directly by /verify can be accepted by Auth while the immediately following
  // PostgREST request is rejected. Persist the rotated refresh token, not the old one.
  const refreshResponse = await fetch(`${eawSupabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: eawPublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: verifiedRefreshToken }),
    cache: "no-store",
  });

  const refreshed = await refreshResponse.json().catch(() => ({}));
  const accessToken = String(refreshed.access_token ?? "");
  const refreshToken = String(refreshed.refresh_token ?? "");
  if (!refreshResponse.ok || !accessToken || !refreshToken) {
    console.error("Learning handoff session refresh failed", refreshResponse.status);
    return failureRedirect(request, "session-refresh-failed");
  }

  try {
    const access = await getLearningAccess(trainingId, accessToken);
    if (!access.can_access || access.training_id !== trainingId) {
      return failureRedirect(request, "no-access");
    }
  } catch (error) {
    console.error(
      "Learning handoff access check failed",
      error instanceof Error ? error.message : "unknown",
    );
    return failureRedirect(request, "no-access");
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  const cookieBase = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
  };
  const expiresIn = Math.max(60, Number(refreshed.expires_in ?? 3600) - 60);
  response.cookies.set(accessCookieName, accessToken, { ...cookieBase, maxAge: expiresIn });
  response.cookies.set(refreshCookieName, refreshToken, { ...cookieBase, maxAge: 30 * 24 * 60 * 60 });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
