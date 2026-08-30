-- Deterministic ordering for Adaptive Learning v2 audit events.
-- `now()` is transaction-stable in PostgreSQL, so multiple transitions recorded
-- in one transaction can share the same created_at timestamp. A monotone event
-- sequence makes state restoration and audit ordering deterministic.

alter table public.learning_evidence
  add column if not exists event_seq bigint generated always as identity;

alter table public.adaptive_decisions
  add column if not exists event_seq bigint generated always as identity;

create unique index if not exists learning_evidence_event_seq_uidx
  on public.learning_evidence(event_seq);
create index if not exists learning_evidence_profile_seq_idx
  on public.learning_evidence(profile_id, event_seq desc);

create unique index if not exists adaptive_decisions_event_seq_uidx
  on public.adaptive_decisions(event_seq);
create index if not exists adaptive_decisions_profile_seq_idx
  on public.adaptive_decisions(profile_id, event_seq desc);

do $$
begin
  execute format(
    'grant usage, select on sequence %s to service_role',
    pg_get_serial_sequence('public.learning_evidence', 'event_seq')
  );
  execute format(
    'grant usage, select on sequence %s to service_role',
    pg_get_serial_sequence('public.adaptive_decisions', 'event_seq')
  );
end $$;

create or replace function public.adaptive_get_state(p_user_id uuid, p_course_id uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_enrollment_id uuid;
  v_profile public.adaptive_learner_profiles%rowtype;
begin
  v_enrollment_id := private.adaptive_active_enrollment(p_user_id, p_course_id);
  if v_enrollment_id is null then
    raise exception 'adaptive_entitlement_required' using errcode = '42501';
  end if;

  select * into v_profile
  from public.adaptive_learner_profiles
  where enrollment_id = v_enrollment_id;

  if v_profile.id is null then
    return jsonb_build_object(
      'enrollment_id', v_enrollment_id,
      'profile', null,
      'recent_evidence', '[]'::jsonb,
      'recent_decisions', '[]'::jsonb
    );
  end if;

  return jsonb_build_object(
    'enrollment_id', v_enrollment_id,
    'profile', to_jsonb(v_profile),
    'recent_evidence', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.event_seq desc)
      from (
        select id, event_seq, module_id, objective_id, evidence_type, source_ref,
               result, evidence_strength, classifier_version, created_at
        from public.learning_evidence
        where profile_id = v_profile.id
        order by event_seq desc
        limit 50
      ) x
    ), '[]'::jsonb),
    'recent_decisions', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.event_seq desc)
      from (
        select id, event_seq, module_id, objective_id, action, route_id, selected_content_ids,
               evidence_ids, reason_code, rationale, orchestrator_version,
               learner_override, created_at
        from public.adaptive_decisions
        where profile_id = v_profile.id
        order by event_seq desc
        limit 50
      ) x
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.adaptive_get_state(uuid,uuid) from public, anon, authenticated;
grant execute on function public.adaptive_get_state(uuid,uuid) to service_role;
