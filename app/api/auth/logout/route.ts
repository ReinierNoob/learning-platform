import { NextResponse } from "next/server";
import { accessCookieName, refreshCookieName } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(accessCookieName, "", { path: "/", maxAge: 0 });
  response.cookies.set(refreshCookieName, "", { path: "/", maxAge: 0 });
  return response;
}
