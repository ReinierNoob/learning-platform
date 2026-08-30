import { NextResponse } from "next/server";
import {
  adaptiveAccessStatus,
  adaptiveModule6ClassifierVersion,
  adaptiveModule6CourseSlug,
  adaptiveModule6OrchestratorVersion,
  adaptiveModule6SourceModuleId,
  adaptiveSchemaVersion,
  isAdaptivePersistenceEnabled,
} from "../../../../../lib/adaptive-pilot-runtime";
import {
  AdaptiveAccessError,
  getAdaptiveStateForLearner,
  persistAdaptiveTransitionForLearner,
  requireAdaptiveLearningContext,
} from "../../../../../lib/adaptive-service";
import { routeSequences, type RouteId } from "../../../../../lib/solution-architecture-module-6";

function isRouteId(value: unknown): value is RouteId {
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
    const context = await requireAdaptiveLearningContext(adaptiveModule6CourseSlug, adaptiveModule6SourceModuleId);
    const state = await getAdaptiveStateForLearner(context);
    const persisted = await persistAdaptiveTransitionForLearner(context, {
      profile: {
        schemaVersion: adaptiveSchemaVersion,
        classifierVersion: state.profile?.classifier_version ?? adaptiveModule6ClassifierVersion,
        conceptMastery: state.profile?.concept_mastery ?? {},
        misconceptionSignals: state.profile?.misconception_signals ?? {},
        routeState: {
          ...(state.profile?.route_state ?? {}),
          module: adaptiveModule6SourceModuleId,
          route: body.route,
          reasonCode: "LEARNER_OVERRIDE",
          phase: "learner_override",
        },
        preferences: state.profile?.preferences ?? {},
      },
      evidence: [{
        moduleId: context.module.id,
        objectiveId: "sa.m06.route-keuze",
        evidenceType: "learner_override",
        sourceRef: `module6-route-${body.route}`,
        result: { route: body.route },
        evidenceStrength: 1,
        classifierVersion: adaptiveModule6ClassifierVersion,
      }],
      decision: {
        moduleId: context.module.id,
        objectiveId: null,
        action: "learner_override",
        routeId: body.route,
        selectedContentIds: routeSequences[body.route],
        reasonCode: "LEARNER_OVERRIDE",
        rationale: `Learner explicitly selected route ${body.route}`,
        orchestratorVersion: adaptiveModule6OrchestratorVersion,
        learnerOverride: true,
      },
    });

    return NextResponse.json({
      persistence: "supabase-preview",
      route: body.route,
      transitionIds: {
        profileId: persisted.profile_id,
        evidenceIds: persisted.evidence_ids,
        decisionId: persisted.decision_id,
      },
    });
  } catch (error) {
    if (error instanceof AdaptiveAccessError) {
      return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
    }
    console.error("adaptive_override_persistence_failed", error);
    return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
  }
}
