import { NextRequest, NextResponse } from "next/server";

const EAW_LOGIN_URL = "https://enterprisearchitectureworks.nl/account/inloggen";

export function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  const fetchMode = request.headers.get("sec-fetch-mode");
  const isTopLevelNavigation = !fetchMode || fetchMode === "navigate";

  // Address-bar, bookmark and equivalent direct navigations use Sec-Fetch-Site: none.
  // A training must be entered through the EAW launch flow instead.
  if (fetchSite === "none" && isTopLevelNavigation) {
    const loginUrl = new URL(EAW_LOGIN_URL);
    loginUrl.searchParams.set("next", "/account");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("eaw_learning_access_token");
    response.cookies.delete("eaw_learning_refresh_token");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/leren/:path*"],
};
