-- Atomic persistence for one adaptive learning transition.
-- Depends on 20260831_adaptive_learning_v2_persistence.sql.

create or replace function public.adaptive_record_transition(
  p_user_id uuid,
  p_course_id uuid,
  p_schema_version text,
  p_classifier_version text,
  p_concept_mastery jsonb,
  p_misconception_signals jsonb,
  p_route_state jsonb,
  p_preferences jsonb,
  p_evidence jsonb,
  p_decision jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_evidence_item jsonb;
  v_evidence_id uuid;
  v_evidence_ids uuid[] := '{}'::uuid[];
  v_decision_id uuid;
  v_module_id uuid;
begin
  if jsonb_typeof(coalesce(p_evidence, '[]'::jsonb)) <> 'array' then
    raise exception 'adaptive_evidence_must_be_array' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_decision, '{}'::jsonb)) <> 'object' then
    raise exception 'adaptive_decision_must_be_object' using errcode = '22023';
  end if;

  v_profile_id := public.adaptive_upsert_profile(
    p_user_id,
    p_course_id,
    p_schema_version,
    p_classifier_version,
    coalesce(p_concept_mastery, '{}'::jsonb),
    coalesce(p_misconception_signals, '{}'::jsonb),
    coalesce(p_route_state, '{}'::jsonb),
    coalesce(p_preferences, '{}'::jsonb)
  );

  for v_evidence_item in
    select value from jsonb_array_elements(coalesce(p_evidence, '[]'::jsonb))
  loop
    v_module_id := nullif(v_evidence_item ->> 'module_id', '')::uuid;

    v_evidence_id := public.adaptive_append_evidence(
      p_user_id,
      p_course_id,
      v_module_id,
      v_evidence_item ->> 'objective_id',
      v_evidence_item ->> 'evidence_type',
      v_evidence_item ->> 'source_ref',
      coalesce(v_evidence_item -> 'result', '{}'::jsonb),
      (v_evidence_item ->> 'evidence_strength')::numeric,
      coalesce(nullif(v_evidence_item ->> 'classifier_version', ''), p_classifier_version)
    );

    v_evidence_ids := array_append(v_evidence_ids, v_evidence_id);
  end loop;

  v_module_id := nullif(p_decision ->> 'module_id', '')::uuid;

  v_decision_id := public.adaptive_record_decision(
    p_user_id,
    p_course_id,
    v_module_id,
    nullif(p_decision ->> 'objective_id', ''),
    p_decision ->> 'action',
    nullif(p_decision ->> 'route_id', ''),
    coalesce(p_decision -> 'selected_content_ids', '[]'::jsonb),
    v_evidence_ids,
    p_decision ->> 'reason_code',
    nullif(p_decision ->> 'rationale', ''),
    p_decision ->> 'orchestrator_version',
    coalesce((p_decision ->> 'learner_override')::boolean, false)
  );

  return jsonb_build_object(
    'profile_id', v_profile_id,
    'evidence_ids', to_jsonb(v_evidence_ids),
    'decision_id', v_decision_id
  );
end;
$$;

revoke all on function public.adaptive_record_transition(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb)
  from public, anon, authenticated;
grant execute on function public.adaptive_record_transition(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb)
  to service_role;
