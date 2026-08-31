import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveSchemaVersion, adaptiveSolutionArchitectureCourseSlug, adaptiveModule2SourceModuleId, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, getAdaptiveStateForLearner, persistAdaptiveTransitionForLearner, requireAdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { solutionArchitectureModule2 } from "../../../../../lib/solution-architecture-module-2";
import { module2ClassifierVersion, module2OrchestratorVersion, observeModule2Reasoning } from "../../../../../lib/solution-architecture-module-2-server";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await request.json().catch(() => null) as { interventionId?: string; answer?: string } | null;
  const interventionId = typeof body?.interventionId === "string" ? body.interventionId : "";
  const intervention = solutionArchitectureModule2.interventions[interventionId];
  if (!intervention?.prompt) return NextResponse.json({ error: "observation_not_supported" }, { status: 400 });
  const observation = observeModule2Reasoning(interventionId, body?.answer);
  if (!observation) return NextResponse.json({ error: "answer_required" }, { status: 400 });

  let persistence = "preview-session-only";
  let transitionIds: unknown = null;
  if (isAdaptivePersistenceEnabled()) {
    try {
      const context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule2SourceModuleId);
      const state = await getAdaptiveStateForLearner(context);
      const action = observation.level === "strong" ? "challenge" : observation.level === "partial" ? "deeper_explanation" : "extra_practice";
      const reasonCode = observation.level === "strong" ? "TUTOR_OBSERVATION_STRONG" : observation.level === "partial" ? "TUTOR_OBSERVATION_PARTIAL" : "TUTOR_OBSERVATION_NEEDS_WORK";
      const persisted = await persistAdaptiveTransitionForLearner(context, {
        profile: {
          schemaVersion: adaptiveSchemaVersion,
          classifierVersion: module2ClassifierVersion,
          conceptMastery: state.profile?.concept_mastery ?? {},
          misconceptionSignals: state.profile?.misconception_signals ?? {},
          routeState: { ...(state.profile?.route_state ?? {}), module: adaptiveModule2SourceModuleId, phase: "tutor_observation", interventionId, observationLevel: observation.level },
          preferences: state.profile?.preferences ?? {},
        },
        evidence: [{ moduleId: context.module.id, objectiveId: intervention.objectiveId, evidenceType: "tutor_observation", sourceRef: interventionId, result: { level: observation.level, canProceed: observation.canProceed, indicators: observation.indicators }, evidenceStrength: observation.level === "strong" ? 0.72 : observation.level === "partial" ? 0.5 : 0.35, classifierVersion: module2ClassifierVersion }],
        decision: { moduleId: context.module.id, objectiveId: intervention.objectiveId, action, routeId: null, selectedContentIds: [interventionId], reasonCode, rationale: `Deterministic Module 2 tutor observation for ${interventionId}`, orchestratorVersion: module2OrchestratorVersion, learnerOverride: false },
      });
      persistence = "supabase-preview";
      transitionIds = { profileId: persisted.profile_id, evidenceIds: persisted.evidence_ids, decisionId: persisted.decision_id };
    } catch (error) {
      if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
      console.error("adaptive_module2_observation_failed", error);
      return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ...observation, objectiveId: intervention.objectiveId, persistence, transitionIds });
}
