import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule4 } from "./solution-architecture-module-4";
import {
  diagnoseModule4,
  module4AnswerKey,
  module4AssessmentVersion,
  module4ClassifierVersion,
  module4OrchestratorVersion,
  module4RemediationByQuestion,
  observeModule4Reasoning,
} from "./solution-architecture-module-4-server";

export const solutionArchitectureModule4Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule4,
  classifierVersion: module4ClassifierVersion,
  assessmentVersion: module4AssessmentVersion,
  orchestratorVersion: module4OrchestratorVersion,
  diagnose: diagnoseModule4,
  observe: observeModule4Reasoning,
  answerKey: module4AnswerKey,
  remediationByQuestion: module4RemediationByQuestion,
  logPrefix: "adaptive_module4",
};
