import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule9 } from "./solution-architecture-module-9";
import {
  diagnoseModule9,
  module9AnswerKey,
  module9AssessmentVersion,
  module9ClassifierVersion,
  module9OrchestratorVersion,
  module9RemediationByQuestion,
  observeModule9Reasoning,
} from "./solution-architecture-module-9-server";

export const solutionArchitectureModule9Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule9,
  classifierVersion: module9ClassifierVersion,
  assessmentVersion: module9AssessmentVersion,
  orchestratorVersion: module9OrchestratorVersion,
  diagnose: diagnoseModule9,
  observe: observeModule9Reasoning,
  answerKey: module9AnswerKey,
  remediationByQuestion: module9RemediationByQuestion,
  logPrefix: "adaptive_module9",
};
