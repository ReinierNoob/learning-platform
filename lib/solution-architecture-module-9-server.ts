import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule9 } from "./solution-architecture-module-9";

export const module9ClassifierVersion = "module9-classifier-v1";
export const module9AssessmentVersion = "module9-assessment-v1";
export const module9OrchestratorVersion = "adaptive-orchestrator-v2.20";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

export function diagnoseModule9(answers: Record<string, string>) {
  const q1 = normalize(answers["m9-diag-01"]);
  const q2 = normalize(answers["m9-diag-02"]);
  const q3 = normalize(answers["m9-diag-03"]);
  const q4 = normalize(answers["m9-diag-04"]);

  const evidence = [
    { id: "ev-m9-diag-01", objectiveId: "sa.m09.tussenstappen", passed: q1 === "dat de stap zelfstandig waarde levert en een stabiele basis voor vervolg vormt" },
    { id: "ev-m9-diag-02", objectiveId: "sa.m09.volgorde", passed: q2 === "omdat je zonder vastgestelde identiteit niet verantwoord kunt bepalen wiens status je toont" },
    { id: "ev-m9-diag-03", objectiveId: "sa.m09.risico-beheersen", passed: q3 === "wanneer de tijdelijke extra kosten lager zijn dan de potentiële schade van een mislukte overgang" },
    { id: "ev-m9-diag-04", objectiveId: "sa.m09.risico-beheersen", passed: q4 === "dat criteria en herstelpad vooraf zijn bepaald zodat een mislukte overgang beheerst kan worden teruggedraaid" },
  ];

  const misconceptions: string[] = [];
  if (q1 === "dat ongeveer de helft van het eindbeeld gebouwd is") {
    misconceptions.push("sa.mc.tussenstap-is-half-product");
  }
  if (q4 === "dat het team weinig vertrouwen heeft") {
    misconceptions.push("sa.mc.rollback-is-falen");
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
    "sa.m09.tussenstappen": evidence[0].passed ? "demonstrated" : "uncertain",
    "sa.m09.waarde-per-stap": evidence[0].passed ? "demonstrated" : "uncertain",
    "sa.m09.volgorde": evidence[1].passed ? "demonstrated" : "uncertain",
    "sa.m09.risico-beheersen": evidence[2].passed && evidence[3].passed ? "demonstrated" : "uncertain",
  };
  if (misconceptions.includes("sa.mc.tussenstap-is-half-product")) {
    conceptMastery["sa.m09.tussenstappen"] = "misconception";
    conceptMastery["sa.m09.waarde-per-stap"] = "misconception";
  }
  if (misconceptions.includes("sa.mc.rollback-is-falen")) conceptMastery["sa.m09.risico-beheersen"] = "misconception";

  return { route, reasonCode, sequence: [...solutionArchitectureModule9.routes[route]], evidence, misconceptions, conceptMastery };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export function observeModule9Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m9-tussenstap-practice-v1" || interventionId === "m9-half-product-repair-v1") {
    const scopedValue = /digitale indien|aanvraag|waarde|burger|gebruik|dienst/.test(answer);
    const stable = /zelfstandig|stabiel|werkend|bruikbaar|afgerond|operationeel/.test(answer);
    const limitedChange = /intern|ongewijzigd|later|nog niet|stap/.test(answer);
    const indicators = [scopedValue ? "value" : "", stable ? "stable_state" : "", limitedChange ? "bounded_scope" : ""].filter(Boolean);
    if (scopedValue && stable && limitedChange) return { level: "strong", canProceed: true, feedback: "Je tussenstap levert zelfstandig waarde en houdt de veranderomvang bewust beperkt.", followUp: null, indicators };
    if (scopedValue && (stable || limitedChange)) return { level: "partial", canProceed: false, feedback: "De stap lijkt waardevol. Maak nog duidelijk waarom hij zelfstandig bruikbaar is en wat bewust pas later verandert.", followUp: "Wat kan Middelveen na deze stap al echt gebruiken?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Beschrijf geen technisch half product. Zoek een kleinere toestand die de organisatie zelfstandig kan gebruiken.", followUp: "Welke afgeronde gebruikssituatie kan als eerste live?", indicators };
  }

  if (interventionId === "m9-volgorde-practice-v1") {
    const identity = /identiteit|digid|authentic|wie/.test(answer);
    const access = /status|tonen|gegevens|inzage|privacy/.test(answer);
    const isolate = /oorzaak|isol|één wijzig|los|apart|storing|diagnos/.test(answer);
    const indicators = [identity ? "identity_dependency" : "", access ? "personal_access" : "", isolate ? "change_isolation" : ""].filter(Boolean);
    if (identity && access && isolate) return { level: "strong", canProceed: true, feedback: "Je ziet zowel de functionele afhankelijkheid als het operationele voordeel van gecontroleerde volgorde.", followUp: null, indicators };
    if (identity && access) return { level: "partial", canProceed: false, feedback: "De inhoudelijke afhankelijkheid klopt. Benoem ook waarom twee grote wijzigingen tegelijk foutdiagnose en herstel moeilijker maken.", followUp: "Hoe weet je na een storing welke wijziging de oorzaak was?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Bepaal eerst welke capability de andere nodig heeft en welke risico's gelijktijdige livegang introduceert.", followUp: "Wat moet betrouwbaar werken voordat persoonlijke status veilig getoond kan worden?", indicators };
  }

  if (interventionId === "m9-risico-practice-v1" || interventionId === "m9-rollback-repair-v1") {
    const threshold = /percentage|grens|criter|5%|fout|slo|drempel/.test(answer);
    const time = /tijd|uur|minuut|duur|binnen|herstelvenster/.test(answer);
    const impact = /dienst|burger|aanvraag|schade|impact|veilig|beschikbaar/.test(answer);
    const recovery = /rollback|terug|herstel|reconcil|gegevens|oude/.test(answer);
    const indicators = [threshold ? "threshold" : "", time ? "time_window" : "", impact ? "service_impact" : "", recovery ? "recovery_path" : ""].filter(Boolean);
    if (threshold && impact && recovery) return { level: "strong", canProceed: true, feedback: "Je maakt rollback bestuurbaar met een drempel, dienstverleningsimpact en een vooraf bekend herstelpad.", followUp: null, indicators };
    if (indicators.length >= 2) return { level: "partial", canProceed: false, feedback: "Je hebt meerdere relevante criteria. Maak nog expliciet wanneer de grens tot daadwerkelijk terugvallen leidt en hoe herstel plaatsvindt.", followUp: "Welke meetbare grens betekent: nu niet meer doorrepareren?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Een rollbackbesluit mag niet pas tijdens het incident op gevoel ontstaan. Leg meetbare signalen en herstelpad vooraf vast.", followUp: "Welke foutdrempel en welke impact op dienstverlening zijn onacceptabel?", indicators };
  }

  return null;
}

export const module9AnswerKey: Readonly<Record<string, number>> = {
  "m9-assess-01": 1,
  "m9-assess-02": 1,
  "m9-assess-03": 1,
  "m9-assess-04": 1,
  "m9-assess-05": 1,
  "m9-assess-06": 1,
};

export const module9RemediationByQuestion: Readonly<Record<string, string[]>> = {
  "m9-assess-01": ["m9-tussenstappen-standard-v1", "m9-half-product-repair-v1"],
  "m9-assess-02": ["m9-tussenstappen-standard-v1", "m9-tussenstap-practice-v1"],
  "m9-assess-03": ["m9-afhankelijkheden-standard-v1", "m9-volgorde-practice-v1"],
  "m9-assess-04": ["m9-afhankelijkheden-standard-v1", "m9-volgorde-practice-v1"],
  "m9-assess-05": ["m9-rollback-standard-v1", "m9-risico-practice-v1"],
  "m9-assess-06": ["m9-dubbeldraaien-standard-v1", "m9-risico-practice-v1"],
};
