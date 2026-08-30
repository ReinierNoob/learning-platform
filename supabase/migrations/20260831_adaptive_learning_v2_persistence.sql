-- EAW Adaptive Learning v2 persistence layer
-- DESIGN BASELINE ONLY: do not apply to production before a Supabase development-branch test.
-- The application writes through service-role-only RPCs. Browser clients receive no direct mutation grants.

create table if not exists public.adaptive_learner_profiles (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  schema_version text not null,
  classifier_version text not null,
  concept_mastery jsonb not null default '{}'::jsonb,
  misconception_signals jsonb not null default '{}'::jsonb,
  route_state jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.learning_evidence (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.adaptive_learner_profiles(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete set null,
  objective_id text not null,
  evidence_type text not null check (evidence_type in ('diagnostic','assessment','tutor_observation','self_report','learner_override','system')),
  source_ref text not null,
  result jsonb not null default '{}'::jsonb,
  evidence_strength numeric(4,3) not null check (evidence_strength >= 0 and evidence_strength <= 1),
  classifier_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adaptive_decisions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.adaptive_learner_profiles(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete set null,
  objective_id text,
  action text not null check (action in ('full_route','accelerated_route','targeted_remediation','deeper_explanation','alternate_example','extra_practice','challenge','recheck','learner_override')),
  route_id text,
  selected_content_ids jsonb not null default '[]'::jsonb,
  evidence_ids uuid[] not null default '{}',
  reason_code text not null,
  rationale text,
  orchestrator_version text not null,
  learner_override boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists learning_evidence_profile_created_idx
  on public.learning_evidence(profile_id, created_at desc);
create index if not exists learning_evidence_objective_idx
  on public.learning_evidence(enrollment_id, objective_id, created_at desc);
create index if not exists adaptive_decisions_profile_created_idx
  on public.adaptive_decisions(profile_id, created_at desc);

alter table public.adaptive_learner_profiles enable row level security;
alter table public.learning_evidence enable row level security;
alter table public.adaptive_decisions enable row level security;

-- Defense in depth: no browser-role CRUD. The learning server uses the service role
-- after validating the end-user session and entitlement through existing platform calls.
revoke all on public.adaptive_learner_profiles from anon, authenticated;
revoke all on public.learning_evidence from anon, authenticated;
revoke all on public.adaptive_decisions from anon, authenticated;
grant all on public.adaptive_learner_profiles to service_role;
grant all on public.learning_evidence to service_role;
grant all on public.adaptive_decisions to service_role;

create or replace function private.adaptive_active_enrollment(p_user_id uuid, p_course_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select en.id
  from public.enrollments en
  join public.entitlements e on e.id = en.entitlement_id
  where en.user_id = p_user_id
    and en.course_id = p_course_id
    and e.user_id = p_user_id
    and e.course_id = p_course_id
    and e.status = 'active'
    and e.starts_at <= now()
    and e.ends_at > now()
  limit 1;
$$;

create or replace function public.adaptive_upsert_profile(
  p_user_id uuid,
  p_course_id uuid,
  p_schema_version text,
  p_classifier_version text,
  p_concept_mastery jsonb default '{}'::jsonb,
  p_misconception_signals jsonb default '{}'::jsonb,
  p_route_state jsonb default '{}'::jsonb,
  p_preferences jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid;
  v_profile_id uuid;
begin
  v_enrollment_id := private.adaptive_active_enrollment(p_user_id, p_course_id);
  if v_enrollment_id is null then
    raise exception 'adaptive_entitlement_required' using errcode = '42501';
  end if;

  insert into public.adaptive_learner_profiles (
    enrollment_id, user_id, course_id, schema_version, classifier_version,
    concept_mastery, misconception_signals, route_state, preferences
  ) values (
    v_enrollment_id, p_user_id, p_course_id, p_schema_version, p_classifier_version,
    coalesce(p_concept_mastery, '{}'::jsonb),
    coalesce(p_misconception_signals, '{}'::jsonb),
    coalesce(p_route_state, '{}'::jsonb),
    coalesce(p_preferences, '{}'::jsonb)
  )
  on conflict (user_id, course_id) do update set
    enrollment_id = excluded.enrollment_id,
    schema_version = excluded.schema_version,
    classifier_version = excluded.classifier_version,
    concept_mastery = excluded.concept_mastery,
    misconception_signals = excluded.misconception_signals,
    route_state = excluded.route_state,
    preferences = excluded.preferences,
    updated_at = now()
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;

create or replace function public.adaptive_append_evidence(
  p_user_id uuid,
  p_course_id uuid,
  p_module_id uuid,
  p_objective_id text,
  p_evidence_type text,
  p_source_ref text,
  p_result jsonb,
  p_evidence_strength numeric,
  p_classifier_version text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid;
  v_profile_id uuid;
  v_evidence_id uuid;
begin
  v_enrollment_id := private.adaptive_active_enrollment(p_user_id, p_course_id);
  if v_enrollment_id is null then
    raise exception 'adaptive_entitlement_required' using errcode = '42501';
  end if;

  select id into v_profile_id
  from public.adaptive_learner_profiles
  where enrollment_id = v_enrollment_id;

  if v_profile_id is null then
    raise exception 'adaptive_profile_required' using errcode = '23503';
  end if;

  if p_module_id is not null and not exists (
    select 1 from public.course_modules cm
    where cm.id = p_module_id and cm.course_id = p_course_id
  ) then
    raise exception 'adaptive_module_course_mismatch' using errcode = '23514';
  end if;

  insert into public.learning_evidence (
    profile_id, enrollment_id, user_id, course_id, module_id,
    objective_id, evidence_type, source_ref, result,
    evidence_strength, classifier_version
  ) values (
    v_profile_id, v_enrollment_id, p_user_id, p_course_id, p_module_id,
    p_objective_id, p_evidence_type, p_source_ref, coalesce(p_result, '{}'::jsonb),
    p_evidence_strength, p_classifier_version
  ) returning id into v_evidence_id;

  return v_evidence_id;
end;
$$;

create or replace function public.adaptive_record_decision(
  p_user_id uuid,
  p_course_id uuid,
  p_module_id uuid,
  p_objective_id text,
  p_action text,
  p_route_id text,
  p_selected_content_ids jsonb,
  p_evidence_ids uuid[],
  p_reason_code text,
  p_rationale text,
  p_orchestrator_version text,
  p_learner_override boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid;
  v_profile_id uuid;
  v_decision_id uuid;
begin
  v_enrollment_id := private.adaptive_active_enrollment(p_user_id, p_course_id);
  if v_enrollment_id is null then
    raise exception 'adaptive_entitlement_required' using errcode = '42501';
  end if;

  select id into v_profile_id
  from public.adaptive_learner_profiles
  where enrollment_id = v_enrollment_id;

  if v_profile_id is null then
    raise exception 'adaptive_profile_required' using errcode = '23503';
  end if;

  if p_module_id is not null and not exists (
    select 1 from public.course_modules cm
    where cm.id = p_module_id and cm.course_id = p_course_id
  ) then
    raise exception 'adaptive_module_course_mismatch' using errcode = '23514';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_evidence_ids, '{}'::uuid[])) as requested(id)
    left join public.learning_evidence le
      on le.id = requested.id
     and le.profile_id = v_profile_id
    where le.id is null
  ) then
    raise exception 'adaptive_evidence_profile_mismatch' using errcode = '23514';
  end if;

  insert into public.adaptive_decisions (
    profile_id, enrollment_id, user_id, course_id, module_id, objective_id,
    action, route_id, selected_content_ids, evidence_ids, reason_code,
    rationale, orchestrator_version, learner_override
  ) values (
    v_profile_id, v_enrollment_id, p_user_id, p_course_id, p_module_id, p_objective_id,
    p_action, p_route_id, coalesce(p_selected_content_ids, '[]'::jsonb),
    coalesce(p_evidence_ids, '{}'::uuid[]), p_reason_code,
    p_rationale, p_orchestrator_version, coalesce(p_learner_override, false)
  ) returning id into v_decision_id;

  return v_decision_id;
end;
$$;

create or replace function public.adaptive_get_state(p_user_id uuid, p_course_id uuid)
returns jsonb
language plpgsql
stable
security definer
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
      select jsonb_agg(to_jsonb(x) order by x.created_at desc)
      from (
        select id, module_id, objective_id, evidence_type, source_ref,
               result, evidence_strength, classifier_version, created_at
        from public.learning_evidence
        where profile_id = v_profile.id
        order by created_at desc
        limit 50
      ) x
    ), '[]'::jsonb),
    'recent_decisions', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.created_at desc)
      from (
        select id, module_id, objective_id, action, route_id, selected_content_ids,
               evidence_ids, reason_code, rationale, orchestrator_version,
               learner_override, created_at
        from public.adaptive_decisions
        where profile_id = v_profile.id
        order by created_at desc
        limit 50
      ) x
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.adaptive_upsert_profile(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.adaptive_append_evidence(uuid,uuid,uuid,text,text,text,jsonb,numeric,text) from public, anon, authenticated;
revoke all on function public.adaptive_record_decision(uuid,uuid,uuid,text,text,text,jsonb,uuid[],text,text,text,boolean) from public, anon, authenticated;
revoke all on function public.adaptive_get_state(uuid,uuid) from public, anon, authenticated;

grant execute on function public.adaptive_upsert_profile(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb) to service_role;
grant execute on function public.adaptive_append_evidence(uuid,uuid,uuid,text,text,text,jsonb,numeric,text) to service_role;
grant execute on function public.adaptive_record_decision(uuid,uuid,uuid,text,text,text,jsonb,uuid[],text,text,text,boolean) to service_role;
grant execute on function public.adaptive_get_state(uuid,uuid) to service_role;
