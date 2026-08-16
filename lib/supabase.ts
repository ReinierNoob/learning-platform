import { cookies } from "next/headers";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mhjykzrljvtxauaatlom.supabase.co";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_qa9v9qDYMzr3Fr3h0N29gg_1Ip6gfb5";
export const accessCookieName = "eaw_access_token";
export const refreshCookieName = "eaw_refresh_token";

export async function getAccessToken() { return (await cookies()).get(accessCookieName)?.value ?? null; }

export async function getSessionUser() {
  const token = await getAccessToken(); if (!token) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  return response.ok ? response.json() : null;
}

export async function userApi(path: string, init: RequestInit = {}) {
  const token = await getAccessToken(); if (!token) throw new Error("authentication_required");
  return fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
}
