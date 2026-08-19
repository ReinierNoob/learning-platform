import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  createPkceTransaction,
  getOAuthClientConfig,
  oauthNextCookieName,
  oauthStateCookieName,
  oauthTrainingCookieName,
  oauthVerifierCookieName,
} from "../../../lib/oauth";

function safeLocalPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const trainingId = request.nextUrl.searchParams.get("training_id")?.trim() ?? "";
  const next = safeLocalPath(request.nextUrl.searchParams.get("next"));
  if (!/^[0-9a-f-]{36}$/i.test(trainingId)) {
    return NextResponse.json({ error: "invalid_training" }, { status: 400 });
  }

  let clientId: string;
  let redirectUri: string;
  try {
    ({ clientId, redirectUri } = getOAuthClientConfig(request.nextUrl.origin));
  } catch {
    return NextResponse.json({ error: "oauth_not_configured" }, { status: 503 });
  }

  const { verifier, challenge, state } = createPkceTransaction();
  const target = buildAuthorizationUrl({ clientId, redirectUri, state, challenge });
  const response = NextResponse.redirect(target);
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
  response.cookies.set(oauthVerifierCookieName, verifier, cookieOptions);
  response.cookies.set(oauthStateCookieName, state, cookieOptions);
  response.cookies.set(oauthTrainingCookieName, trainingId, cookieOptions);
  response.cookies.set(oauthNextCookieName, next, cookieOptions);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
