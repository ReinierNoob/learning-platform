import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveSolutionArchitectureCourseSlug, adaptiveModule1SourceModuleId, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, requireAdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { buildAdaptiveModuleRestoreState } from "../../../../../lib/adaptive-state-restore";
import { solutionArchitectureModule1 } from "../../../../../lib/solution-architecture-module-1";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  if (!isAdaptivePersistenceEnabled()) return NextResponse.json({ enabled: false, state: null });

  try {
    const context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule1SourceModuleId);
    const state = await buildAdaptiveModuleRestoreState(context, solutionArchitectureModule1);
    return NextResponse.json({ enabled: true, state });
  } catch (error) {
    if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
    console.error("adaptive_module1_state_restore_failed", error);
    return NextResponse.json({ error: "adaptive_state_restore_failed" }, { status: 500 });
  }
}
