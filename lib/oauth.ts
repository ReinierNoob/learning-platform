import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { eawSupabaseUrl } from "./platform";

export const oauthVerifierCookieName = "eaw_oauth_code_verifier";
export const oauthStateCookieName = "eaw_oauth_state";
export const oauthTrainingCookieName = "eaw_oauth_training_id";
export const oauthNextCookieName = "eaw_oauth_next";

// Public OAuth client IDs are identifiers, not secrets. Keep the registered
// production client as the safe default while allowing an environment-specific
// override for preview/staging clients.
const defaultEawOAuthClientId = "a9e1ab6e-562e-4ddc-8ba6-853ed840fbe6";

export type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

function base64Url(value: Buffer) {
  return value.toString("base64url");
}

export function createPkceTransaction() {
  const verifier = base64Url(randomBytes(32));
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = base64Url(randomBytes(32));
  return { verifier, challenge, state };
}

export function getOAuthClientConfig(origin: string) {
  const clientId = process.env.EAW_OAUTH_CLIENT_ID?.trim() || defaultEawOAuthClientId;
  const redirectUri =
    process.env.EAW_OAUTH_REDIRECT_URI?.trim() ||
    new URL("/auth/callback", origin).toString();
  return { clientId, redirectUri };
}

export function buildAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  challenge,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  challenge: string;
}) {
  const target = new URL(`${eawSupabaseUrl}/auth/v1/oauth/authorize`);
  target.searchParams.set("response_type", "code");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("redirect_uri", redirectUri);
  target.searchParams.set("scope", "email");
  target.searchParams.set("state", state);
  target.searchParams.set("code_challenge", challenge);
  target.searchParams.set("code_challenge_method", "S256");
  return target;
}

async function tokenRequest(body: URLSearchParams): Promise<OAuthTokenResponse> {
  const response = await fetch(`${eawSupabaseUrl}/auth/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) {
    throw new Error(`oauth_token_exchange_failed:${response.status}`);
  }
  return result as OAuthTokenResponse;
}

export function exchangeAuthorizationCode({
  code,
  verifier,
  clientId,
  redirectUri,
}: {
  code: string;
  verifier: string;
  clientId: string;
  redirectUri: string;
}) {
  return tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  );
}

export function refreshOAuthToken(refreshToken: string, clientId: string) {
  return tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  );
}
