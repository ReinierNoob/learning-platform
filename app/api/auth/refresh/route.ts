import { NextRequest, NextResponse } from "next/server";
import {
  accessCookieName,
  getEawLoginUrl,
  refreshCookieName,
} from "../../../../lib/platform";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(getEawLoginUrl("/account"), request.url));
  response.cookies.delete(accessCookieName);
  response.cookies.delete(refreshCookieName);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
