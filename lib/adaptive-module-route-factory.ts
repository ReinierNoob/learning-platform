import "server-only";

import { NextResponse } from "next/server";
import type { AdaptiveModuleDefinition, AdaptiveRouteId } from "./adaptive-module-definition";
import { adaptiveAccessStatus, adaptiveSchemaVersion, isAdaptivePersistenceEnabled, isAdaptiveSolutionArchitectureProductionEnabled } from "./adaptive-runtime";
import {
  AdaptiveAccessError,
  getAdaptiveStateForLearner,
  persistAdaptiveTransitionForLearner,
  requireAdaptiveLearningContext,
  type AdaptiveLearningContext,
} from "./adaptive-service";
import { buildAdaptiveModuleRestoreState } from "./adaptive-state-restore";
import { shouldSyncAdaptivePlatformProgress, syncAdaptiveModulePlatformProgress } from "./adaptive-platform-progress";

export type AdaptiveDiagnosis = {
  route: AdaptiveRouteId;
  reasonCode: string;
  sequence: string[];
  evidence: Array<{ id: string; objectiveId: string; passed: boolean }>;
  misconceptions: string[];
  conceptMastery: Record<string, string>;
};

export type AdaptiveTutorObservation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export type AdaptiveServerModuleContract = {
  definition: AdaptiveModuleDefinition;
  classifierVersion: string;
  assessmentVersion: string;
  orchestratorVersion: string;
  diagnose: (answers: Record<string, string>) => AdaptiveDiagnosis;
  observe: (interventionId: string, rawAnswer: unknown) => AdaptiveTutorObservation | null;
  answerKey: Readonly<Record<string, number>>;
  remediationByQuestion: Readonly<Record<string, string[]> >;
  logPrefix: string;
};

function productionDenied() {
  return process.env.VERCEL_ENV === "production" && !isAdaptiveSolutionArchitectureProductionEnabled();
}

function isRoute(value: unknown): value is AdaptiveRouteId {
  return value === "A" || value === "B" || value === "C";
}

function routeAction(route: AdaptiveRouteId) {
  return route === "A" ? "full_route" : route === "B" ? "accelerated_route" : "targeted_remediation";
}

function routeObjective(definition: AdaptiveModuleDefinition) {
  return `sa.m${String(definition.sourceModuleId).padStart(2, "0")}.route-keuze`;
}

function profileUpdateFromAssessment(
  contract: AdaptiveServerModuleContract,
  results: Array<{ objectiveId: string; correct: boolean }>,
) {
  const update: Record<string, string> = {};
  for (const objectiveId of contract.definition.objectives) {
    const objectiveResults = results.filter((item) => item.objectiveId === objectiveId);
    if (!objectiveResults.length) continue;
    update[objectiveId] = objectiveResults.every((item) => item.correct) ? "demonstrated" : "needs_remediation";
  }
  return update;
}

