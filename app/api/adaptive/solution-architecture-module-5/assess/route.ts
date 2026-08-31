import { createAdaptiveAssessHandler } from "../../../../../lib/adaptive-module-route-factory";
import { solutionArchitectureModule5Runtime } from "../../../../../lib/solution-architecture-module-5-factory-runtime";

export const POST = createAdaptiveAssessHandler(solutionArchitectureModule5Runtime);
