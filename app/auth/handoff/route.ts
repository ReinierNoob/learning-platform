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
  const accessToken = String(verified.access_token ?? "");
  const refreshToken = String(verified.refresh_token ?? "");
  if (!verifyResponse.ok || !accessToken || !refreshToken) {
    return failureRedirect(request, "expired-or-used");
  }

  try {
    const access = await getLearningAccess(trainingId, accessToken);
    if (!access.can_access || access.training_id !== trainingId) {
      return failureRedirect(request, "no-access");
    }
  } catch {
    return failureRedirect(request, "no-access");
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  const cookieBase = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
  };
  const expiresIn = Math.max(60, Number(verified.expires_in ?? 3600) - 60);
  response.cookies.set(accessCookieName, accessToken, { ...cookieBase, maxAge: expiresIn });
  response.cookies.set(refreshCookieName, refreshToken, { ...cookieBase, maxAge: 30 * 24 * 60 * 60 });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