export function createAdaptiveDiagnoseHandler(contract: AdaptiveServerModuleContract) {
  return async function POST(request: Request) {
    if (productionDenied()) return new NextResponse(null, { status: 404 });
    const body = await request.json().catch(() => null) as { answers?: Record<string, string> } | null;
    const diagnosis = contract.diagnose(body?.answers ?? {});
    let persistence = "preview-session-only";
    let transitionIds: unknown = null;

    if (isAdaptivePersistenceEnabled()) {
      try {
        const context = await requireAdaptiveLearningContext(contract.definition.courseSlug, contract.definition.sourceModuleId);
        const persisted = await persistAdaptiveTransitionForLearner(context, {
          profile: {
            schemaVersion: adaptiveSchemaVersion,
            classifierVersion: contract.classifierVersion,
            conceptMastery: diagnosis.conceptMastery,
            misconceptionSignals: Object.fromEntries(diagnosis.misconceptions.map((id) => [id, true])),
            routeState: {
              module: contract.definition.sourceModuleId,
              route: diagnosis.route,
              reasonCode: diagnosis.reasonCode,
              phase: "diagnosis",
            },
            preferences: {},
          },
          evidence: diagnosis.evidence.map((item) => ({
            moduleId: context.module.id,
            objectiveId: item.objectiveId,
            evidenceType: "diagnostic" as const,
            sourceRef: item.id,
            result: { passed: item.passed },
            evidenceStrength: item.passed ? 0.85 : 0.55,
            classifierVersion: contract.classifierVersion,
          })),
          decision: {
            moduleId: context.module.id,
            objectiveId: null,
            action: routeAction(diagnosis.route),
            routeId: diagnosis.route,
            selectedContentIds: diagnosis.sequence,
            reasonCode: diagnosis.reasonCode,
            rationale: `Module ${contract.definition.sourceModuleId} diagnosis selected route ${diagnosis.route}`,
            orchestratorVersion: contract.orchestratorVersion,
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
        console.error(`${contract.logPrefix}_diagnosis_persistence_failed`, error);
        return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
      }
    }

    return NextResponse.json({
      ...diagnosis,
      profile: { conceptMastery: diagnosis.conceptMastery, persistence, transitionIds },
    });
  };
}

export function createAdaptiveObserveHandler(contract: AdaptiveServerModuleContract) {
  return async function POST(request: Request) {
    if (productionDenied()) return new NextResponse(null, { status: 404 });
    const body = await request.json().catch(() => null) as { interventionId?: string; answer?: string } | null;
    const interventionId = typeof body?.interventionId === "string" ? body.interventionId : "";
    const intervention = contract.definition.interventions[interventionId];
    if (!intervention?.prompt) return NextResponse.json({ error: "observation_not_supported" }, { status: 400 });

    const observation = contract.observe(interventionId, body?.answer);
    if (!observation) return NextResponse.json({ error: "answer_required" }, { status: 400 });

    let persistence = "preview-session-only";
    let transitionIds: unknown = null;
    if (isAdaptivePersistenceEnabled()) {
      try {
        const context = await requireAdaptiveLearningContext(contract.definition.courseSlug, contract.definition.sourceModuleId);
        const state = await getAdaptiveStateForLearner(context);
        const action = observation.level === "strong" ? "challenge" : observation.level === "partial" ? "deeper_explanation" : "extra_practice";
        const reasonCode = observation.level === "strong" ? "TUTOR_OBSERVATION_STRONG" : observation.level === "partial" ? "TUTOR_OBSERVATION_PARTIAL" : "TUTOR_OBSERVATION_NEEDS_WORK";
        const persisted = await persistAdaptiveTransitionForLearner(context, {
          profile: {
            schemaVersion: adaptiveSchemaVersion,
            classifierVersion: contract.classifierVersion,
            conceptMastery: state.profile?.concept_mastery ?? {},
            misconceptionSignals: state.profile?.misconception_signals ?? {},
            routeState: {
              ...(state.profile?.route_state ?? {}),
              module: contract.definition.sourceModuleId,
              phase: "tutor_observation",
              interventionId,
              observationLevel: observation.level,
            },
            preferences: state.profile?.preferences ?? {},
          },
          evidence: [{
            moduleId: context.module.id,
            objectiveId: intervention.objectiveId,
            evidenceType: "tutor_observation" as const,
            sourceRef: interventionId,
            result: { level: observation.level, canProceed: observation.canProceed, indicators: observation.indicators },
            evidenceStrength: observation.level === "strong" ? 0.72 : observation.level === "partial" ? 0.5 : 0.35,
            classifierVersion: contract.classifierVersion,
          }],
          decision: {
            moduleId: context.module.id,
            objectiveId: intervention.objectiveId,
            action,
            routeId: null,
            selectedContentIds: [interventionId],
            reasonCode,
            rationale: `Deterministic Module ${contract.definition.sourceModuleId} tutor observation for ${interventionId}`,
            orchestratorVersion: contract.orchestratorVersion,
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
        console.error(`${contract.logPrefix}_observation_failed`, error);
        return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ ...observation, objectiveId: intervention.objectiveId, persistence, transitionIds });
  };
}

export function createAdaptiveOverrideHandler(contract: AdaptiveServerModuleContract) {
  return async function POST(request: Request) {
    if (productionDenied()) return new NextResponse(null, { status: 404 });
    const body = await request.json().catch(() => null) as { route?: unknown } | null;
    if (!isRoute(body?.route)) return NextResponse.json({ error: "invalid_route" }, { status: 400 });
    if (!isAdaptivePersistenceEnabled()) {
      return NextResponse.json({ persistence: "preview-session-only", route: body.route });
    }

    try {
      const context = await requireAdaptiveLearningContext(contract.definition.courseSlug, contract.definition.sourceModuleId);
      const state = await getAdaptiveStateForLearner(context);
      const persisted = await persistAdaptiveTransitionForLearner(context, {
        profile: {
          schemaVersion: adaptiveSchemaVersion,
          classifierVersion: state.profile?.classifier_version ?? contract.classifierVersion,
          conceptMastery: state.profile?.concept_mastery ?? {},
          misconceptionSignals: state.profile?.misconception_signals ?? {},
          routeState: {
            ...(state.profile?.route_state ?? {}),
            module: contract.definition.sourceModuleId,
            route: body.route,
            reasonCode: "LEARNER_OVERRIDE",
            phase: "learner_override",
          },
          preferences: state.profile?.preferences ?? {},
        },
        evidence: [{
          moduleId: context.module.id,
          objectiveId: routeObjective(contract.definition),
          evidenceType: "learner_override" as const,
          sourceRef: `module${contract.definition.sourceModuleId}-route-${body.route}`,
          result: { route: body.route },
          evidenceStrength: 1,
          classifierVersion: contract.classifierVersion,
        }],
        decision: {
          moduleId: context.module.id,
          objectiveId: null,
          action: "learner_override",
          routeId: body.route,
          selectedContentIds: [...contract.definition.routes[body.route]],
          reasonCode: "LEARNER_OVERRIDE",
          rationale: `Learner explicitly selected Module ${contract.definition.sourceModuleId} route ${body.route}`,
          orchestratorVersion: contract.orchestratorVersion,
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
      console.error(`${contract.logPrefix}_override_failed`, error);
      return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
    }
  };
}

export function createAdaptiveStateHandler(contract: AdaptiveServerModuleContract) {
  return async function GET() {
    if (productionDenied()) return new NextResponse(null, { status: 404 });
    if (!isAdaptivePersistenceEnabled()) return NextResponse.json({ enabled: false, state: null });

    try {
      const context = await requireAdaptiveLearningContext(contract.definition.courseSlug, contract.definition.sourceModuleId);
      const state = await buildAdaptiveModuleRestoreState(context, contract.definition);
      return NextResponse.json({ enabled: true, state });
    } catch (error) {
      if (error instanceof AdaptiveAccessError) {
        return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
      }
      console.error(`${contract.logPrefix}_state_restore_failed`, error);
      return NextResponse.json({ error: "adaptive_state_restore_failed" }, { status: 500 });
    }
  };
}

export function createAdaptiveAssessHandler(contract: AdaptiveServerModuleContract) {
  return async function POST(request: Request) {
    if (productionDenied()) return new NextResponse(null, { status: 404 });
    const body = await request.json().catch(() => null) as { answers?: Record<string, number>; syncPlatformProgress?: boolean } | null;
    const answers = body?.answers ?? {};
    const syncPlatformProgress = shouldSyncAdaptivePlatformProgress(request, body?.syncPlatformProgress);

    const results = contract.definition.assessment.map((question) => ({
      id: question.id,
      objectiveId: question.objectiveId,
      correct: answers[question.id] === contract.answerKey[question.id],
    }));
    const correct = results.filter((item) => item.correct).length;
    const passed = correct === results.length;
    const remediationSequence = Array.from(new Set(results.flatMap((item) => item.correct ? [] : contract.remediationByQuestion[item.id] ?? [])));
    const profileUpdate = profileUpdateFromAssessment(contract, results);

    let persistence = "preview-session-only";
    let transitionIds: unknown = null;
    let context: AdaptiveLearningContext | null = null;
    if (isAdaptivePersistenceEnabled()) {
      try {
        context = await requireAdaptiveLearningContext(contract.definition.courseSlug, contract.definition.sourceModuleId);
        const state = await getAdaptiveStateForLearner(context);
        const persisted = await persistAdaptiveTransitionForLearner(context, {
          profile: {
            schemaVersion: adaptiveSchemaVersion,
            classifierVersion: contract.assessmentVersion,
            conceptMastery: { ...(state.profile?.concept_mastery ?? {}), ...profileUpdate },
            misconceptionSignals: state.profile?.misconception_signals ?? {},
            routeState: {
              ...(state.profile?.route_state ?? {}),
              module: contract.definition.sourceModuleId,
              phase: passed ? "mastery_check_passed" : "assessment_remediation",
              assessment: { correct, total: results.length, passed, remediationSequence },
            },
            preferences: state.profile?.preferences ?? {},
          },
          evidence: results.map((item) => ({
            moduleId: context!.module.id,
            objectiveId: item.objectiveId,
            evidenceType: "assessment" as const,
            sourceRef: item.id,
            result: { correct: item.correct },
            evidenceStrength: 1,
            classifierVersion: contract.assessmentVersion,
          })),
          decision: {
            moduleId: context.module.id,
            objectiveId: passed ? null : results.find((item) => !item.correct)?.objectiveId ?? null,
            action: passed ? "recheck" : "targeted_remediation",
            routeId: passed ? "complete" : "remediation",
            selectedContentIds: passed ? [] : remediationSequence,
            reasonCode: passed ? "ASSESSMENT_MASTERED" : "ASSESSMENT_REMEDIATION",
            rationale: passed
              ? `All mandatory Module ${contract.definition.sourceModuleId} mastery checks passed`
              : `One or more mandatory Module ${contract.definition.sourceModuleId} mastery checks require targeted remediation`,
            orchestratorVersion: contract.orchestratorVersion,
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
        console.error(`${contract.logPrefix}_assessment_failed`, error);
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
        context ??= await requireAdaptiveLearningContext(contract.definition.courseSlug, contract.definition.sourceModuleId);
        platformProgress = await syncAdaptiveModulePlatformProgress(
          context,
          contract.definition.assessment,
          contract.answerKey,
          answers,
        );
      } catch (error) {
        if (!(error instanceof AdaptiveAccessError)) {
          console.error(`${contract.logPrefix}_platform_progress_failed`, error);
        }
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
  };
}
