import { NextResponse } from "next/server";
import { accessCookieName, eawUrl, refreshCookieName } from "@/lib/config";

export async function POST() {
  const response = NextResponse.redirect(eawUrl("/account"), { status: 303 });
  response.cookies.set(accessCookieName, "", { path: "/", maxAge: 0 });
  response.cookies.set(refreshCookieName, "", { path: "/", maxAge: 0 });
  return response;
}
