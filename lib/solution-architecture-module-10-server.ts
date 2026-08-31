import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule10 } from "./solution-architecture-module-10";

export const module10ClassifierVersion = "module10-classifier-v1";
export const module10AssessmentVersion = "module10-assessment-v1";
export const module10OrchestratorVersion = "adaptive-orchestrator-v2.21";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

export function diagnoseModule10(answers: Record<string, string>) {
  const d1 = normalize(answers["m10-diag-01"]);
  const d2 = normalize(answers["m10-diag-02"]);
  const d3 = normalize(answers["m10-diag-03"]);
  const d4 = normalize(answers["m10-diag-04"]);

  const evidence = [
    {
      id: "ev-m10-diag-01",
      objectiveId: "sa.m10.scope-aannames",
      passed: d1 === "de ontvangen opdracht toetsen op scope, aannames en werkbaarheid",
    },
    {
      id: "ev-m10-diag-02",
      objectiveId: "sa.m10.kwaliteit-conflict",
      passed: d2 === "welke kwaliteitsbelangen botsen en welke eisen daaruit volgen",
    },
    {
      id: "ev-m10-diag-03",
      objectiveId: "sa.m10.alternatieven-tradeoff",
      passed: d3 === "omdat het portaal afhankelijk wordt van de interne structuur van dat systeem",
    },
    {
      id: "ev-m10-diag-04",
      objectiveId: "sa.m10.migratierisico",
      passed: d4 === "dat criteria en herstelpad vooraf zijn bepaald zodat gecontroleerd kan worden teruggevallen",
    },
  ];

  const misconceptions: string[] = [];
  if (d3 === "omdat rechtstreeks hergebruik per definitie de beste keuze is") {
    misconceptions.push("sa.mc.hergebruik-is-altijd-beter");
  }
  if (d4 === "dat het team verwacht dat de migratie mislukt") {
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
    "sa.m10.scope-aannames": evidence[0].passed ? "demonstrated" : "uncertain",
    "sa.m10.kwaliteit-conflict": evidence[1].passed ? "demonstrated" : "uncertain",
    "sa.m10.modelkeuze": evidence[2].passed ? "demonstrated" : "uncertain",
    "sa.m10.alternatieven-tradeoff": evidence[2].passed ? "demonstrated" : "uncertain",
    "sa.m10.principes-review": evidence[2].passed ? "demonstrated" : "uncertain",
    "sa.m10.migratierisico": evidence[3].passed ? "demonstrated" : "uncertain",
  };
  if (misconceptions.includes("sa.mc.hergebruik-is-altijd-beter")) {
    conceptMastery["sa.m10.alternatieven-tradeoff"] = "misconception";
  }
  if (misconceptions.includes("sa.mc.rollback-is-falen")) {
    conceptMastery["sa.m10.migratierisico"] = "misconception";
  }

  return {
    route,
    reasonCode,
    sequence: [...solutionArchitectureModule10.routes[route]],
    evidence,
    misconceptions,
    conceptMastery,
  };
}

// Module 10 is an integrated final case. The tutor may provide process guidance
// and references back to previous modules, but no content-level hints during the case.
export function observeModule10Reasoning() {
  return null;
}

export const module10AnswerKey: Readonly<Record<string, number>> = {
  "m10-assess-01": 1,
  "m10-assess-02": 0,
  "m10-assess-03": 1,
  "m10-assess-04": 1,
  "m10-assess-05": 1,
  "m10-assess-06": 2,
  "m10-assess-07": 1,
  "m10-assess-08": 1,
  "m10-assess-09": 1,
  "m10-assess-10": 1,
  "m10-assess-11": 1,
  "m10-assess-12": 1,
  "m10-assess-13": 1,
};

export const module10RemediationByQuestion: Readonly<Record<string, string[]>> = {
  "m10-assess-01": ["m10-ref-m2-v1"],
  "m10-assess-02": ["m10-ref-m2-v1"],
  "m10-assess-03": ["m10-ref-m34-v1"],
  "m10-assess-04": ["m10-ref-m34-v1"],
  "m10-assess-05": ["m10-ref-m34-v1"],
  "m10-assess-06": ["m10-ref-m5-v1"],
  "m10-assess-07": ["m10-ref-m67-v1"],
  "m10-assess-08": ["m10-ref-m67-v1"],
  "m10-assess-09": ["m10-ref-m67-v1"],
  "m10-assess-10": ["m10-ref-m8-v1"],
  "m10-assess-11": ["m10-ref-m8-v1"],
  "m10-assess-12": ["m10-ref-m9-v1"],
  "m10-assess-13": ["m10-ref-m9-v1"],
};
