import "server-only";

import { solutionArchitectureModule5 } from "./solution-architecture-module-5";
import type { AdaptiveRouteId } from "./adaptive-module-definition";

export const module5ClassifierVersion = "module5-classifier-v1";
export const module5AssessmentVersion = "module5-assessment-v1";
export const module5OrchestratorVersion = "adaptive-orchestrator-v2.14";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

function isUnknown(value: string) {
  return /ik weet dit nog niet|weet ik niet|geen idee/.test(value);
}

export function diagnoseModule5Answers(answers: Record<string, string>) {
  const d1 = normalize(answers["m5-diag-01"]);
  const d2 = normalize(answers["m5-diag-02"]);
  const d3 = normalize(answers["m5-diag-03"]);
  const d4 = normalize(answers["m5-diag-04"]);

  const evidence = [
    { id: "ev-m5-diag-01", objectiveId: "sa.m05.c4-niveaus", passed: d1 === "system context" },
    { id: "ev-m5-diag-02", objectiveId: "sa.m05.modelkeuze", passed: d2 === "systeem/containerinteracties" },
    { id: "ev-m5-diag-03", objectiveId: "sa.m05.archimate4-viewpoint", passed: d3 === "een stakeholdergerichte view maken vanuit een passend viewpoint" },
    {
      id: "ev-m5-diag-04",
      objectiveId: "sa.m05.diagramkwaliteit",
      passed: !isUnknown(d4)
        && /(niet|onvoldoende|onduidelijk|onbruikbaar)/.test(d4)
        && /(label|beteken|vraag|doel|publiek|stakeholder|relatie)/.test(d4),
    },
  ];

  const misconceptions: string[] = [];
  if (!isUnknown(d1) && (d1 === "component" || d1 === "code")) misconceptions.push("sa.mc.meer-detail-is-beter");
  if (d3 === "het hele model tonen") misconceptions.push("sa.mc.een-diagram-voor-iedereen");
  if (d3 === "archimate vermijden en uitsluitend c4 gebruiken") misconceptions.push("sa.mc.c4-en-archimate-zijn-concurrenten");
  if (!isUnknown(d4) && /(wel|goed|bruikbaar|prima)/.test(d4) && /(notatie|correct)/.test(d4) && !/(niet|maar|ondanks)/.test(d4)) misconceptions.push("sa.mc.notatie-is-doel");

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

  const mastery: Record<string, string> = Object.fromEntries(
    evidence.map((item) => [item.objectiveId, item.passed ? "demonstrated" : "uncertain"]),
  );
  mastery["sa.m05.publiek-detailniveau"] = evidence[0].passed ? "demonstrated" : "uncertain";
  if (misconceptions.includes("sa.mc.meer-detail-is-beter") || misconceptions.includes("sa.mc.een-diagram-voor-iedereen")) mastery["sa.m05.publiek-detailniveau"] = "misconception";
  if (misconceptions.includes("sa.mc.notatie-is-doel")) mastery["sa.m05.diagramkwaliteit"] = "misconception";
  if (misconceptions.includes("sa.mc.c4-en-archimate-zijn-concurrenten")) mastery["sa.m05.modelkeuze"] = "misconception";

  return { evidence, misconceptions, route, reasonCode, mastery, sequence: [...solutionArchitectureModule5.routes[route]] };
}

export const module5AnswerKey: Record<string, number> = {
  "m5-assess-01": 0,
  "m5-assess-02": 1,
  "m5-assess-03": 1,
  "m5-assess-04": 2,
  "m5-assess-05": 1,
};

const remediationByQuestion: Record<string, string[]> = {
  "m5-assess-01": ["m5-c4-standard-v1"],
  "m5-assess-02": ["m5-more-detail-repair-v1"],
  "m5-assess-03": ["m5-archimate4-standard-v1", "m5-view-viewpoint-check-v1"],
  "m5-assess-04": ["m5-diagramkwaliteit-standard-v1", "m5-notation-repair-v1"],
  "m5-assess-05": ["m5-modelmix-standard-v1"],
};

