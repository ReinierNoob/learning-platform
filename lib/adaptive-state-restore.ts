import "server-only";

import type { AdaptiveModuleDefinition, AdaptiveRouteId } from "./adaptive-module-definition";
import type { AdaptiveLearningContext } from "./adaptive-service";
import { getAdaptiveStateForLearner } from "./adaptive-service";

function isRoute(value: unknown): value is AdaptiveRouteId {
  return value === "A" || value === "B" || value === "C";
}

function belongsToModule(item: Record<string, unknown>, moduleId: string) {
  return item.module_id === moduleId;
}

/**
 * Builds the restore payload for exactly one published module.
 *
 * The learner profile intentionally remains course-scoped so mastery can be
 * reused across modules. Route/evidence/decision history is module-scoped so a
 * refresh in Module 4 can never restore Module 5 or Module 6 navigation state.
 */
export async function buildAdaptiveModuleRestoreState(
  context: AdaptiveLearningContext,
  definition: AdaptiveModuleDefinition,
) {
  const state = await getAdaptiveStateForLearner(context);
  if (!state.profile) return null;

  const rawRouteState = state.profile.route_state ?? {};
  const routeState = Number(rawRouteState.module) === definition.sourceModuleId
    ? rawRouteState
    : {};

  const recentDecisions = state.recent_decisions.filter((item) => belongsToModule(item, context.module.id));
  const recentEvidence = state.recent_evidence.filter((item) => belongsToModule(item, context.module.id));
  const latestDecision = recentDecisions[0] ?? {};
  const candidate = routeState.route ?? latestDecision.route_id;
  const route = isRoute(candidate) ? candidate : null;
  if (!route) return null;

  const reasonCode = typeof routeState.reasonCode === "string"
    ? routeState.reasonCode
    : typeof latestDecision.reason_code === "string"
      ? latestDecision.reason_code
      : "PERSISTED_STATE";

  const evidence = recentEvidence
    .filter((item) => item.evidence_type === "diagnostic")
    .slice(0, definition.diagnostics.length)
    .map((item) => ({
      id: typeof item.source_ref === "string" ? item.source_ref : "persisted-evidence",
      objectiveId: typeof item.objective_id === "string" ? item.objective_id : "unknown",
      passed: Boolean((item.result as { passed?: unknown } | undefined)?.passed),
    }));

  const misconceptions = definition.misconceptions.filter(
    (id) => state.profile?.misconception_signals?.[id] === true,
  );

  const conceptMastery = Object.fromEntries(
    definition.objectives
      .filter((id) => state.profile?.concept_mastery?.[id] !== undefined)
      .map((id) => [id, state.profile!.concept_mastery[id]]),
  );

  return {
    route,
    reasonCode,
    sequence: [...definition.routes[route]],
    evidence,
    misconceptions,
    profile: {
      conceptMastery,
      routeHistory: recentDecisions,
      persistence: "supabase-preview",
    },
  };
}
