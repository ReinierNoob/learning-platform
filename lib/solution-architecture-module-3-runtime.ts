import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule3 } from "./solution-architecture-module-3";
import {
  diagnoseModule3,
  module3AnswerKey,
  module3AssessmentVersion,
  module3ClassifierVersion,
  module3OrchestratorVersion,
  module3RemediationByQuestion,
  observeModule3Reasoning,
} from "./solution-architecture-module-3-server";

export const solutionArchitectureModule3Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule3,
  classifierVersion: module3ClassifierVersion,
  assessmentVersion: module3AssessmentVersion,
  orchestratorVersion: module3OrchestratorVersion,
  diagnose: diagnoseModule3,
  observe: observeModule3Reasoning,
  answerKey: module3AnswerKey,
  remediationByQuestion: module3RemediationByQuestion,
  logPrefix: "adaptive_module3",
};
