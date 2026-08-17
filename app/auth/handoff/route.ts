import { NextResponse } from "next/server";
import { supabasePublishableKey, supabaseUrl, accessCookieName, refreshCookieName } from "@/lib/supabase";

function safePath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const trainingId = url.searchParams.get("training_id");
  const next = safePath(url.searchParams.get("next"));
  if (!tokenHash || !trainingId) return NextResponse.redirect(new URL("/?auth=invalid", url.origin));

  const verify = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: supabasePublishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ token_hash: tokenHash, type: "magiclink" }),
    cache: "no-store",
  });
  if (!verify.ok) return NextResponse.redirect(new URL("/?auth=expired", url.origin));
  const session = await verify.json();
  if (!session?.access_token || !session?.refresh_token) return NextResponse.redirect(new URL("/?auth=failed", url.origin));

  const accessCheck = await fetch(`${supabaseUrl}/rest/v1/rpc/get_my_learning_access`, {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_training_id: trainingId }),
    cache: "no-store",
  });
  const access = accessCheck.ok ? await accessCheck.json() : null;
  if (!access?.can_access || access.training_id !== trainingId) return NextResponse.redirect(new URL("/?access=denied", url.origin));

  const start = await fetch(`${supabaseUrl}/rest/v1/rpc/start_my_course`, {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_training_id: trainingId }),
    cache: "no-store",
  });
  if (!start.ok) return NextResponse.redirect(new URL("/?access=start-failed", url.origin));

  const destination = new URL(next === "/" && access.course_slug ? `/leren/${access.course_slug}` : next, url.origin);
  destination.search = "";
  const response = NextResponse.redirect(destination);
  response.headers.set("Referrer-Policy", "no-referrer");
  const maxAge = Math.max(60, Number(session.expires_in ?? 3600));
  response.cookies.set(accessCookieName, session.access_token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge });
  response.cookies.set(refreshCookieName, session.refresh_token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
