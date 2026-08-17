import { cookies } from "next/headers";
import {
  accessCookieName,
  refreshCookieName,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

export {
  accessCookieName,
  refreshCookieName,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

export async function getAccessToken() {
  return (await cookies()).get(accessCookieName)?.value ?? null;
}

export async function getSessionUser() {
  const token = await getAccessToken();
  if (!token) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ id: string; email?: string }>;
}

export async function userApi(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error("authentication_required");
  return fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}
