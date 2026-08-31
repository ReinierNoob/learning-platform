import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule8 } from "./solution-architecture-module-8";
import {
  diagnoseModule8,
  module8AnswerKey,
  module8AssessmentVersion,
  module8ClassifierVersion,
  module8OrchestratorVersion,
  module8RemediationByQuestion,
  observeModule8Reasoning,
} from "./solution-architecture-module-8-server";

export const solutionArchitectureModule8Runtime: AdaptiveServerModuleContract = {
  definition: solutionArchitectureModule8,
  classifierVersion: module8ClassifierVersion,
  assessmentVersion: module8AssessmentVersion,
  orchestratorVersion: module8OrchestratorVersion,
  diagnose: diagnoseModule8,
  observe: observeModule8Reasoning,
  answerKey: module8AnswerKey,
  remediationByQuestion: module8RemediationByQuestion,
  logPrefix: "adaptive_module8",
};
