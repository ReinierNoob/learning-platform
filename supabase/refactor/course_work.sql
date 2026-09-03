-- Additive RPCs; use existing authoritative progress and learning_evidence.
-- Apply to a test database first. Course content is a separate guarded operation.
alter table public.assessment_attempts add column if not exists content_version text;

create or replace function public.course_practice_work(
 p_user_id uuid, p_module_id uuid, p_content_version text,
 p_text text default null, p_expected_id uuid default null
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 m public.course_modules%rowtype; e uuid; profile uuid;
 previous public.learning_evidence%rowtype; saved public.learning_evidence%rowtype;
begin
 select * into m from public.course_modules where id=p_module_id and is_published for share;
 if m.id is null then raise exception 'module_not_found'; end if;
 e := private.adaptive_active_enrollment(p_user_id,m.course_id);
 if e is null then raise exception 'no_active_entitlement' using errcode='42501'; end if;
 if not exists(select 1 from jsonb_array_elements(m.chapters) c where c ? 'practice') then raise exception 'practice_not_found'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text||':'||p_module_id::text,0));
 select * into previous from public.learning_evidence
 where user_id=p_user_id and course_id=m.course_id and module_id=m.id and objective_id='course-practice'
 order by event_seq desc limit 1;
 if p_text is null then
   if previous.id is null then return null; end if;
   return jsonb_build_object('id',previous.id,'content_version',previous.result->>'content_version','text',previous.result->>'text','created_at',previous.created_at);
 end if;
 if m.content_version is distinct from p_content_version then raise exception 'content_changed'; end if;
 if length(btrim(p_text))=0 or length(p_text)>24000 then raise exception 'invalid_work'; end if;
 if previous.id is distinct from p_expected_id then raise exception 'work_conflict'; end if;
 insert into public.adaptive_learner_profiles(enrollment_id,user_id,course_id,schema_version,classifier_version)
 values(e,p_user_id,m.course_id,'v2.3','course-work-v1') on conflict(user_id,course_id) do nothing;
 select id into profile from public.adaptive_learner_profiles where user_id=p_user_id and course_id=m.course_id and enrollment_id=e;
 if profile is null then raise exception 'profile_scope_mismatch'; end if;
 insert into public.learning_evidence(profile_id,enrollment_id,user_id,course_id,module_id,objective_id,evidence_type,source_ref,result,evidence_strength,classifier_version)
 values(profile,e,p_user_id,m.course_id,m.id,'course-practice','self_report','course-work:'||gen_random_uuid()::text,
 jsonb_build_object('content_version',p_content_version,'text',p_text,'supersedes',previous.id,'assessment_status','not_assessed'),0,'course-work-v1') returning * into saved;
 return jsonb_build_object('id',saved.id,'content_version',p_content_version,'text',p_text,'created_at',saved.created_at);
end $$;
revoke all on function public.course_practice_work(uuid,uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.course_practice_work(uuid,uuid,text,text,uuid) to service_role;

create or replace function public.grade_course_module(
 p_user_id uuid,p_module_id uuid,p_content_version text,p_answers jsonb,p_started_at timestamptz default null
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 m public.course_modules%rowtype; enrollment uuid; assessment jsonb; q jsonb; k jsonb;
 given text; expected text; correct_count integer:=0; results jsonb:='[]'::jsonb; score numeric;
 content_id uuid; assessment_id uuid; progress jsonb; key_count integer;
begin
 -- The row lock keeps the graded content version stable through all progress writes.
 select * into m from public.course_modules where id=p_module_id and is_published for share;
 if m.id is null then raise exception 'module_not_found'; end if;
 enrollment := private.adaptive_active_enrollment(p_user_id,m.course_id);
 if enrollment is null then raise exception 'no_active_entitlement' using errcode='42501'; end if;
 if m.content_version is distinct from p_content_version then raise exception 'content_changed'; end if;
 assessment := m.system_instruction::jsonb;
 if assessment->>'content_version' is distinct from m.content_version or assessment->>'module_id' is distinct from m.id::text then raise exception 'assessment_version_mismatch'; end if;
 if jsonb_typeof(p_answers) is distinct from 'object' or jsonb_array_length(m.quiz)=0 then raise exception 'answers_invalid'; end if;
 if (select count(*) from jsonb_object_keys(p_answers)) <> jsonb_array_length(m.quiz) then raise exception 'answers_invalid'; end if;
 if jsonb_array_length(assessment->'items') <> jsonb_array_length(m.quiz) then raise exception 'assessment_incomplete'; end if;
 for q in select value from jsonb_array_elements(m.quiz) loop
   given := p_answers->>(q->>'nr');
   if given is null or not (q->'opties' ? given) then raise exception 'answers_invalid'; end if;
   select count(*) into key_count from jsonb_array_elements(assessment->'items') a where a->>'nr'=q->>'nr';
   if key_count<>1 then raise exception 'assessment_incomplete'; end if;
   select value into k from jsonb_array_elements(assessment->'items') where value->>'nr'=q->>'nr';
   expected := k->>'correct_option';
   if expected is null or not (q->'opties' ? expected) or k->'feedback_by_option'->>given is null then raise exception 'assessment_incomplete'; end if;
   if given=expected then correct_count:=correct_count+1; end if;
   results:=results||jsonb_build_array(jsonb_build_object('nr',(q->>'nr')::integer,'correct',given=expected,'juisteAntwoord',expected,'uitleg',k->'feedback_by_option'->>given));
 end loop;
 score:=round(100.0*correct_count/jsonb_array_length(m.quiz),2);
 if (select count(*) from public.module_items where module_id=m.id and item_type='assessment')<>1 then raise exception 'assessment_item_ambiguous'; end if;
 select id into assessment_id from public.module_items where module_id=m.id and item_type='assessment';
 -- Preserve existing completion policy. No minimum score; retries create attempts.
 -- Both writes are in this transaction: an assessment error cannot mark content complete.
 for content_id in select id from public.module_items where module_id=m.id and item_type='content' loop
   perform public.complete_module_item(p_user_id,content_id,null,null);
 end loop;
 progress:=public.complete_module_item(p_user_id,assessment_id,score,case when p_started_at<=now() then p_started_at else null end);
 update public.assessment_attempts aa set content_version=m.content_version
 from public.module_progress mp
 where aa.module_progress_id=mp.id and mp.enrollment_id=enrollment and mp.module_id=m.id
 and aa.attempt_number=(progress->>'attempt_number')::integer;
 return jsonb_build_object('resultaten',results,'score',score,'progress',progress,'content_version',m.content_version);
end $$;
revoke all on function public.grade_course_module(uuid,uuid,text,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.grade_course_module(uuid,uuid,text,jsonb,timestamptz) to service_role;
