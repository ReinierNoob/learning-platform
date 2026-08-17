export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mhjykzrljvtxauaatlom.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_qa9v9qDYMzr3Fr3h0N29gg_1Ip6gfb5";

export const accessCookieName = "lp_access_token";
export const refreshCookieName = "lp_refresh_token";

export const eawBaseUrl = (
  process.env.NEXT_PUBLIC_EAW_URL ?? "https://enterprise-architecture-works.vercel.app"
).replace(/\/$/, "");

export function eawUrl(path = "/") {
  return `${eawBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
