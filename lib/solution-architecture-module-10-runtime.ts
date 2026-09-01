import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule10 } from "./solution-architecture-module-10";
import {
  diagnoseModule10,
  module10AnswerKey,
  module10AssessmentVersion,
  module10ClassifierVersion,
  module10OrchestratorVersion,
  module10RemediationByQuestion,
  observeModule10Reasoning,
} from "./solution-architecture-module-10-server";

export const solutionArchitectureModule10Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule10,
  classifierVersion: module10ClassifierVersion,
  assessmentVersion: module10AssessmentVersion,
  orchestratorVersion: module10OrchestratorVersion,
  diagnose: diagnoseModule10,
  observe: observeModule10Reasoning,
  answerKey: module10AnswerKey,
  remediationByQuestion: module10RemediationByQuestion,
  logPrefix: "adaptive_module10",
};
