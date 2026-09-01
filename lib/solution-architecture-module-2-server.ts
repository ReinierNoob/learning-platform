import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule2 } from "./solution-architecture-module-2";

export const module2ClassifierVersion = "module2-classifier-v1";
export const module2AssessmentVersion = "module2-assessment-v1";
export const module2OrchestratorVersion = "adaptive-orchestrator-v2.19";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

export function diagnoseModule2(answers: Record<string, string>) {
  const q1 = normalize(answers["m2-diag-01"]);
  const q2 = normalize(answers["m2-diag-02"]);
  const q3 = normalize(answers["m2-diag-03"]);
  const q4 = normalize(answers["m2-diag-04"]);

  const evidence = [
    { id: "ev-m2-diag-01", objectiveId: "sa.m02.werkbare-opdracht", passed: q1 === "de vooraf gekozen oplossing" },
    { id: "ev-m2-diag-02", objectiveId: "sa.m02.scope-afbakenen", passed: q2 === "wat betekent 'volledig' — alleen indiening of ook andere stappen en kanalen?" },
    { id: "ev-m2-diag-03", objectiveId: "sa.m02.ontbrekende-informatie", passed: q3 === "als openstaand punt vastleggen en terugleggen bij de opdrachtgever" },
    { id: "ev-m2-diag-04", objectiveId: "sa.m02.aannames-herkennen", passed: q4 === "het onderliggende doel kan werklastvermindering zijn; digitalisering is mogelijk het middel" },
  ];

  const misconceptions: string[] = [];
  if (q1 !== "de vooraf gekozen oplossing" && q1) misconceptions.push("sa.mc.oplossing-is-opdracht");
  if (q3 === "buiten scope zetten en vergeten") misconceptions.push("sa.mc.buiten-scope-is-onbelangrijk");
  if (q2 === "welk platform gebruiken we?" || q2 === "welke programmeertaal gebruiken we?") misconceptions.push("sa.mc.opdrachtgever-formuleert-vraag-volledig");

  const passedCount = evidence.filter((item) => item.passed).length;
  let route: AdaptiveRouteId = "A";
  let reasonCode = "NO_PRIOR_EVIDENCE";
  if (misconceptions.length > 0 && passedCount >= 2) {
    route = "C";
    reasonCode = "ACTIVE_MISCONCEPTION";
  } else if (passedCount >= 3 && misconceptions.length === 0) {
    route = "B";
    reasonCode = "DEMONSTRATED_WITH_CHECK";
  }

  const conceptMastery: Record<string, string> = Object.fromEntries(
    evidence.map((item) => [item.objectiveId, item.passed ? "demonstrated" : "uncertain"]),
  );
  if (misconceptions.includes("sa.mc.oplossing-is-opdracht")) conceptMastery["sa.m02.werkbare-opdracht"] = "misconception";
  if (misconceptions.includes("sa.mc.buiten-scope-is-onbelangrijk")) conceptMastery["sa.m02.scope-afbakenen"] = "misconception";

  return { route, reasonCode, sequence: [...solutionArchitectureModule2.routes[route]], evidence, misconceptions, conceptMastery };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export function observeModule2Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m2-scope-practice-v1") {
    const scope = /volledig|indiening|keuring|status|kanaal|stap|scope|wel.*niet/.test(answer);
    const beforeSolution = /voor|eerst|voordat|anders|oploss|ontwerp/.test(answer);
    const indicators = [scope ? "scope_boundary" : "", beforeSolution ? "before_solution" : ""].filter(Boolean);
    if (scope && beforeSolution) return { level: "strong", canProceed: true, feedback: "Je maakt eerst de betekenis en grens van de opdracht expliciet voordat je een oplossing invult.", followUp: null, indicators };
    if (scope) return { level: "partial", canProceed: false, feedback: "De scopevraag is bruikbaar. Leg nog uit waarom het antwoord nodig is vóór je een ontwerp kiest.", followUp: "Welke oplossingskeuze zou anders op een onbevestigde scope rusten?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Je antwoord springt nog te snel naar oplossing, planning of techniek. Begin bij de betekenis van 'volledig'.", followUp: "Welke stappen of kanalen kunnen wel of niet onder 'volledig digitaal' vallen?", indicators };
  }

  if (interventionId === "m2-aannames-practice-v1") {
    const openPoint = /openstaand|aanname|onduidelijk|vastleg|vraag/.test(answer);
    const returnOwner = /opdrachtgever|business|eigenaar|terugleg|beslis/.test(answer);
    const notSelfDesign = !/ik ontwerp zelf|zelf alternatief|ik kies/.test(answer);
    const indicators = [openPoint ? "explicit_open_point" : "", returnOwner ? "decision_owner" : "", notSelfDesign ? "no_business_overreach" : ""].filter(Boolean);
    if (openPoint && returnOwner && notSelfDesign) return { level: "strong", canProceed: true, feedback: "Je behandelt de ontbrekende doelgroep-/kanaalkeuze als expliciet open punt en legt de businessbeslissing terug bij de juiste eigenaar.", followUp: null, indicators };
    if (openPoint || returnOwner) return { level: "partial", canProceed: false, feedback: "Je ziet dat dit niet stilzwijgend aangenomen mag worden. Maak nog expliciet wie de dienstverleningskeuze bevestigt.", followUp: "Wie bepaalt hoe burgers zonder het digitale middel bediend worden?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Neem niet automatisch aan dat iedereen hetzelfde digitale kanaal kan gebruiken en ontwerp het alternatief ook niet zelfstandig.", followUp: "Hoe maak je de onzekerheid zichtbaar en bij wie leg je haar neer?", indicators };
  }

  if (interventionId === "m2-opdrachtgever-repair-v1") {
    const missingTypes = [/scope/, /aanname/, /doel/, /randvoorwaarde/, /resultaat/, /stakeholder/].filter((term) => term.test(answer)).length;
    return missingTypes >= 2
      ? { level: "strong", canProceed: true, feedback: "Je benoemt meerdere soorten informatie die de architect actief completeert voordat ontwerpwerk start.", followUp: null, indicators: ["active_completion"] }
      : { level: "partial", canProceed: false, feedback: "Noem niet alleen dat informatie ontbreekt, maar welke categorieën je boven tafel haalt.", followUp: "Denk aan doel/resultaat, scope, aannames en randvoorwaarden.", indicators: [] };
  }

  if (interventionId === "m2-buiten-scope-repair-v1") {
    const ownership = /beleg|eigenaar|wie|verantwoord/.test(answer);
    const dependency = /afhankelijk|impact|gevolg|later|moment|voorwaarde/.test(answer);
    const indicators = [ownership ? "ownership" : "", dependency ? "dependency" : ""].filter(Boolean);
    if (ownership && dependency) return { level: "strong", canProceed: true, feedback: "Juist: buiten scope blijft zichtbaar door eigenaarschap en afhankelijkheid expliciet vast te leggen.", followUp: null, indicators };
    return { level: "partial", canProceed: false, feedback: "Maak behalve 'buiten scope' ook zichtbaar waar het onderwerp landt en wat jouw oplossing ervan afhankelijk maakt.", followUp: "Wie pakt het op en welke relatie met jouw oplossing blijft bestaan?", indicators };
  }

  return null;
}

export const module2AnswerKey: Record<string, number> = {
  "m2-assess-01": 2,
  "m2-assess-02": 1,
  "m2-assess-03": 1,
  "m2-assess-04": 1,
  "m2-assess-05": 2,
  "m2-assess-06": 1,
};

export const module2RemediationByQuestion: Record<string, string[]> = {
  "m2-assess-01": ["m2-opdracht-standard-v1"],
  "m2-assess-02": ["m2-aannames-standard-v1"],
  "m2-assess-03": ["m2-scope-standard-v1", "m2-scope-practice-v1"],
  "m2-assess-04": ["m2-aannames-standard-v1", "m2-aannames-practice-v1"],
  "m2-assess-05": ["m2-aannames-standard-v1"],
  "m2-assess-06": ["m2-vraag-achter-vraag-standard-v1"],
};
