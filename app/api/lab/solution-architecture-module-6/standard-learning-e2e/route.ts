import { NextResponse } from "next/server";
import {
  accessCookieName,
  eawPublishableKey,
  eawSupabaseUrl,
} from "../../../../../../lib/platform";

const expectedBranch = "feature/adaptive-solution-architecture-module-6";
const coursePath = "/leren/solution-architectuur-ontwerppraktijk/module/6";
const diagnosisPath = "/api/lab/solution-architecture-module-6/diagnose";

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_GIT_COMMIT_REF !== expectedBranch) {
    return new NextResponse(null, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const email = requestUrl.searchParams.get("email") ?? "";
  const password = requestUrl.searchParams.get("password") ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "credentials_required" }, { status: 400 });
  }

  const signIn = await fetch(`${eawSupabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: eawPublishableKey, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const session = await signIn.json().catch(() => ({})) as { access_token?: string };
  if (!signIn.ok || !session.access_token) {
    return NextResponse.json({ signin: false, status: signIn.status }, { status: 500 });
  }

  const cookieHeader = `${accessCookieName}=${session.access_token}`;
  const origin = requestUrl.origin;

  const moduleResponse = await fetch(`${origin}${coursePath}`, {
    headers: { cookie: cookieHeader },
    redirect: "manual",
    cache: "no-store",
  });
  const moduleHtml = await moduleResponse.text();

  const diagnosisResponse = await fetch(`${origin}${diagnosisPath}`, {
    method: "POST",
    headers: { cookie: cookieHeader, "content-type": "application/json" },
    body: JSON.stringify({
      answers: {
        "m6-diag-01": "Privacy en vertrouwelijkheid zijn dominante kwaliteitsattributen bij gevoelige persoonsgegevens.",
        "m6-diag-02": "Zonder echte alternatieven is er geen echte trade-off en dus geen onderbouwde beslissing.",
        "m6-diag-03": "Een ADR met alleen voordelen is onvolledig; ook nadelen en consequenties horen erin.",
        "m6-diag-04": "Alternatieven en afwegingen moeten vooraf, voor de bouw, worden vastgelegd.",
      },
    }),
    cache: "no-store",
  });
  const diagnosis = await diagnosisResponse.json().catch(() => ({})) as {
    route?: string;
    reasonCode?: string;
    profile?: { persistence?: string };
  };

  const adaptiveMarker = moduleHtml.includes("Module 6 · Adaptieve leerroute")
    || moduleHtml.includes("Eva stelt vier korte vragen")
    || moduleHtml.includes("Ontwerpkeuzes en trade-offs");
  const fixedFlowMarker = moduleHtml.includes("<h2>Hoofdstukken</h2>") || moduleHtml.includes("Na de hoofdstukken");

  return NextResponse.json({
    signin: true,
    module: {
      status: moduleResponse.status,
      redirected: moduleResponse.status >= 300 && moduleResponse.status < 400,
      adaptiveMarker,
      fixedFlowMarker,
    },
    diagnosis: {
      status: diagnosisResponse.status,
      route: diagnosis.route ?? null,
      reasonCode: diagnosis.reasonCode ?? null,
      persistence: diagnosis.profile?.persistence ?? null,
    },
  }, { headers: { "cache-control": "no-store" } });
}
