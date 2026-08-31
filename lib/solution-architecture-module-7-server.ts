import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule7 } from "./solution-architecture-module-7";

export const module7ClassifierVersion = "module7-classifier-v1";
export const module7AssessmentVersion = "module7-assessment-v1";
export const module7OrchestratorVersion = "adaptive-orchestrator-v2.20";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

export function diagnoseModule7(answers: Record<string, string>) {
  const q1 = normalize(answers["m7-diag-01"]);
  const q2 = normalize(answers["m7-diag-02"]);
  const q3 = normalize(answers["m7-diag-03"]);
  const q4 = normalize(answers["m7-diag-04"]);

  const evidence = [
    { id: "ev-m7-diag-01", objectiveId: "sa.m07.koppelvormen", passed: q1 === "de verzender bepaalt wanneer relevante informatie wordt aangeboden" },
    { id: "ev-m7-diag-02", objectiveId: "sa.m07.afhankelijkheid", passed: q2 === "pas als ook betekenis, eigenaarschap, wijziging en foutafhandeling zijn afgesproken" },
    { id: "ev-m7-diag-03", objectiveId: "sa.m07.koppelvorm-kiezen", passed: q3 === "een gebeurtenis per uitslag met bevestiging en logging" },
    { id: "ev-m7-diag-04", objectiveId: "sa.m07.wendbaarheid", passed: q4 === "omdat de bestaande koppeling een andere belofte kan hebben en oprekken bestaande afnemers kan raken" },
  ];

  const misconceptions: string[] = [];
  if (q2 === "zodra er http 200 terugkomt" || q2 === "zodra monitoring groen is") {
    misconceptions.push("sa.mc.koppeling-is-alleen-techniek");
  }
  if (q4 === "hergebruik is altijd beter; bestaande koppelingen moet je daarom altijd oprekken") {
    misconceptions.push("sa.mc.hergebruik-is-altijd-beter");
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

  const conceptMastery: Record<string, string> = Object.fromEntries(
    evidence.map((item) => [item.objectiveId, item.passed ? "demonstrated" : "uncertain"]),
  );
  if (misconceptions.includes("sa.mc.koppeling-is-alleen-techniek")) conceptMastery["sa.m07.afhankelijkheid"] = "misconception";
  if (misconceptions.includes("sa.mc.hergebruik-is-altijd-beter")) conceptMastery["sa.m07.wendbaarheid"] = "misconception";

  return { route, reasonCode, sequence: [...solutionArchitectureModule7.routes[route]], evidence, misconceptions, conceptMastery };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export function observeModule7Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m7-belofte-practice-v1" || interventionId === "m7-techniek-repair-v1") {
    const semantics = /beteken|gegeven|inhoud|formaat|contract/.test(answer);
    const ownership = /eigenaar|verantwoord|partij|organisatie|beheer/.test(answer);
    const failure = /fout|uitval|bevestig|retry|herstel|verloren|dubbel/.test(answer);
    const change = /wijzig|versie|compatib|afspraak/.test(answer);
    const indicators = [semantics ? "semantics" : "", ownership ? "ownership" : "", failure ? "failure_handling" : "", change ? "change_contract" : ""].filter(Boolean);
    if (indicators.length >= 2) return { level: "strong", canProceed: true, feedback: "Je behandelt de koppeling als een gedeelde afspraak en niet alleen als transport.", followUp: null, indicators };
    if (indicators.length === 1) return { level: "partial", canProceed: false, feedback: "Je noemt één relevante afspraak. Maak ook duidelijk wie verantwoordelijk is of wat er bij wijziging/uitval gebeurt.", followUp: "Welke afspraak voorkomt dat één partij de integratie eenzijdig breekt?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Je antwoord blijft vooral technisch. Benoem minstens één afspraak over betekenis, verantwoordelijkheid, wijziging of foutafhandeling.", followUp: "Wat moeten beide organisaties gezamenlijk blijven garanderen?", indicators };
  }

  if (interventionId === "m7-koppelvorm-practice-v1") {
    const event = /gebeurten|event|bericht/.test(answer);
    const trace = /logging|log|herleid|bevestig|ack|correlat/.test(answer);
    const failure = /dubbel|verloren|retry|uitval|fout|idempot/.test(answer);
    const indicators = [event ? "event_choice" : "", trace ? "traceability" : "", failure ? "failure_scenario" : ""].filter(Boolean);
    if (event && trace && failure) return { level: "strong", canProceed: true, feedback: "Je koppelt de gekozen vorm aan herleidbaarheid én expliciete foutafhandeling.", followUp: null, indicators };
    if (event && (trace || failure)) return { level: "partial", canProceed: false, feedback: "De koppelvorm past. Werk nog uit hoe je een mislukte of dubbele levering detecteert en afhandelt.", followUp: "Hoe weet je of één uitslag precies één keer bruikbaar is verwerkt?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Kies niet alleen op techniekvoorkeur. Verbind frequentie en herleidbaarheid aan een concrete uitwisselingsvorm en een faalscenario.", followUp: "Wie bepaalt het moment van uitwisseling, en hoe bewijs je wat er is gebeurd?", indicators };
  }

  if (interventionId === "m7-landschap-practice-v1" || interventionId === "m7-hergebruik-repair-v1") {
    const consumers = /afnemer|consumer|systeem|partij|gebruiker/.test(answer);
    const contract = /belofte|contract|beteken|veld|interface|afspraak/.test(answer);
    const change = /wijzig|impact|breek|compatib|versie|wendbaar/.test(answer);
    const indicators = [consumers ? "consumers" : "", contract ? "contract" : "", change ? "change_impact" : ""].filter(Boolean);
    if (consumers && contract && change) return { level: "strong", canProceed: true, feedback: "Je beoordeelt hergebruik op bestaande afnemers, contractbetekenis en toekomstige wijzigingsruimte.", followUp: null, indicators };
    if ((consumers && contract) || (contract && change)) return { level: "partial", canProceed: false, feedback: "Je ziet een deel van de landschapsimpact. Maak ook expliciet wie door de gewijzigde belofte geraakt wordt of welke wijzigingsruimte verdwijnt.", followUp: "Welke partij kan straks niet meer zelfstandig veranderen?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Hergebruik is pas verantwoord als de bestaande belofte past bij de nieuwe behoefte en bestaande afnemers niet onbedoeld geraakt worden.", followUp: "Wie gebruikt de koppeling nu al en welke verwachting hebben zij ervan?", indicators };
  }

  return null;
}

export const module7AnswerKey: Readonly<Record<string, number>> = {
  "m7-assess-01": 1,
  "m7-assess-02": 1,
  "m7-assess-03": 1,
  "m7-assess-04": 1,
  "m7-assess-05": 1,
  "m7-assess-06": 1,
};

export const module7RemediationByQuestion: Readonly<Record<string, string[]>> = {
  "m7-assess-01": ["m7-koppelvormen-standard-v1"],
  "m7-assess-02": ["m7-belofte-standard-v1", "m7-techniek-repair-v1"],
  "m7-assess-03": ["m7-failure-standard-v1", "m7-koppelvorm-practice-v1"],
  "m7-assess-04": ["m7-failure-standard-v1", "m7-wendbaarheid-standard-v1"],
  "m7-assess-05": ["m7-wendbaarheid-standard-v1", "m7-landschap-practice-v1"],
  "m7-assess-06": ["m7-hergebruik-repair-v1", "m7-landschap-practice-v1"],
};
