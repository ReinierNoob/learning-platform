import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveSolutionArchitectureCourseSlug, adaptiveModule4SourceModuleId, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, getAdaptiveStateForLearner, requireAdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { solutionArchitectureModule4 } from "../../../../../lib/solution-architecture-module-4";
import type { AdaptiveRouteId } from "../../../../../lib/adaptive-module-definition";

function isRoute(value: unknown): value is AdaptiveRouteId { return value === "A" || value === "B" || value === "C"; }

export async function GET() {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  if (!isAdaptivePersistenceEnabled()) return NextResponse.json({ enabled: false, state: null });
  try {
    const context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule4SourceModuleId);
    const state = await getAdaptiveStateForLearner(context);
    if (!state.profile) return NextResponse.json({ enabled: true, state: null });
    const routeState = state.profile.route_state ?? {};
    const latestDecision = state.recent_decisions[0] ?? {};
    const candidate = routeState.route ?? latestDecision.route_id;
    const route = isRoute(candidate) ? candidate : null;
    const reasonCode = typeof routeState.reasonCode === "string" ? routeState.reasonCode : typeof latestDecision.reason_code === "string" ? latestDecision.reason_code : "PERSISTED_STATE";
    return NextResponse.json({
      enabled: true,
      state: route ? {
        route,
        reasonCode,
        sequence: [...solutionArchitectureModule4.routes[route]],
        evidence: state.recent_evidence.filter((item) => item.evidence_type === "diagnostic").slice(0, 4).map((item) => ({
          id: typeof item.source_ref === "string" ? item.source_ref : "persisted-evidence",
          objectiveId: typeof item.objective_id === "string" ? item.objective_id : "unknown",
          passed: Boolean((item.result as { passed?: unknown } | undefined)?.passed),
        })),
        misconceptions: Object.entries(state.profile.misconception_signals ?? {}).filter(([, active]) => active === true).map(([id]) => id),
        profile: { conceptMastery: state.profile.concept_mastery ?? {}, persistence: "supabase-preview" },
      } : null,
    });
  } catch (error) {
    if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
    console.error("adaptive_module4_state_restore_failed", error);
    return NextResponse.json({ error: "adaptive_state_restore_failed" }, { status: 500 });
  }
}
