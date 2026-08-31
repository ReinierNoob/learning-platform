import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule1 } from "./solution-architecture-module-1";
import {
  diagnoseModule1,
  module1AnswerKey,
  module1AssessmentVersion,
  module1ClassifierVersion,
  module1OrchestratorVersion,
  module1RemediationByQuestion,
  observeModule1Reasoning,
} from "./solution-architecture-module-1-server";

export const solutionArchitectureModule1Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule1,
  classifierVersion: module1ClassifierVersion,
  assessmentVersion: module1AssessmentVersion,
  orchestratorVersion: module1OrchestratorVersion,
  diagnose: diagnoseModule1,
  observe: observeModule1Reasoning,
  answerKey: module1AnswerKey,
  remediationByQuestion: module1RemediationByQuestion,
  logPrefix: "adaptive_module1",
};
