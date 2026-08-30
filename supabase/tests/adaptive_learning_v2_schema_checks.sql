-- Run after the adaptive learning migrations on a NON-PRODUCTION Supabase branch.
-- Fails fast when a required table/function/grant invariant is missing.

do $$
begin
  if to_regclass('public.adaptive_learner_profiles') is null then
    raise exception 'missing table: adaptive_learner_profiles';
  end if;
  if to_regclass('public.learning_evidence') is null then
    raise exception 'missing table: learning_evidence';
  end if;
  if to_regclass('public.adaptive_decisions') is null then
    raise exception 'missing table: adaptive_decisions';
  end if;
end $$;

do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.adaptive_learner_profiles'::regclass) then
    raise exception 'RLS disabled: adaptive_learner_profiles';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.learning_evidence'::regclass) then
    raise exception 'RLS disabled: learning_evidence';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.adaptive_decisions'::regclass) then
    raise exception 'RLS disabled: adaptive_decisions';
  end if;
end $$;

do $$
begin
  if has_table_privilege('anon', 'public.adaptive_learner_profiles', 'INSERT')
     or has_table_privilege('authenticated', 'public.adaptive_learner_profiles', 'INSERT')
     or has_table_privilege('anon', 'public.learning_evidence', 'INSERT')
     or has_table_privilege('authenticated', 'public.learning_evidence', 'INSERT')
     or has_table_privilege('anon', 'public.adaptive_decisions', 'INSERT')
     or has_table_privilege('authenticated', 'public.adaptive_decisions', 'INSERT') then
    raise exception 'browser role unexpectedly has adaptive INSERT privilege';
  end if;
end $$;

do $$
begin
  if has_function_privilege(
       'authenticated',
       'public.adaptive_record_transition(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb)',
       'EXECUTE'
     ) then
    raise exception 'authenticated must not execute adaptive_record_transition';
  end if;

  if not has_function_privilege(
       'service_role',
       'public.adaptive_record_transition(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb)',
       'EXECUTE'
     ) then
    raise exception 'service_role must execute adaptive_record_transition';
  end if;
end $$;

do $$
begin
  if to_regprocedure('public.adaptive_upsert_profile(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb)') is null then
    raise exception 'missing RPC: adaptive_upsert_profile';
  end if;
  if to_regprocedure('public.adaptive_append_evidence(uuid,uuid,uuid,text,text,text,jsonb,numeric,text)') is null then
    raise exception 'missing RPC: adaptive_append_evidence';
  end if;
  if to_regprocedure('public.adaptive_record_decision(uuid,uuid,uuid,text,text,text,jsonb,uuid[],text,text,text,boolean)') is null then
    raise exception 'missing RPC: adaptive_record_decision';
  end if;
  if to_regprocedure('public.adaptive_record_transition(uuid,uuid,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb)') is null then
    raise exception 'missing RPC: adaptive_record_transition';
  end if;
  if to_regprocedure('public.adaptive_get_state(uuid,uuid)') is null then
    raise exception 'missing RPC: adaptive_get_state';
  end if;
end $$;

select 'adaptive_learning_v2_schema_checks: PASS' as result;
