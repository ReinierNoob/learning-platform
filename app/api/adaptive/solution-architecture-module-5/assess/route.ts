import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveModule5SourceModuleId, adaptiveSchemaVersion, adaptiveSolutionArchitectureCourseSlug, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, getAdaptiveStateForLearner, persistAdaptiveTransitionForLearner, requireAdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { assessModule5Answers, module5AssessmentVersion, module5OrchestratorVersion } from "../../../../../lib/solution-architecture-module-5-runtime";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await request.json().catch(() => null) as { answers?: Record<string, number>; syncPlatformProgress?: boolean } | null;
  const result = assessModule5Answers(body?.answers ?? {});
  let persistence = "preview-session-only";
  let transitionIds: unknown = null;

  if (isAdaptivePersistenceEnabled()) {
    try {
      const context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule5SourceModuleId);
      const state = await getAdaptiveStateForLearner(context);
      const conceptMastery = { ...(state.profile?.concept_mastery ?? {}), ...result.profileUpdate };
      const persisted = await persistAdaptiveTransitionForLearner(context, {
        profile: {
          schemaVersion: adaptiveSchemaVersion,
          classifierVersion: module5AssessmentVersion,
          conceptMastery,
          misconceptionSignals: state.profile?.misconception_signals ?? {},
          routeState: { ...(state.profile?.route_state ?? {}), module: adaptiveModule5SourceModuleId, phase: result.passed ? "mastery_check_passed" : "assessment_remediation", assessment: { correct: result.correct, total: result.total, passed: result.passed, remediationSequence: result.remediationSequence } },
          preferences: state.profile?.preferences ?? {},
        },
        evidence: result.results.map((item) => ({
          moduleId: context.module.id,
          objectiveId: item.objectiveId,
          evidenceType: "assessment" as const,
          sourceRef: item.id,
          result: { correct: item.correct },
          evidenceStrength: 1,
          classifierVersion: module5AssessmentVersion,
        })),
        decision: {
          moduleId: context.module.id,
          objectiveId: result.passed ? null : result.results.find((item) => !item.correct)?.objectiveId ?? null,
          action: result.passed ? "recheck" : "targeted_remediation",
          routeId: result.passed ? "complete" : "remediation",
          selectedContentIds: result.passed ? [] : result.remediationSequence,
          reasonCode: result.passed ? "ASSESSMENT_MASTERED" : "ASSESSMENT_REMEDIATION",
          rationale: result.passed ? "All mandatory Module 5 mastery checks passed" : "Module 5 requires targeted remediation",
          orchestratorVersion: module5OrchestratorVersion,
          learnerOverride: false,
        },
      });
      persistence = "supabase-preview";
      transitionIds = { profileId: persisted.profile_id, evidenceIds: persisted.evidence_ids, decisionId: persisted.decision_id };
    } catch (error) {
      if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
      console.error("adaptive_module5_assessment_persistence_failed", error);
      return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({
    correct: result.correct,
    total: result.total,
    passed: result.passed,
    results: result.results.map(({ id, correct }) => ({ id, correct })),
    remediationSequence: result.remediationSequence,
    profileUpdate: result.profileUpdate,
    persistence,
    transitionIds,
    platformProgress: body?.syncPlatformProgress ? { status: "not_configured", completionPercentage: null } : { status: "not_requested", completionPercentage: null },
  });
}
