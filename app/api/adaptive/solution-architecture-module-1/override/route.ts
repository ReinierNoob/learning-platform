import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveSchemaVersion, adaptiveSolutionArchitectureCourseSlug, adaptiveModule1SourceModuleId, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, getAdaptiveStateForLearner, persistAdaptiveTransitionForLearner, requireAdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { solutionArchitectureModule1 } from "../../../../../lib/solution-architecture-module-1";
import { module1ClassifierVersion, module1OrchestratorVersion } from "../../../../../lib/solution-architecture-module-1-server";
import type { AdaptiveRouteId } from "../../../../../lib/adaptive-module-definition";

function isRoute(value: unknown): value is AdaptiveRouteId { return value === "A" || value === "B" || value === "C"; }

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await request.json().catch(() => null) as { route?: unknown } | null;
  if (!isRoute(body?.route)) return NextResponse.json({ error: "invalid_route" }, { status: 400 });
  if (!isAdaptivePersistenceEnabled()) return NextResponse.json({ persistence: "preview-session-only", route: body.route });
  try {
    const context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule1SourceModuleId);
    const state = await getAdaptiveStateForLearner(context);
    const persisted = await persistAdaptiveTransitionForLearner(context, {
      profile: {
        schemaVersion: adaptiveSchemaVersion,
        classifierVersion: state.profile?.classifier_version ?? module1ClassifierVersion,
        conceptMastery: state.profile?.concept_mastery ?? {},
        misconceptionSignals: state.profile?.misconception_signals ?? {},
        routeState: { ...(state.profile?.route_state ?? {}), module: adaptiveModule1SourceModuleId, route: body.route, reasonCode: "LEARNER_OVERRIDE", phase: "learner_override" },
        preferences: state.profile?.preferences ?? {},
      },
      evidence: [{
        moduleId: context.module.id,
        objectiveId: "sa.m01.route-keuze",
        evidenceType: "learner_override",
        sourceRef: `module1-route-${body.route}`,
        result: { route: body.route },
        evidenceStrength: 1,
        classifierVersion: module1ClassifierVersion,
      }],
      decision: {
        moduleId: context.module.id,
        objectiveId: null,
        action: "learner_override",
        routeId: body.route,
        selectedContentIds: [...solutionArchitectureModule1.routes[body.route]],
        reasonCode: "LEARNER_OVERRIDE",
        rationale: `Learner explicitly selected Module 1 route ${body.route}`,
        orchestratorVersion: module1OrchestratorVersion,
        learnerOverride: true,
      },
    });
    return NextResponse.json({ persistence: "supabase-preview", route: body.route, transitionIds: { profileId: persisted.profile_id, evidenceIds: persisted.evidence_ids, decisionId: persisted.decision_id } });
  } catch (error) {
    if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
    console.error("adaptive_module1_override_failed", error);
    return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
  }
}
