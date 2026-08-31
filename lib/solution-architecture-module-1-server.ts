import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule1 } from "./solution-architecture-module-1";

export const module1ClassifierVersion = "module1-classifier-v1";
export const module1AssessmentVersion = "module1-assessment-v1";
export const module1OrchestratorVersion = "adaptive-orchestrator-v2.19";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

export function diagnoseModule1(answers: Record<string, string>) {
  const q1 = normalize(answers["m1-diag-01"]);
  const q2 = normalize(answers["m1-diag-02"]);
  const q3 = normalize(answers["m1-diag-03"]);
  const q4 = normalize(answers["m1-diag-04"]);

  const evidence = [
    { id: "ev-m1-diag-01", objectiveId: "sa.m01.rollen-onderscheiden", passed: q1 === "business-architect / businessverantwoordelijke" },
    { id: "ev-m1-diag-02", objectiveId: "sa.m01.mandaat", passed: q2 === "ik laat dit bij het team zolang er geen bredere architectuurimpact is" },
    { id: "ev-m1-diag-03", objectiveId: "sa.m01.mandaat-invloed", passed: q3 === "ik werk de consequenties uit en leg onaanvaardbare knelpunten terug" },
    { id: "ev-m1-diag-04", objectiveId: "sa.m01.belangen-analyseren", passed: q4 === "projectresultaat op korte termijn versus landschapskwaliteit op langere termijn" },
  ];

  const misconceptions: string[] = [];
  if (q1 === "solution architect") misconceptions.push("sa.mc.solution-architect-gaat-over-businessvraag");
  if (q3 === "ik heb niets meer te beïnvloeden") misconceptions.push("sa.mc.mandaat-is-invloed");

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
  if (misconceptions.includes("sa.mc.solution-architect-gaat-over-businessvraag")) conceptMastery["sa.m01.rollen-onderscheiden"] = "misconception";
  if (misconceptions.includes("sa.mc.mandaat-is-invloed")) conceptMastery["sa.m01.mandaat-invloed"] = "misconception";

  return { route, reasonCode, sequence: [...solutionArchitectureModule1.routes[route]], evidence, misconceptions, conceptMastery };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export function observeModule1Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m1-mandaat-invloed-practice-v1" || interventionId === "m1-invloed-repair-v1") {
    const consequences = /consequent|impact|risico|afhankelijk|knelpunt|haalbaar/.test(answer);
    const returnDecision = /terugleg|escal|beslisser|eigenaar|enterprise|kader/.test(answer);
    const notOverride = !/zelf overrul|negeer|gewoon afwijken/.test(answer);
    const indicators = [consequences ? "consequences" : "", returnDecision ? "decision_owner" : "", notOverride ? "respects_mandate" : ""].filter(Boolean);
    if (consequences && returnDecision && notOverride) return { level: "strong", canProceed: true, feedback: "Je onderscheidt formeel mandaat van professionele invloed: je onderzoekt de impact en legt een onaanvaardbaar knelpunt terug bij de eigenaar van de keuze.", followUp: null, indicators };
    if (consequences || returnDecision) return { level: "partial", canProceed: false, feedback: "Je benoemt een deel van je invloed, maar nog niet zowel de inhoudelijke consequenties als de route terug naar de besliseigenaar.", followUp: "Wat maak jij concreet zichtbaar en wie moet daarna beslissen?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Je antwoord maakt nog onvoldoende onderscheid tussen niet mogen beslissen en niets kunnen beïnvloeden.", followUp: "Welke gevolgen kun je onderzoeken en onderbouwen voordat je het knelpunt teruglegt?", indicators };
  }

  if (interventionId === "m1-conflict-practice-v1") {
    const shortTerm = /snel|drie maanden|project|deadline|korte termijn|live/.test(answer);
    const longTerm = /landschap|lange termijn|schuld|beheer|samenhang|saner/.test(answer);
    const consequences = /consequent|risico|effect|afhankelijk|schuld|kosten/.test(answer);
    const indicators = [shortTerm ? "short_horizon" : "", longTerm ? "long_horizon" : "", consequences ? "consequences" : ""].filter(Boolean);
    if (shortTerm && longTerm && consequences) return { level: "strong", canProceed: true, feedback: "Je maakt het echte spanningsveld zichtbaar: projectwaarde nu tegenover landschapskwaliteit later, inclusief consequenties.", followUp: null, indicators };
    if (shortTerm && longTerm) return { level: "partial", canProceed: false, feedback: "Je ziet de twee tijdshorizonnen. Maak nu nog concreet welk gevolg de snelle of de structurele keuze heeft.", followUp: "Welke schuld, afhankelijkheid of vertraging hoort bij elk alternatief?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Behandel dit niet als een persoonlijk meningsverschil. Zoek naar het verschillende organisatiedoel en de tijdshorizon achter beide standpunten.", followUp: "Waar stuurt de opdrachtgever op, en waar stuurt enterprise-architectuur op?", indicators };
  }

  if (interventionId === "m1-businessvraag-repair-v1") {
    const business = /dienst|business|kanaal|papier|doel|opdrachtgever|waarom/.test(answer);
    return business
      ? { level: "strong", canProceed: true, feedback: "Je legt eerst de dienstverleningskeuze en het doel terug voordat je de oplossing invult.", followUp: null, indicators: ["business_boundary"] }
      : { level: "partial", canProceed: false, feedback: "Maak explicieter welke businesskeuze nog voorafgaat aan het solutionontwerp.", followUp: "Wie beslist over de dienstverlening of het kanaal, en welke uitkomst heb jij nodig?", indicators: [] };
  }

  return null;
}

export const module1AnswerKey: Record<string, number> = {
  "m1-assess-01": 0,
  "m1-assess-02": 2,
  "m1-assess-03": 1,
  "m1-assess-04": 1,
  "m1-assess-05": 1,
  "m1-assess-06": 1,
};

export const module1RemediationByQuestion: Record<string, string[]> = {
  "m1-assess-01": ["m1-rollen-standard-v1", "m1-businessvraag-repair-v1"],
  "m1-assess-02": ["m1-solution-mandaat-standard-v1"],
  "m1-assess-03": ["m1-solution-mandaat-standard-v1"],
  "m1-assess-04": ["m1-mandaat-invloed-practice-v1", "m1-invloed-repair-v1"],
  "m1-assess-05": ["m1-conflict-standard-v1", "m1-conflict-practice-v1"],
  "m1-assess-06": ["m1-solution-mandaat-standard-v1", "m1-conflict-standard-v1"],
};
