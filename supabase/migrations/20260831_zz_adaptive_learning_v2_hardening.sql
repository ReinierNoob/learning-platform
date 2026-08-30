-- Hardening after Supabase branch validation of Adaptive Learning v2.
-- Keeps all adaptive writes service-role-only, removes unnecessary SECURITY DEFINER,
-- adds explicit browser deny policies, and covers adaptive foreign keys with indexes.

create index if not exists adaptive_learner_profiles_course_id_idx
  on public.adaptive_learner_profiles(course_id);
create index if not exists learning_evidence_user_id_idx
  on public.learning_evidence(user_id);
create index if not exists learning_evidence_course_id_idx
  on public.learning_evidence(course_id);
create index if not exists learning_evidence_module_id_idx
  on public.learning_evidence(module_id);
create index if not exists adaptive_decisions_enrollment_id_idx
  on public.adaptive_decisions(enrollment_id);
create index if not exists adaptive_decisions_user_id_idx
  on public.adaptive_decisions(user_id);
create index if not exists adaptive_decisions_course_id_idx
  on public.adaptive_decisions(course_id);
create index if not exists adaptive_decisions_module_id_idx
  on public.adaptive_decisions(module_id);

create policy adaptive_learner_profiles_browser_deny_all
  on public.adaptive_learner_profiles
  for all to anon, authenticated
  using (false)
  with check (false);
create policy learning_evidence_browser_deny_all
  on public.learning_evidence
  for all to anon, authenticated
  using (false)
  with check (false);
create policy adaptive_decisions_browser_deny_all
  on public.adaptive_decisions
  for all to anon, authenticated
  using (false)
  with check (false);

alter function private.adaptive_active_enrollment(uuid,uuid) security invoker;
alter function public.adaptive_upsert_profile(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb) security invoker;
alter function public.adaptive_append_evidence(uuid,uuid,uuid,text,text,text,jsonb,numeric,text) security invoker;
alter function public.adaptive_record_decision(uuid,uuid,uuid,text,text,text,jsonb,uuid[],text,text,text,boolean) security invoker;
alter function public.adaptive_get_state(uuid,uuid) security invoker;
alter function public.adaptive_record_transition(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb) security invoker;

revoke all on function private.adaptive_active_enrollment(uuid,uuid) from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on function private.adaptive_active_enrollment(uuid,uuid) to service_role;