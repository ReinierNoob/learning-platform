import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveModule5SourceModuleId, adaptiveSchemaVersion, adaptiveSolutionArchitectureCourseSlug, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, getAdaptiveStateForLearner, persistAdaptiveTransitionForLearner, requireAdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { solutionArchitectureModule5 } from "../../../../../lib/solution-architecture-module-5";
import { module5ClassifierVersion, module5OrchestratorVersion } from "../../../../../lib/solution-architecture-module-5-runtime";
import type { AdaptiveRouteId } from "../../../../../lib/adaptive-module-definition";

function isRouteId(value: unknown): value is AdaptiveRouteId {
  return value === "A" || value === "B" || value === "C";
}

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await request.json().catch(() => null) as { route?: unknown } | null;
  if (!isRouteId(body?.route)) return NextResponse.json({ error: "invalid_route" }, { status: 400 });

  if (!isAdaptivePersistenceEnabled()) {
    return NextResponse.json({ persistence: "preview-session-only", route: body.route });
  }

  try {
    const context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule5SourceModuleId);
    const state = await getAdaptiveStateForLearner(context);
    const persisted = await persistAdaptiveTransitionForLearner(context, {
      profile: {
        schemaVersion: adaptiveSchemaVersion,
        classifierVersion: state.profile?.classifier_version ?? module5ClassifierVersion,
        conceptMastery: state.profile?.concept_mastery ?? {},
        misconceptionSignals: state.profile?.misconception_signals ?? {},
        routeState: { ...(state.profile?.route_state ?? {}), module: adaptiveModule5SourceModuleId, route: body.route, reasonCode: "LEARNER_OVERRIDE", phase: "learner_override" },
        preferences: state.profile?.preferences ?? {},
      },
      evidence: [{
        moduleId: context.module.id,
        objectiveId: "sa.m05.route-keuze",
        evidenceType: "learner_override",
        sourceRef: `module5-route-${body.route}`,
        result: { route: body.route },
        evidenceStrength: 1,
        classifierVersion: module5ClassifierVersion,
      }],
      decision: {
        moduleId: context.module.id,
        objectiveId: null,
        action: "learner_override",
        routeId: body.route,
        selectedContentIds: [...solutionArchitectureModule5.routes[body.route]],
        reasonCode: "LEARNER_OVERRIDE",
        rationale: `Learner explicitly selected Module 5 route ${body.route}`,
        orchestratorVersion: module5OrchestratorVersion,
        learnerOverride: true,
      },
    });
    return NextResponse.json({ persistence: "supabase-preview", route: body.route, transitionIds: { profileId: persisted.profile_id, evidenceIds: persisted.evidence_ids, decisionId: persisted.decision_id } });
  } catch (error) {
    if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
    console.error("adaptive_module5_override_persistence_failed", error);
    return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
  }
}
