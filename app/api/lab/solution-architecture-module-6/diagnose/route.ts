import { NextResponse } from "next/server";
import { routeSequences, type RouteId } from "../../../../../lib/solution-architecture-module-6";

function unavailableInProduction() {
  return process.env.VERCEL_ENV === "production";
}

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

function includesAny(text: string, terms: RegExp[]) {
  return terms.some((term) => term.test(text));
}

export async function POST(request: Request) {
  if (unavailableInProduction()) return new NextResponse(null, { status: 404 });

  const body = await request.json().catch(() => null) as { answers?: Record<string, string> } | null;
  const answers = body?.answers ?? {};

  const q1 = normalize(answers["m6-diag-01"]);
  const q2 = normalize(answers["m6-diag-02"]);
  const q3 = normalize(answers["m6-diag-03"]);
  const q4 = normalize(answers["m6-diag-04"]);

  const evidence = [
    {
      id: "ev-m6-diag-01",
      objectiveId: "sa.m06.dominante-attributen",
      passed: includesAny(q1, [/vertrouw/, /privacy/, /bijzondere persoons/, /gevoelige gegevens/, /kwaliteitsattrib/]),
    },
    {
      id: "ev-m6-diag-02",
      objectiveId: "sa.m06.alternatieven-vergelijken",
      passed: includesAny(q2, [/geen (echte )?beslissing/, /geen (echte )?trade.?off/, /gegeven/, /dominante? optie/, /objectief beter/]),
    },
    {
      id: "ev-m6-diag-03",
      objectiveId: "sa.m06.adr-beoordelen",
      passed: includesAny(q3, [/nadeel/, /negatie/, /last/, /onvolledig/, /niet af/, /alleen posit/]),
    },
    {
      id: "ev-m6-diag-04",
      objectiveId: "sa.m06.waarom-alternatieven",
      passed: includesAny(q4, [/vooraf/, /voordat/, /voor de bouw/, /voor het bouwen/, /afweging.*voor/, /beslissing.*voor/]),
    },
  ];

  const misconceptions: string[] = [];
  if (includesAny(q2, [/trade.?off.*fout/, /gewoon.*beste kiezen/, /altijd.*beste optie/])) misconceptions.push("sa.mc.trade-off-is-fout");
  if (includesAny(q3, [/voldoende/, /prima/, /alleen.*voordeel.*genoeg/, /nadelen.*niet/])) misconceptions.push("sa.mc.consequenties-alleen-positief");
  if (includesAny(q4, [/achteraf/, /erna/, /na de bouw/, /na implement/, /als.*klaar/])) misconceptions.push("sa.mc.adr-achteraf");

  const passedCount = evidence.filter((item) => item.passed).length;
  let route: RouteId = "A";
  let reasonCode = "NO_PRIOR_EVIDENCE";

  if (misconceptions.length > 0 && passedCount >= 2) {
    route = "C";
    reasonCode = "ACTIVE_MISCONCEPTION";
  } else if (passedCount >= 3 && misconceptions.length === 0) {
    route = "B";
    reasonCode = "DEMONSTRATED_WITH_CHECK";
  }

  const mastery: Record<string, string> = Object.fromEntries(
    evidence.map((item) => [item.objectiveId, item.passed ? "demonstrated" : "uncertain"]),
  );
  for (const misconception of misconceptions) {
    if (misconception === "sa.mc.trade-off-is-fout") mastery["sa.m06.alternatieven-vergelijken"] = "misconception";
    if (misconception === "sa.mc.consequenties-alleen-positief") mastery["sa.m06.adr-beoordelen"] = "misconception";
    if (misconception === "sa.mc.adr-achteraf") mastery["sa.m06.waarom-alternatieven"] = "misconception";
  }

  return NextResponse.json({
    route,
    reasonCode,
    sequence: routeSequences[route],
    evidence,
    misconceptions,
    profile: {
      module: 6,
      conceptMastery: mastery,
      routeHistory: [{ route, reasonCode, evidenceIds: evidence.map((item) => item.id) }],
      persistence: "preview-session-only",
    },
  });
}
