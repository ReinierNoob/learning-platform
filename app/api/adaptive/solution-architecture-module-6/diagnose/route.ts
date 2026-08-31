import { createAdaptiveDiagnoseHandler } from "../../../../../lib/adaptive-module-route-factory";
import { preserveModule6DiagnosisResponse, withAdaptiveJsonResponseAdapter } from "../../../../../lib/adaptive-response-compat";
import { solutionArchitectureModule6Runtime } from "../../../../../lib/solution-architecture-module-6-runtime";

export const POST = withAdaptiveJsonResponseAdapter(
  createAdaptiveDiagnoseHandler(solutionArchitectureModule6Runtime),
  preserveModule6DiagnosisResponse,
);
