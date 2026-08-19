import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  eawPublishableKey,
  eawSupabaseUrl,
  getLearningAccess,
  getSessionUser,
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
  response.cookies.delete(accessCookieName);
  response.cookies.delete(refreshCookieName);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash")?.trim() ?? "";
  const verificationType = request.nextUrl.searchParams.get("type")?.trim() || "magiclink";
  const trainingId = request.nextUrl.searchParams.get("training_id")?.trim() ?? "";
  const next = safeLocalPath(request.nextUrl.searchParams.get("next"));

  if (
    !tokenHash ||
    verificationType !== "magiclink" ||
    !/^[0-9a-f-]{36}$/i.test(trainingId)
  ) {
    return failureRedirect(request, "invalid");
  }

  const verifyResponse = await fetch(`${eawSupabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: eawPublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token_hash: tokenHash, type: verificationType }),
    cache: "no-store",
  });

  const verified = await verifyResponse.json().catch(() => ({}));
  const accessToken = String(verified.access_token ?? "");
  if (!verifyResponse.ok || !accessToken) {
    return failureRedirect(request, "expired-or-used");
  }

  const user = await getSessionUser(accessToken);
  if (!user) {
    console.error("Learning handoff Auth session validation failed");
    return failureRedirect(request, "invalid-session");
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
  response.cookies.set(accessCookieName, accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  response.cookies.delete(refreshCookieName);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
