import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  getLearningAccess,
  getSessionUser,
  refreshCookieName,
} from "../../../lib/platform";
import {
  exchangeAuthorizationCode,
  getOAuthClientConfig,
  oauthNextCookieName,
  oauthStateCookieName,
  oauthTrainingCookieName,
  oauthVerifierCookieName,
} from "../../../lib/oauth";

function clearTransaction(response: NextResponse) {
  response.cookies.delete(oauthVerifierCookieName);
  response.cookies.delete(oauthStateCookieName);
  response.cookies.delete(oauthTrainingCookieName);
  response.cookies.delete(oauthNextCookieName);
}

function failure(request: NextRequest, reason: string) {
  const target = new URL("/", request.url);
  target.searchParams.set("oauth", reason);
  const response = NextResponse.redirect(target);
  clearTransaction(response);
  response.cookies.delete(accessCookieName);
  response.cookies.delete(refreshCookieName);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  const returnedState = request.nextUrl.searchParams.get("state")?.trim() ?? "";
  const oauthError = request.nextUrl.searchParams.get("error")?.trim();
  if (oauthError) return failure(request, "denied");

  const verifier = request.cookies.get(oauthVerifierCookieName)?.value ?? "";
  const expectedState = request.cookies.get(oauthStateCookieName)?.value ?? "";
  const trainingId = request.cookies.get(oauthTrainingCookieName)?.value ?? "";
  const next = request.cookies.get(oauthNextCookieName)?.value ?? "/";

  if (
    !code ||
    !verifier ||
    !expectedState ||
    returnedState !== expectedState ||
    !/^[0-9a-f-]{36}$/i.test(trainingId)
  ) {
    return failure(request, "invalid-transaction");
  }

  try {
    const { clientId, redirectUri } = getOAuthClientConfig(request.nextUrl.origin);
    const tokens = await exchangeAuthorizationCode({
      code,
      verifier,
      clientId,
      redirectUri,
    });

    const user = await getSessionUser(tokens.access_token);
    if (!user) {
      console.error("Learning OAuth user validation failed");
      return failure(request, "invalid-session");
    }

    const access = await getLearningAccess(trainingId, tokens.access_token);
    if (!access.can_access || access.training_id !== trainingId) {
      return failure(request, "no-access");
    }

    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : access.launch_path || "/";
    const response = NextResponse.redirect(new URL(safeNext, request.url));
    response.cookies.set(accessCookieName, tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    if (tokens.refresh_token) {
      response.cookies.set(refreshCookieName, tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
    } else {
      response.cookies.delete(refreshCookieName);
    }
    clearTransaction(response);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    console.error(
      "Learning OAuth callback failed",
      error instanceof Error ? error.message : "unknown",
    );
    return failure(request, "exchange-failed");
  }
}
