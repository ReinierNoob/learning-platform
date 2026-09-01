import { createAdaptiveDiagnoseHandler } from "../../../../../lib/adaptive-module-route-factory";
import { preserveModule5DiagnosisResponse, withAdaptiveJsonResponseAdapter } from "../../../../../lib/adaptive-response-compat";
import { solutionArchitectureModule5Runtime } from "../../../../../lib/solution-architecture-module-5-factory-runtime";

export const POST = withAdaptiveJsonResponseAdapter(
  createAdaptiveDiagnoseHandler(solutionArchitectureModule5Runtime),
  preserveModule5DiagnosisResponse,
);