export function assessModule5Answers(answers: Record<string, number>) {
  const results = solutionArchitectureModule5.assessment.map((question) => ({
    id: question.id,
    objectiveId: question.objectiveId,
    correct: answers[question.id] === module5AnswerKey[question.id],
  }));
  const correct = results.filter((item) => item.correct).length;
  const remediationSequence = Array.from(new Set(results.flatMap((item) => item.correct ? [] : remediationByQuestion[item.id] ?? [])));
  const passed = correct === results.length;
  const profileUpdate = Object.fromEntries(results.map((item) => [item.objectiveId, item.correct ? "demonstrated" : "needs_remediation"]));
  return { results, correct, total: results.length, passed, remediationSequence, profileUpdate };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export function observeModule5Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  const strong = (feedback: string, indicators: string[]): Observation => ({ level: "strong", canProceed: true, feedback, followUp: null, indicators });
  const partial = (feedback: string, followUp: string, indicators: string[]): Observation => ({ level: "partial", canProceed: false, feedback, followUp, indicators });
  const needsWork = (feedback: string, followUp: string): Observation => ({ level: "needs_work", canProceed: false, feedback, followUp, indicators: [] });

  if (interventionId === "m5-one-diagram-repair-v1") {
    const audience = /(stakeholder|publiek|doelgroep|wethouder|team)/.test(answer);
    const selection = /(relevant|select|weglat|detail|vraag|doel)/.test(answer);
    if (audience && selection) return strong("Je koppelt het beeld aan stakeholder én informatiebehoefte.", ["stakeholder", "selection"]);
    if (audience || selection) return partial("Je ziet een deel van het probleem, maar de relatie tussen publiek en selectie kan explicieter.", "Welke informatie verandert wanneer het publiek verandert?", [audience ? "stakeholder" : "selection"]);
    return needsWork("Eén diagram wordt niet automatisch bruikbaar door meer informatie toe te voegen.", "Voor wie maak je het beeld en welke vraag moet die persoon ermee beantwoorden?");
  }

  if (interventionId === "m5-more-detail-repair-v1") {
    const removesTech = /(api|component|code|protocol|database|technisch|detail)/.test(answer);
    const because = /(omdat|zodat|vraag|beslis|relevant|nodig)/.test(answer);
    if (removesTech && because) return strong("Je laat detail weg op basis van de beslisvraag, niet omdat techniek op zichzelf ongewenst is.", ["remove_detail", "purpose"]);
    if (removesTech) return partial("Je noemt passend detail om weg te laten.", "Waarom helpt het weglaten daarvan juist deze stakeholder?", ["remove_detail"]);
    return needsWork("Bedenk welk technisch detail de hoofdboodschap voor een wethouder zou vertroebelen.", "Noem één concreet detail dat je weglaat en leg uit waarom.");
  }

  if (interventionId === "m5-notation-repair-v1") {
    const purpose = /(vraag|doel|beslis|boodschap|beteken|publiek|stakeholder)/.test(answer);
    if (purpose) return strong("Juist: formele correctheid is onvoldoende zonder communicatief doel en betekenis.", ["purpose"]);
    return needsWork("Notatiecorrectheid zegt nog niet of het diagram iemand helpt.", "Welke vraag of beslissing moet het diagram ondersteunen?");
  }

  if (interventionId === "m5-view-viewpoint-check-v1") {
    const view = /(view).*(beeld|select|present|toon)|beeld.*(model|select)/.test(answer);
    const viewpoint = /(viewpoint).*(convent|regel|keuze|perspectief|opbouw)|perspectief.*(opbouw|select)/.test(answer);
    if (view && viewpoint) return strong("Je onderscheidt het getoonde architectuurbeeld van de conventies waarmee je dat beeld voor een doel samenstelt.", ["view", "viewpoint"]);
    if (view || viewpoint) return partial("Eén van beide begrippen is duidelijk.", "Beschrijf nu ook het andere begrip en de relatie ertussen.", [view ? "view" : "viewpoint"]);
    return needsWork("Een view en viewpoint zijn niet hetzelfde object.", "Wat ziet de stakeholder daadwerkelijk, en wat stuurt de manier waarop dat beeld wordt samengesteld?");
  }

  if (interventionId === "m5-transfer-v1") {
    const twoAudiences = /(wethouder)/.test(answer) && /(integratieteam|integratie team|team)/.test(answer);
    const purpose = /(doel|vraag|beslis)/.test(answer);
    const detail = /(context|container|component|landschap|detail)/.test(answer);
    const model = /(c4|archimate)/.test(answer);
    if (twoAudiences && purpose && detail && model) return strong("Je maakt twee verschillende communicatieontwerpen voor dezelfde onderliggende architectuur.", ["audiences", "purpose", "detail", "model"]);
    const indicators = [twoAudiences ? "audiences" : "", purpose ? "purpose" : "", detail ? "detail" : "", model ? "model" : ""].filter(Boolean);
    return partial("De richting klopt, maar niet alle gevraagde ontwerpkeuzes zijn expliciet.", "Noem voor beide publieken doel, detailniveau én modelkeuze.", indicators);
  }

  return needsWork("Deze oefening vraagt om een expliciete redenering die aan de architectuurvraag gekoppeld is.", "Welke stakeholdervraag probeer je met je keuze te beantwoorden?");
}
