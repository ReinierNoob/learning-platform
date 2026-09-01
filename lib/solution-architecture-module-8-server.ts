import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule8 } from "./solution-architecture-module-8";

export const module8ClassifierVersion = "module8-classifier-v1";
export const module8AssessmentVersion = "module8-assessment-v1";
export const module8OrchestratorVersion = "adaptive-orchestrator-v2.20";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

export function diagnoseModule8(answers: Record<string, string>) {
  const q1 = normalize(answers["m8-diag-01"]);
  const q2 = normalize(answers["m8-diag-02"]);
  const q3 = normalize(answers["m8-diag-03"]);
  const q4 = normalize(answers["m8-diag-04"]);
  const q5 = normalize(answers["m8-diag-05"]);

  const evidence = [
    { id: "ev-m8-diag-01", objectiveId: "sa.m08.principe-onderscheiden", passed: q1 === "een principe geeft richting bij afwegingen; een regel schrijft een uitkomst voor" },
    { id: "ev-m8-diag-02", objectiveId: "sa.m08.principe-beoordelen", passed: q2 === "gegevens worden opgeslagen bij de bronhouder, tenzij aantoonbaar onwerkbaar" },
    { id: "ev-m8-diag-03", objectiveId: "sa.m08.review-toetsen", passed: q3 === "het bezwaar is niet gekoppeld aan een principe, eis of ander toetsbaar kader" },
    { id: "ev-m8-diag-04", objectiveId: "sa.m08.afwijking-beoordelen", passed: q4 === "onderbouwing, consequenties en voorwaarden van de afwijking beoordelen en vastleggen" },
    { id: "ev-m8-diag-05", objectiveId: "sa.m08.review-toetsen", passed: q5 === "de kwaliteit van ontwerp en onderbouwing toetsen aan expliciete eisen en principes" },
  ];

  const misconceptions: string[] = [];
  if (q4 === "automatisch afkeuren") misconceptions.push("sa.mc.principe-is-absolute-verplichting");
  if (q5 === "een goedkeuringsstempel geven zodat het project verder mag") misconceptions.push("sa.mc.review-is-goedkeuringsstempel");

  const passedCount = evidence.filter((item) => item.passed).length;
  let route: AdaptiveRouteId = "A";
  let reasonCode = "NO_PRIOR_EVIDENCE";
  if (misconceptions.length > 0 && passedCount >= 2) {
    route = "C";
    reasonCode = "ACTIVE_MISCONCEPTION";
  } else if (passedCount >= 4 && misconceptions.length === 0) {
    route = "B";
    reasonCode = "DEMONSTRATED_WITH_CHECK";
  }

  const objectiveGroups = new Map<string, boolean[]>();
  for (const item of evidence) {
    const group = objectiveGroups.get(item.objectiveId) ?? [];
    group.push(item.passed);
    objectiveGroups.set(item.objectiveId, group);
  }
  const conceptMastery = Object.fromEntries(
    [...objectiveGroups.entries()].map(([objectiveId, values]) => [objectiveId, values.every(Boolean) ? "demonstrated" : "uncertain"]),
  ) as Record<string, string>;
  if (misconceptions.includes("sa.mc.principe-is-absolute-verplichting")) conceptMastery["sa.m08.afwijking-beoordelen"] = "misconception";
  if (misconceptions.includes("sa.mc.review-is-goedkeuringsstempel")) conceptMastery["sa.m08.review-toetsen"] = "misconception";

  return { route, reasonCode, sequence: [...solutionArchitectureModule8.routes[route]], evidence, misconceptions, conceptMastery };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export function observeModule8Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m8-principe-practice-v1") {
    const direction = /richting|voorkeur|keuze|afweg|uitsluit|ontwerp/.test(answer);
    const condition = /tenzij|wanneer|voorwaarde|uitzonder|aantoon/.test(answer);
    const testable = /concreet|toets|meet|criter|bron|gegeven/.test(answer);
    const indicators = [direction ? "direction" : "", condition ? "exception_condition" : "", testable ? "decision_use" : ""].filter(Boolean);
    if (direction && (condition || testable)) return { level: "strong", canProceed: true, feedback: "Je maakt het principe bruikbaar voor echte ontwerpkeuzes: er is richting én een manier om de toepassing te toetsen.", followUp: null, indicators };
    if (direction || condition) return { level: "partial", canProceed: false, feedback: "Je verbetert de richting, maar maak nog duidelijk hoe een reviewer kan bepalen of een ontwerp eraan voldoet of waarom afwijking bespreekbaar is.", followUp: "Welke concrete ontwerpkeuze moet dit principe kunnen beïnvloeden?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Een ambitie als 'toekomstvast' helpt nog niet kiezen. Maak de voorkeursrichting en toepasbaarheid concreet.", followUp: "Welke ontwerpoptie zou door dit principe minder passend worden?", indicators };
  }

  if (interventionId === "m8-review-practice-v1" || interventionId === "m8-stempel-repair-v1") {
    const principle = /principe|eis|kader|bronhoud/.test(answer);
    const rationale = /onderbouw|waarom|reden|aantoon|context/.test(answer);
    const consequences = /consequent|risico|impact|effect/.test(answer);
    const indicators = [principle ? "explicit_frame" : "", rationale ? "rationale" : "", consequences ? "consequences" : ""].filter(Boolean);
    if (principle && rationale && consequences) return { level: "strong", canProceed: true, feedback: "Je reviewt inhoudelijk: expliciet kader, onderbouwing en consequenties zijn alle drie zichtbaar.", followUp: null, indicators };
    if (principle && (rationale || consequences)) return { level: "partial", canProceed: false, feedback: "Het toetsingskader is helder. Vraag nu ook naar zowel de reden als de consequentie van de afwijking.", followUp: "Wat kost of riskeert deze afwijking, en waarom is dat hier acceptabel?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Een review hoort niet op voorkeur of alleen akkoord te rusten. Koppel het gesprek aan een expliciet principe/eis en vraag naar de onderbouwing.", followUp: "Op welk kader toets je dit ontwerp precies?", indicators };
  }

  if (interventionId === "m8-afwijking-practice-v1" || interventionId === "m8-principe-verplichting-repair-v1") {
    const reason = /reden|waarom|onwerkbaar|context|onderbouw/.test(answer);
    const consequences = /consequent|risico|impact|schuld|effect/.test(answer);
    const endCondition = /termijn|datum|voorwaarde|totdat|herbeoord|review|zes maanden/.test(answer);
    const owner = /eigenaar|verantwoord|beslisser|wie/.test(answer);
    const indicators = [reason ? "reason" : "", consequences ? "consequences" : "", endCondition ? "end_condition" : "", owner ? "owner" : ""].filter(Boolean);
    if (reason && consequences && endCondition) return { level: "strong", canProceed: true, feedback: "De uitzondering is bestuurbaar: reden, consequenties en herbeoordelingsvoorwaarde zijn vastgelegd.", followUp: null, indicators };
    if (indicators.length >= 2) return { level: "partial", canProceed: false, feedback: "Je hebt een deel van de afwijkingsregistratie. Voeg nog de ontbrekende reden, consequentie of eindvoorwaarde toe.", followUp: "Wanneer vervalt de uitzondering of wie moet hem opnieuw beoordelen?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Alleen toestemming is niet genoeg. Maak expliciet waarom je afwijkt, wat dat veroorzaakt en wanneer de afwijking opnieuw moet worden beoordeeld.", followUp: "Welke voorwaarde voorkomt dat tijdelijk permanent wordt?", indicators };
  }

  if (interventionId === "m8-verdedigen-practice-v1") {
    const frame = /principe|eis|kader|afspraak/.test(answer);
    const context = /context|behoefte|belofte|gebruik|situatie/.test(answer);
    const consequences = /consequent|trade.?off|risico|impact|alternatief/.test(answer);
    const indicators = [frame ? "frame" : "", context ? "context" : "", consequences ? "consequences" : ""].filter(Boolean);
    if (frame && context && consequences) return { level: "strong", canProceed: true, feedback: "Je verdediging is toetsbaar: kader, context en consequenties staan centraal in plaats van voorkeur.", followUp: null, indicators };
    if (indicators.length >= 2) return { level: "partial", canProceed: false, feedback: "De redenering is bijna compleet. Maak ook expliciet welke consequentie het alternatief heeft of welk kader je toepast.", followUp: "Welke keuze levert aantoonbaar de beste onderbouwing binnen dit kader?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Vermijd 'ik vind'. Bouw je verdediging op uit het toetsingskader, de specifieke context en de consequenties van alternatieven.", followUp: "Welk principe of welke eis is hier relevant?", indicators };
  }

  return null;
}

export const module8AnswerKey: Readonly<Record<string, number>> = {
  "m8-assess-01": 1,
  "m8-assess-02": 1,
  "m8-assess-03": 2,
  "m8-assess-04": 1,
  "m8-assess-05": 1,
  "m8-assess-06": 1,
};

export const module8RemediationByQuestion: Readonly<Record<string, string[]>> = {
  "m8-assess-01": ["m8-principe-standard-v1"],
  "m8-assess-02": ["m8-principe-standard-v1", "m8-principe-practice-v1"],
  "m8-assess-03": ["m8-review-standard-v1", "m8-review-practice-v1"],
  "m8-assess-04": ["m8-afwijking-standard-v1", "m8-afwijking-practice-v1"],
  "m8-assess-05": ["m8-review-standard-v1", "m8-stempel-repair-v1"],
  "m8-assess-06": ["m8-afwijking-standard-v1", "m8-principe-verplichting-repair-v1"],
};
