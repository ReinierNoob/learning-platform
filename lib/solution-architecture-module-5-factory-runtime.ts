import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule5 } from "./solution-architecture-module-5";
import {
  diagnoseModule5Answers,
  module5AnswerKey,
  module5AssessmentVersion,
  module5ClassifierVersion,
  module5OrchestratorVersion,
  observeModule5Reasoning,
} from "./solution-architecture-module-5-runtime";

const module5RemediationByQuestion: Readonly<Record<string, string[]>> = {
  "m5-assess-01": ["m5-c4-standard-v1"],
  "m5-assess-02": ["m5-more-detail-repair-v1"],
  "m5-assess-03": ["m5-archimate4-standard-v1", "m5-view-viewpoint-check-v1"],
  "m5-assess-04": ["m5-diagramkwaliteit-standard-v1", "m5-notation-repair-v1"],
  "m5-assess-05": ["m5-modelmix-standard-v1"],
};

export const solutionArchitectureModule5Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule5,
  classifierVersion: module5ClassifierVersion,
  assessmentVersion: module5AssessmentVersion,
  orchestratorVersion: module5OrchestratorVersion,
  diagnose: (answers) => {
    const diagnosis = diagnoseModule5Answers(answers);
    return {
      route: diagnosis.route,
      reasonCode: diagnosis.reasonCode,
      sequence: diagnosis.sequence,
      evidence: diagnosis.evidence,
      misconceptions: diagnosis.misconceptions,
      conceptMastery: diagnosis.mastery,
    };
  },
  observe: observeModule5Reasoning,
  answerKey: module5AnswerKey,
  remediationByQuestion: module5RemediationByQuestion,
  logPrefix: "adaptive_module5",
};
