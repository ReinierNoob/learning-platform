import { NextResponse } from "next/server";
import { adaptiveAccessStatus, adaptiveSchemaVersion, adaptiveSolutionArchitectureCourseSlug, adaptiveModule4SourceModuleId, isAdaptivePersistenceEnabled } from "../../../../../lib/adaptive-runtime";
import { AdaptiveAccessError, persistAdaptiveTransitionForLearner, requireAdaptiveLearningContext } from "../../../../../lib/adaptive-service";
import { diagnoseModule4, module4ClassifierVersion, module4OrchestratorVersion } from "../../../../../lib/solution-architecture-module-4-server";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await request.json().catch(() => null) as { answers?: Record<string, string> } | null;
  const diagnosis = diagnoseModule4(body?.answers ?? {});
  let persistence = "preview-session-only";
  let transitionIds: unknown = null;

  if (isAdaptivePersistenceEnabled()) {
    try {
      const context = await requireAdaptiveLearningContext(adaptiveSolutionArchitectureCourseSlug, adaptiveModule4SourceModuleId);
      const persisted = await persistAdaptiveTransitionForLearner(context, {
        profile: {
          schemaVersion: adaptiveSchemaVersion,
          classifierVersion: module4ClassifierVersion,
          conceptMastery: diagnosis.conceptMastery,
          misconceptionSignals: Object.fromEntries(diagnosis.misconceptions.map((id) => [id, true])),
          routeState: { module: adaptiveModule4SourceModuleId, route: diagnosis.route, reasonCode: diagnosis.reasonCode, phase: "diagnosis" },
          preferences: {},
        },
        evidence: diagnosis.evidence.map((item) => ({
          moduleId: context.module.id,
          objectiveId: item.objectiveId,
          evidenceType: "diagnostic" as const,
          sourceRef: item.id,
          result: { passed: item.passed },
          evidenceStrength: item.passed ? 0.85 : 0.55,
          classifierVersion: module4ClassifierVersion,
        })),
        decision: {
          moduleId: context.module.id,
          objectiveId: null,
          action: diagnosis.route === "A" ? "full_route" : diagnosis.route === "B" ? "accelerated_route" : "targeted_remediation",
          routeId: diagnosis.route,
          selectedContentIds: diagnosis.sequence,
          reasonCode: diagnosis.reasonCode,
          rationale: `Module 4 diagnosis selected route ${diagnosis.route}`,
          orchestratorVersion: module4OrchestratorVersion,
          learnerOverride: false,
        },
      });
      persistence = "supabase-preview";
      transitionIds = { profileId: persisted.profile_id, evidenceIds: persisted.evidence_ids, decisionId: persisted.decision_id };
    } catch (error) {
      if (error instanceof AdaptiveAccessError) return NextResponse.json({ error: error.code }, { status: adaptiveAccessStatus(error.code) });
      console.error("adaptive_module4_diagnosis_persistence_failed", error);
      return NextResponse.json({ error: "adaptive_persistence_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ...diagnosis, profile: { conceptMastery: diagnosis.conceptMastery, persistence, transitionIds } });
}
