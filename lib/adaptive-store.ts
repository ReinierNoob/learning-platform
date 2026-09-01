import "server-only";

import { eawSupabaseUrl } from "./platform";

const serviceRoleKey = process.env.EAW_SUPABASE_SERVICE_ROLE_KEY;

export type AdaptiveMasteryStatus = "uncertain" | "demonstrated" | "misconception" | "needs_remediation";
export type AdaptiveEvidenceType = "diagnostic" | "assessment" | "tutor_observation" | "self_report" | "learner_override" | "system";
export type AdaptiveAction = "full_route" | "accelerated_route" | "targeted_remediation" | "deeper_explanation" | "alternate_example" | "extra_practice" | "challenge" | "recheck" | "learner_override";

export type AdaptiveProfileInput = {
  userId: string;
  courseId: string;
  schemaVersion: string;
  classifierVersion: string;
  conceptMastery: Record<string, AdaptiveMasteryStatus | string>;
  misconceptionSignals?: Record<string, unknown>;
  routeState?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
};

export type AdaptiveEvidenceInput = {
  userId: string;
  courseId: string;
  moduleId: string | null;
  objectiveId: string;
  evidenceType: AdaptiveEvidenceType;
  sourceRef: string;
  result: Record<string, unknown>;
  evidenceStrength: number;
  classifierVersion: string;
};

export type AdaptiveDecisionInput = {
  userId: string;
  courseId: string;
  moduleId: string | null;
  objectiveId?: string | null;
  action: AdaptiveAction;
  routeId?: string | null;
  selectedContentIds: string[];
  evidenceIds: string[];
  reasonCode: string;
  rationale?: string | null;
  orchestratorVersion: string;
  learnerOverride?: boolean;
};

export type AdaptiveTransitionInput = {
  profile: AdaptiveProfileInput;
  evidence: Array<Omit<AdaptiveEvidenceInput, "userId" | "courseId">>;
  decision: Omit<AdaptiveDecisionInput, "userId" | "courseId" | "evidenceIds">;
};

export type AdaptiveTransitionResult = {
  profile_id: string;
  evidence_ids: string[];
  decision_id: string;
};

export type AdaptiveState = {
  enrollment_id: string;
  profile: null | {
    id: string;
    enrollment_id: string;
    user_id: string;
    course_id: string;
    schema_version: string;
    classifier_version: string;
    concept_mastery: Record<string, string>;
    misconception_signals: Record<string, unknown>;
    route_state: Record<string, unknown>;
    preferences: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
  recent_evidence: Array<Record<string, unknown>>;
  recent_decisions: Array<Record<string, unknown>>;
};

function requireServiceRoleKey() {
  if (!serviceRoleKey) throw new Error("Missing EAW_SUPABASE_SERVICE_ROLE_KEY");
  return serviceRoleKey;
}

async function serviceRpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const key = requireServiceRoleKey();
  const response = await fetch(`${eawSupabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${name}:${response.status}:${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

function assertEvidenceStrength(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error("adaptive_evidence_strength_out_of_range");
  }
}

/**
 * Preferred persistence operation for a learning step. Profile mutation,
 * evidence append and route decision are committed in one database transaction.
 */
export async function recordAdaptiveTransition(input: AdaptiveTransitionInput): Promise<AdaptiveTransitionResult> {
  for (const evidence of input.evidence) assertEvidenceStrength(evidence.evidenceStrength);

  return serviceRpc<AdaptiveTransitionResult>("adaptive_record_transition", {
    p_user_id: input.profile.userId,
    p_course_id: input.profile.courseId,
    p_schema_version: input.profile.schemaVersion,
    p_classifier_version: input.profile.classifierVersion,
    p_concept_mastery: input.profile.conceptMastery,
    p_misconception_signals: input.profile.misconceptionSignals ?? {},
    p_route_state: input.profile.routeState ?? {},
    p_preferences: input.profile.preferences ?? {},
    p_evidence: input.evidence.map((evidence) => ({
      module_id: evidence.moduleId,
      objective_id: evidence.objectiveId,
      evidence_type: evidence.evidenceType,
      source_ref: evidence.sourceRef,
      result: evidence.result,
      evidence_strength: evidence.evidenceStrength,
      classifier_version: evidence.classifierVersion,
    })),
    p_decision: {
      module_id: input.decision.moduleId,
      objective_id: input.decision.objectiveId ?? null,
      action: input.decision.action,
      route_id: input.decision.routeId ?? null,
      selected_content_ids: input.decision.selectedContentIds,
      reason_code: input.decision.reasonCode,
      rationale: input.decision.rationale ?? null,
      orchestrator_version: input.decision.orchestratorVersion,
      learner_override: input.decision.learnerOverride ?? false,
    },
  });
}

// Low-level operations are kept for migrations, support tooling and controlled
// recovery. Runtime learning flows should prefer recordAdaptiveTransition().
export async function upsertAdaptiveProfile(input: AdaptiveProfileInput): Promise<string> {
  return serviceRpc<string>("adaptive_upsert_profile", {
    p_user_id: input.userId,
    p_course_id: input.courseId,
    p_schema_version: input.schemaVersion,
    p_classifier_version: input.classifierVersion,
    p_concept_mastery: input.conceptMastery,
    p_misconception_signals: input.misconceptionSignals ?? {},
    p_route_state: input.routeState ?? {},
    p_preferences: input.preferences ?? {},
  });
}

export async function appendAdaptiveEvidence(input: AdaptiveEvidenceInput): Promise<string> {
  assertEvidenceStrength(input.evidenceStrength);
  return serviceRpc<string>("adaptive_append_evidence", {
    p_user_id: input.userId,
    p_course_id: input.courseId,
    p_module_id: input.moduleId,
    p_objective_id: input.objectiveId,
    p_evidence_type: input.evidenceType,
    p_source_ref: input.sourceRef,
    p_result: input.result,
    p_evidence_strength: input.evidenceStrength,
    p_classifier_version: input.classifierVersion,
  });
}

export async function recordAdaptiveDecision(input: AdaptiveDecisionInput): Promise<string> {
  return serviceRpc<string>("adaptive_record_decision", {
    p_user_id: input.userId,
    p_course_id: input.courseId,
    p_module_id: input.moduleId,
    p_objective_id: input.objectiveId ?? null,
    p_action: input.action,
    p_route_id: input.routeId ?? null,
    p_selected_content_ids: input.selectedContentIds,
    p_evidence_ids: input.evidenceIds,
    p_reason_code: input.reasonCode,
    p_rationale: input.rationale ?? null,
    p_orchestrator_version: input.orchestratorVersion,
    p_learner_override: input.learnerOverride ?? false,
  });
}

export async function getAdaptiveState(userId: string, courseId: string): Promise<AdaptiveState> {
  return serviceRpc<AdaptiveState>("adaptive_get_state", {
    p_user_id: userId,
    p_course_id: courseId,
  });
}
