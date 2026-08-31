import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveSchemaVersion, adaptiveSolutionArchitectureCourseSlug, adaptiveModule4SourceModuleId, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, getAdaptiveStateForLearner, persistAdaptiveTransitionForLearner, requireAdaptiveLearningContext, type AdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { module4AnswerKey, module4AssessmentVersion, module4OrchestratorVersion, module4RemediationByQuestion } from "../../../../../lib/solution-architecture-module-4-server";
import { solutionArchitectureModule4 } from "../../../../../lib/solution-architecture-module-4";
import { shouldSyncAdaptivePlatformProgress, syncAdaptiveModulePlatformProgress } from "../../../../../lib/adaptive-platform-progress";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await request.json().catch(() => null) as { answers?: Record<string, number>; syncPlatformProgress?: boolean } | null;
  const answers = body?.answers ?? {};
  const syncPlatformProgress = shouldSyncAdaptivePlatformProgress(request, body?.syncPlatformProgress);

  const results = solutionArchitectureModule4.assessment.map((question) => ({
    id: question.id,
    objectiveId: question.objectiveId,
    correct: answers[question.id] === module4AnswerKey[question.id],
  }));
  const correct = results.filter((item) => item.correct).length;
  const passed = correct === results.length;
  const remediationSequence = Array.from(new Set(results.flatMap((item) => item.correct ? [] : module4RemediationByQuestion[item.id] ?? [])));
  const profileUpdate = Object.fromEntries(results.map((item) => [item.objectiveId, item.correct ? "demonstrated" : "needs_remediation"]));

  let persistence = "preview-session-only";
  let transitionIds: unknown = null;
  let context: AdaptiveLearningContext | null = null;

  if (isAdaptivePersistenceEnabled()) {
    try {
      context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule4SourceModuleId);
      const state = await getAdaptiveStateForLearner(context);
      const persisted = await persistAdaptiveTransitionForLearner(context, {
        profile: {
          schemaVersion: adaptiveSchemaVersion,
          classifierVersion: module4AssessmentVersion,
          conceptMastery: { ...(state.profile?.concept_mastery ?? {}), ...profileUpdate },
          misconceptionSignals: state.profile?.misconception_signals ?? {},
          routeState: { ...(state.profile?.route_state ?? {}), module: adaptiveModule4SourceModuleId, phase: passed ? "mastery_check_passed" : "assessment_remediation", assessment: { correct, total: results.length, passed, remediationSequence } },
          preferences: state.profile?.preferences ?? {},
        },
        evidence: results.map((item) => ({
          moduleId: context!.module.id,
          objectiveId: item.objectiveId,
          evidenceType: "assessment" as const,
          sourceRef: item.id,
          result: { correct: item.correct },
          evidenceStrength: 1,
          classifierVersion: module4AssessmentVersion,
        })),
        decision: {
          moduleId: context.module.id,
          objectiveId: passed ? null : results.find((item) => !item.correct)?.objectiveId ?? null,
          action: passed ? "recheck" : "targeted_remediation",
          routeId: passed ? "complete" : "remediation",
          selectedContentIds: passed ? [] : remediationSequence,
          reasonCode: passed ? "ASSESSMENT_MASTERED" : "ASSESSMENT_REMEDIATION",
          rationale: passed ? "All mandatory Module 4 mastery checks passed" : "One or more mandatory Module 4 mastery checks require targeted remediation",
          orchestratorVersion: module4OrchestratorVersion,
          learnerOverride: false,
        },
      });
      persistence = "supabase-preview";
      transitionIds = { profileId: persisted.profile_id, evidenceIds: persisted.evidence_ids, decisionId: persisted.decision_id };
    } catch (error) {
      if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
      console.error("adaptive_module4_assessment_failed", error);
      return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
    }
  }

  let platformProgress = {
    status: syncPlatformProgress ? (passed ? "failed" : "not_passed") : "not_requested",
    completionPercentage: null as number | null,
    score: null as number | null,
  };

  if (syncPlatformProgress && passed) {
    try {
      context ??= await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule4SourceModuleId);
      platformProgress = await syncAdaptiveModulePlatformProgress(
        context,
        solutionArchitectureModule4.assessment,
        module4AnswerKey,
        answers,
      );
    } catch (error) {
      if (!(error instanceof AdaptiveAccessError)) console.error("adaptive_module4_platform_progress_failed", error);
      platformProgress = { status: "failed", completionPercentage: null, score: null };
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
    platformProgress,
  });
}
