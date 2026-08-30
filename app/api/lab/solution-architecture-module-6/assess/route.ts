import { NextResponse } from "next/server";
import {
  adaptiveAccessStatus,
  adaptiveModule6AssessmentVersion,
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

const answerKey: Record<string, number> = {
  "m6-assess-01": 1,
  "m6-assess-02": 1,
  "m6-assess-03": 1,
};

const objectiveByQuestion: Record<string, string> = {
  "m6-assess-01": "sa.m06.alternatieven-vergelijken",
  "m6-assess-02": "sa.m06.adr-onderdelen",
  "m6-assess-03": "sa.m06.adr-beoordelen",
};

const remediationByQuestion: Record<string, string[]> = {
  "m6-assess-01": ["m6-trade-off-repair-v1", "m6-attributen-standard-v1"],
  "m6-assess-02": ["m6-adr-anatomie-standard-v1"],
  "m6-assess-03": ["m6-consequenties-repair-v1"],
};

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });

  const body = await request.json().catch(() => null) as { answers?: Record<string, number> } | null;
  const answers = body?.answers ?? {};
  const results = Object.entries(answerKey).map(([id, correctIndex]) => ({
    id,
    objectiveId: objectiveByQuestion[id],
    correct: answers[id] === correctIndex,
  }));
  const correct = results.filter((item) => item.correct).length;
  const remediationSequence = Array.from(new Set(
    results.flatMap((item) => item.correct ? [] : remediationByQuestion[item.id] ?? []),
  ));
  const passed = correct === results.length;

  const profileUpdate: Record<string, string> = Object.fromEntries(
    results.map((item) => [item.objectiveId, item.correct ? "demonstrated" : "needs_remediation"]),
  );

  let persistence = "preview-session-only";
  let transitionIds: { profileId: string; evidenceIds: string[]; decisionId: string } | null = null;

  if (isAdaptivePersistenceEnabled()) {
    try {
      const context = await requireAdaptiveLearningContext(adaptiveModule6CourseSlug, adaptiveModule6SourceModuleId);
      const state = await getAdaptiveStateForLearner(context);
      const conceptMastery = {
        ...(state.profile?.concept_mastery ?? {}),
        ...profileUpdate,
      };
      const previousRouteState = state.profile?.route_state ?? {};

      const persisted = await persistAdaptiveTransitionForLearner(context, {
        profile: {
          schemaVersion: adaptiveSchemaVersion,
          classifierVersion: adaptiveModule6AssessmentVersion,
          conceptMastery,
          misconceptionSignals: state.profile?.misconception_signals ?? {},
          routeState: {
            ...previousRouteState,
            module: adaptiveModule6SourceModuleId,
            phase: passed ? "mastery_check_passed" : "assessment_remediation",
            assessment: { correct, total: results.length, passed, remediationSequence },
          },
          preferences: state.profile?.preferences ?? {},
        },
        evidence: results.map((item) => ({
          moduleId: context.module.id,
          objectiveId: item.objectiveId,
          evidenceType: "assessment" as const,
          sourceRef: item.id,
          result: { correct: item.correct },
          evidenceStrength: 1,
          classifierVersion: adaptiveModule6AssessmentVersion,
        })),
        decision: {
          moduleId: context.module.id,
          objectiveId: passed ? null : results.find((item) => !item.correct)?.objectiveId ?? null,
          action: passed ? "recheck" : "targeted_remediation",
          routeId: passed ? "complete" : "remediation",
          selectedContentIds: passed ? [] : remediationSequence,
          reasonCode: passed ? "ASSESSMENT_MASTERED" : "ASSESSMENT_REMEDIATION",
          rationale: passed
            ? "All mandatory Module 6 mastery checks passed"
            : "One or more mandatory Module 6 mastery checks require targeted remediation",
          orchestratorVersion: adaptiveModule6OrchestratorVersion,
          learnerOverride: false,
        },
      });
      persistence = "supabase-preview";
      transitionIds = {
        profileId: persisted.profile_id,
        evidenceIds: persisted.evidence_ids,
        decisionId: persisted.decision_id,
      };
    } catch (error) {
      if (error instanceof AdaptiveAccessError) {
        return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
      }
      console.error("adaptive_assessment_persistence_failed", error);
      return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({
    correct,
    total: results.length,
    passed,
    results: results.map(({ id, correct: isCorrect }) => ({ id, correct: isCorrect })),
    remediationSequence,
    profileUpdate,
    persistence,
    transitionIds,
  });
}
