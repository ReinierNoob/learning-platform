import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule3 } from "./solution-architecture-module-3";

export const module3ClassifierVersion = "module3-classifier-v1";
export const module3AssessmentVersion = "module3-assessment-v1";
export const module3OrchestratorVersion = "adaptive-orchestrator-v2.19";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

export function diagnoseModule3(answers: Record<string, string>) {
  const q1 = normalize(answers["m3-diag-01"]);
  const q2 = normalize(answers["m3-diag-02"]);
  const q3 = normalize(answers["m3-diag-03"]);
  const q4 = normalize(answers["m3-diag-04"]);

  const evidence = [
    { id: "ev-m3-diag-01", objectiveId: "sa.m03.stakeholders-identificeren", passed: q1 === "de burger die namens een ander een aanvraag indient" },
    { id: "ev-m3-diag-02", objectiveId: "sa.m03.toetsbare-eis", passed: q2 === "een volledige aanvraag levert binnen tien werkdagen een besluit op" },
    { id: "ev-m3-diag-03", objectiveId: "sa.m03.belangenconflict", passed: q3 === "een reëel belangenconflict dat expliciete besluitvorming vraagt" },
    { id: "ev-m3-diag-04", objectiveId: "sa.m03.belangenconflict", passed: q4 === "consequenties en opties voorleggen aan degene die de belangen mag prioriteren" },
  ];

  const misconceptions: string[] = [];
  if (q4 === "zelf de beste eis kiezen" || q4 === "zelf een compromis vastleggen") {
    misconceptions.push("sa.mc.architect-kiest-bij-botsende-belangen");
  }
  if (q2 === "de doorlooptijd moet korter dan nu") {
    misconceptions.push("sa.mc.getal-maakt-eis-toetsbaar");
  }

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

  const conceptMastery: Record<string, string> = {
    "sa.m03.stakeholders-identificeren": evidence[0].passed ? "demonstrated" : "uncertain",
    "sa.m03.toetsbare-eis": evidence[1].passed ? "demonstrated" : "uncertain",
    "sa.m03.eis-beoordelen": evidence[1].passed ? "demonstrated" : "uncertain",
    "sa.m03.belangenconflict": evidence[2].passed && evidence[3].passed ? "demonstrated" : "uncertain",
  };
  if (misconceptions.includes("sa.mc.architect-kiest-bij-botsende-belangen")) conceptMastery["sa.m03.belangenconflict"] = "misconception";
  if (misconceptions.includes("sa.mc.getal-maakt-eis-toetsbaar")) conceptMastery["sa.m03.toetsbare-eis"] = "misconception";

  return { route, reasonCode, sequence: [...solutionArchitectureModule3.routes[route]], evidence, misconceptions, conceptMastery };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

function hasTestableRequirement(text: string) {
  const subject = /aanvraag|besluit|status|systeem|portaal|gebruiker|burger/.test(text);
  const threshold = /\d|binnen|maximaal|minimaal|ten minste|uiterlijk|%|procent/.test(text);
  const measure = /dag|werkdag|uur|minuut|seconde|tijd|percentage|beschikbaar|fout|aanvraag/.test(text);
  return subject && threshold && measure;
}

export function observeModule3Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m3-afwezige-stakeholder-practice-v1") {
    const stakeholder = /burger|gemachtigd|mantelzorger|vertegenwoordiger|beheer|medewerker|toezicht|support|leverancier/.test(answer);
    const interest = /belang|toegang|gebruik|privacy|beheer|last|risico|informatie|behoefte|gevolg/.test(answer);
    const indicators = [stakeholder ? "stakeholder" : "", interest ? "stakeholder_interest" : ""].filter(Boolean);
    if (stakeholder && interest) return { level: "strong", canProceed: true, feedback: "Je kijkt buiten de vergadertafel én koppelt de stakeholder aan een concreet belang of gevolg.", followUp: null, indicators };
    if (stakeholder) return { level: "partial", canProceed: false, feedback: "De afwezige stakeholder is aannemelijk. Maak nog expliciet welk belang of risico je van deze groep moet onderzoeken.", followUp: "Wat verandert er voor deze stakeholder door de oplossing?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Zoek naar groepen die de oplossing gebruiken, beheren of er gevolgen van ondervinden zonder noodzakelijk aan tafel te zitten.", followUp: "Wie kan namens een burger handelen of achteraf met de oplossing moeten werken?", indicators };
  }

  if (interventionId === "m3-toetsbaar-practice-v1" || interventionId === "m3-getal-repair-v1") {
    const testable = hasTestableRequirement(answer);
    const context = /tijdens|vanaf|na |per |bij |volledig|gemeten|meet|werkdag|kantoor/.test(answer);
    const indicators = [testable ? "measurable_requirement" : "", context ? "measurement_context" : ""].filter(Boolean);
    if (testable && context) return { level: "strong", canProceed: true, feedback: "De eis bevat een controleerbaar criterium en voldoende context om later te kunnen vaststellen of eraan wordt voldaan.", followUp: null, indicators };
    if (testable) return { level: "partial", canProceed: false, feedback: "Je hebt een meetbare grens. Voeg nog de relevante meetcontext of het meetmoment toe als die voor interpretatie nodig is.", followUp: "Wanneer begint en eindigt de meting, of onder welke omstandigheden geldt de norm?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "De formulering geeft nog richting, maar geen objectief criterium waarmee je voldoende en onvoldoende kunt onderscheiden.", followUp: "Wat meet je precies en welke grens geldt?", indicators };
  }

  if (interventionId === "m3-conflict-practice-v1" || interventionId === "m3-architect-kiest-repair-v1") {
    const consequences = /consequent|effect|risico|impact|voor.*nadeel|alternatief|optie/.test(answer);
    const decisionOwner = /beslisser|eigenaar|opdrachtgever|business|bevoegd|terugleg|voorleg/.test(answer);
    const notSelfChoose = !/ik kies|zelf kiezen|ik beslis|ik hak/.test(answer);
    const indicators = [consequences ? "consequences" : "", decisionOwner ? "decision_owner" : "", notSelfChoose ? "no_priority_overreach" : ""].filter(Boolean);
    if (consequences && decisionOwner && notSelfChoose) return { level: "strong", canProceed: true, feedback: "Je maakt de patstelling beslisbaar zonder zelf het businessbelang te prioriteren: opties en consequenties gaan naar de bevoegde eigenaar.", followUp: null, indicators };
    if (consequences || decisionOwner) return { level: "partial", canProceed: false, feedback: "Je zit op de juiste lijn, maar maak zowel de consequenties als de besliseigenaar expliciet.", followUp: "Wat moet de beslisser precies naast elkaar kunnen zien?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Een architect lost een belangenpatstelling niet automatisch op door zelf te kiezen. Maak eerst de gevolgen van de alternatieven zichtbaar.", followUp: "Welke opties en consequenties leg je voor, en aan wie?", indicators };
  }

  return null;
}

export const module3AnswerKey: Record<string, number> = {
  "m3-assess-01": 2,
  "m3-assess-02": 1,
  "m3-assess-03": 1,
  "m3-assess-04": 1,
  "m3-assess-05": 1,
  "m3-assess-06": 2,
};

export const module3RemediationByQuestion: Record<string, string[]> = {
  "m3-assess-01": ["m3-stakeholders-standard-v1", "m3-afwezige-stakeholder-practice-v1"],
  "m3-assess-02": ["m3-wens-naar-eis-standard-v1", "m3-toetsbaar-practice-v1"],
  "m3-assess-03": ["m3-wens-naar-eis-standard-v1", "m3-getal-repair-v1"],
  "m3-assess-04": ["m3-conflict-standard-v1", "m3-conflict-practice-v1"],
  "m3-assess-05": ["m3-conflict-standard-v1"],
  "m3-assess-06": ["m3-architect-kiest-repair-v1", "m3-conflict-practice-v1"],
};
