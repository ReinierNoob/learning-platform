import { NextRequest, NextResponse } from "next/server";
import { accessCookieName, refreshCookieName } from "../../../lib/platform";

export async function GET(request: NextRequest) {
  const target = new URL("/", request.url);
  target.searchParams.set("handoff", "retired");
  const response = NextResponse.redirect(target);
  response.cookies.delete(accessCookieName);
  response.cookies.delete(refreshCookieName);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
