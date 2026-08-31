import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule2 } from "./solution-architecture-module-2";
import {
  diagnoseModule2,
  module2AnswerKey,
  module2AssessmentVersion,
  module2ClassifierVersion,
  module2OrchestratorVersion,
  module2RemediationByQuestion,
  observeModule2Reasoning,
} from "./solution-architecture-module-2-server";

export const solutionArchitectureModule2Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule2,
  classifierVersion: module2ClassifierVersion,
  assessmentVersion: module2AssessmentVersion,
  orchestratorVersion: module2OrchestratorVersion,
  diagnose: diagnoseModule2,
  observe: observeModule2Reasoning,
  answerKey: module2AnswerKey,
  remediationByQuestion: module2RemediationByQuestion,
  logPrefix: "adaptive_module2",
};
