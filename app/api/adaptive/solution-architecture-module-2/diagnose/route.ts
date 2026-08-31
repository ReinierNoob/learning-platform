import { createAdaptiveDiagnoseHandler } from "../../../../../lib/adaptive-module-route-factory";
import { solutionArchitectureModule2Runtime } from "../../../../../lib/solution-architecture-module-2-runtime";

export const POST = createAdaptiveDiagnoseHandler(solutionArchitectureModule2Runtime);
