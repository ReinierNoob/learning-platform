import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule7 } from "./solution-architecture-module-7";
import {
  diagnoseModule7,
  module7AnswerKey,
  module7AssessmentVersion,
  module7ClassifierVersion,
  module7OrchestratorVersion,
  module7RemediationByQuestion,
  observeModule7Reasoning,
} from "./solution-architecture-module-7-server";

export const solutionArchitectureModule7Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule7,
  classifierVersion: module7ClassifierVersion,
  assessmentVersion: module7AssessmentVersion,
  orchestratorVersion: module7OrchestratorVersion,
  diagnose: diagnoseModule7,
  observe: observeModule7Reasoning,
  answerKey: module7AnswerKey,
  remediationByQuestion: module7RemediationByQuestion,
  logPrefix: "adaptive_module7",
};
