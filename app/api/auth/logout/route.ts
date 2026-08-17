import { NextRequest, NextResponse } from "next/server";
import { accessCookieName, refreshCookieName } from "../../../../lib/platform";

export async function POST(request: NextRequest) {
  const target = process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account";
  const response = NextResponse.redirect(new URL(target, request.url), 303);
  response.cookies.delete(accessCookieName);
  response.cookies.delete(refreshCookieName);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
