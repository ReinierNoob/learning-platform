import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import {
  adaptiveModule6AssessmentVersion,
  adaptiveModule6ClassifierVersion,
  adaptiveModule6OrchestratorVersion,
} from "./adaptive-runtime";
import { observeModule6Reasoning } from "./module6-tutor-observation";
import { solutionArchitectureModule6 } from "./solution-architecture-module-6-definition";
import { module6AnswerKey, module6RemediationByQuestion } from "./solution-architecture-module-6-server";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

function includesAny(text: string, terms: RegExp[]) {
  return terms.some((term) => term.test(text));
}

function diagnoseModule6(answers: Record<string, string>) {
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
  const tradeoffMisconception = includesAny(q2, [
    /trade.?off is een fout/,
    /trade.?off betekent een fout/,
    /gewoon de beste kiezen/,
    /altijd de beste optie/,
  ]);
  const consequenceMisconception = includesAny(q3, [
    /dit is voldoende/,
    /dit is prima/,
    /alleen voordelen? (zijn|is) genoeg/,
    /nadelen? (hoeven|hoort|horen) niet/,
  ]);
  const timingMisconception = includesAny(q4, [/achteraf/, /erna/, /na de bouw/, /na implement/, /als .*klaar/])
    && !includesAny(q4, [/niet achteraf/, /niet erna/, /vooraf/, /voordat/, /voor de bouw/, /voor het bouwen/]);

  if (tradeoffMisconception) misconceptions.push("sa.mc.trade-off-is-fout");
  if (consequenceMisconception) misconceptions.push("sa.mc.consequenties-alleen-positief");
  if (timingMisconception) misconceptions.push("sa.mc.adr-achteraf");

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
  for (const misconception of misconceptions) {
    if (misconception === "sa.mc.trade-off-is-fout") conceptMastery["sa.m06.alternatieven-vergelijken"] = "misconception";
    if (misconception === "sa.mc.consequenties-alleen-positief") conceptMastery["sa.m06.adr-beoordelen"] = "misconception";
    if (misconception === "sa.mc.adr-achteraf") conceptMastery["sa.m06.waarom-alternatieven"] = "misconception";
  }

  return {
    route,
    reasonCode,
    sequence: [...solutionArchitectureModule6.routes[route]],
    evidence,
    misconceptions,
    conceptMastery,
  };
}

const remediationByQuestion: Readonly<Record<string, string[]>> = Object.fromEntries(
  Object.entries(module6RemediationByQuestion).map(([key, value]) => [key, [...value]]),
);

export const solutionArchitectureModule6Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule6,
  classifierVersion: adaptiveModule6ClassifierVersion,
  assessmentVersion: adaptiveModule6AssessmentVersion,
  orchestratorVersion: adaptiveModule6OrchestratorVersion,
  diagnose: diagnoseModule6,
  observe: observeModule6Reasoning,
  answerKey: module6AnswerKey,
  remediationByQuestion,
  logPrefix: "adaptive_module6",
};
