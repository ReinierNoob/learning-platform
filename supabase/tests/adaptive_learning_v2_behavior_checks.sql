-- NON-PRODUCTION ONLY.
-- Verifies entitlement gating, atomic transition persistence and rollback semantics.
-- Test data is wrapped in a transaction and rolled back.

begin;

insert into auth.users (id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values ('11111111-1111-4111-8111-111111111111','authenticated','authenticated','adaptive-test@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now())
on conflict (id) do nothing;

insert into public.profiles (user_id,first_name,last_name,locale,account_status)
values ('11111111-1111-4111-8111-111111111111','Adaptive','Test','nl-NL','active')
on conflict (user_id) do update set first_name=excluded.first_name, last_name=excluded.last_name;

insert into public.courses (id,slug,title,description,price_cents,currency,vat_rate_bps,status,launch_path)
values ('22222222-2222-4222-8222-222222222222','adaptive-test-course','Adaptive Test Course','Temporary branch-only test course',0,'EUR',2100,'published','/leren/adaptive-test-course')
on conflict (id) do nothing;

insert into public.course_modules (id,course_id,source_module_id,slug,title,position,is_required,is_published,content_version)
values ('77777777-7777-4777-8777-777777777777','22222222-2222-4222-8222-222222222222',6,'module-6','Module 6',1,true,true,'vtest')
on conflict (id) do nothing;

insert into public.orders (id,order_number,purchaser_user_id,customer_type,status,subtotal_cents,vat_cents,total_cents,currency,billing_snapshot,paid_at)
values ('33333333-3333-4333-8333-333333333333','TEST-ADAPTIVE-001','11111111-1111-4111-8111-111111111111','consumer','paid',0,0,0,'EUR','{}'::jsonb,now())
on conflict (id) do nothing;

insert into public.order_items (id,order_id,course_id,quantity,unit_price_cents,subtotal_cents,vat_rate_bps,vat_cents,total_cents,product_snapshot)
values ('44444444-4444-4444-8444-444444444444','33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222',1,0,0,2100,0,0,'{"title":"Adaptive Test Course","access_description":"Temporary branch-only test entitlement"}'::jsonb)
on conflict (id) do nothing;

insert into public.entitlements (id,user_id,course_id,source_order_item_id,status,starts_at,ends_at)
values ('55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','44444444-4444-4444-8444-444444444444','active',now()-interval '1 day',now()+interval '1 day')
on conflict (id) do nothing;

insert into public.enrollments (id,entitlement_id,user_id,course_id,status,completion_percentage,current_module_id,started_at,last_activity_at)
values ('66666666-6666-4666-8666-666666666666','55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','in_progress',0,'77777777-7777-4777-8777-777777777777',now(),now())
on conflict (id) do nothing;

do $$
begin
  begin
    perform public.adaptive_upsert_profile(
      '99999999-9999-4999-8999-999999999999'::uuid,
      '22222222-2222-4222-8222-222222222222'::uuid,
      'v2.2','module6-classifier-v1','{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb
    );
    raise exception 'entitlement denial test failed: call unexpectedly succeeded';
  exception
    when sqlstate '42501' then null;
  end;
end $$;

select public.adaptive_record_transition(
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  'v2.2',
  'module6-classifier-v1',
  '{"sa.m06.alternatieven-vergelijken":"demonstrated"}'::jsonb,
  '{}'::jsonb,
  '{"module":6,"route":"B"}'::jsonb,
  '{"support":"standard"}'::jsonb,
  '[{"module_id":"77777777-7777-4777-8777-777777777777","objective_id":"sa.m06.alternatieven-vergelijken","evidence_type":"diagnostic","source_ref":"m6-diag-02","result":{"passed":true},"evidence_strength":0.85,"classifier_version":"module6-classifier-v1"}]'::jsonb,
  '{"module_id":"77777777-7777-4777-8777-777777777777","objective_id":"sa.m06.alternatieven-vergelijken","action":"accelerated_route","route_id":"B","selected_content_ids":["m6-recap","m6-transfer"],"reason_code":"DEMONSTRATED_WITH_CHECK","rationale":"Behavior test","orchestrator_version":"adaptive-orchestrator-v2.2","learner_override":false}'::jsonb
);

do $$
declare
  before_evidence integer;
  before_decisions integer;
  before_route jsonb;
  after_evidence integer;
  after_decisions integer;
  after_route jsonb;
begin
  select count(*) into before_evidence from public.learning_evidence where enrollment_id='66666666-6666-4666-8666-666666666666';
  select count(*) into before_decisions from public.adaptive_decisions where enrollment_id='66666666-6666-4666-8666-666666666666';
  select route_state into before_route from public.adaptive_learner_profiles where enrollment_id='66666666-6666-4666-8666-666666666666';

  begin
    perform public.adaptive_record_transition(
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222222'::uuid,
      'v2.2','module6-classifier-v1',
      '{"sa.m06.alternatieven-vergelijken":"misconception"}'::jsonb,
      '{"sa.mc.trade-off-is-fout":true}'::jsonb,
      '{"module":6,"route":"BROKEN"}'::jsonb,
      '{}'::jsonb,
      '[{"module_id":"77777777-7777-4777-8777-777777777777","objective_id":"sa.m06.alternatieven-vergelijken","evidence_type":"diagnostic","source_ref":"atomic-rollback-test","result":{"passed":false},"evidence_strength":0.4,"classifier_version":"module6-classifier-v1"}]'::jsonb,
      '{"module_id":"77777777-7777-4777-8777-777777777777","objective_id":"sa.m06.alternatieven-vergelijken","action":"INVALID_ACTION","route_id":"X","selected_content_ids":[],"reason_code":"ATOMIC_TEST","orchestrator_version":"adaptive-orchestrator-v2.2"}'::jsonb
    );
    raise exception 'atomic rollback test failed: invalid decision unexpectedly succeeded';
  exception
    when check_violation then null;
  end;

  select count(*) into after_evidence from public.learning_evidence where enrollment_id='66666666-6666-4666-8666-666666666666';
  select count(*) into after_decisions from public.adaptive_decisions where enrollment_id='66666666-6666-4666-8666-666666666666';
  select route_state into after_route from public.adaptive_learner_profiles where enrollment_id='66666666-6666-4666-8666-666666666666';

  if after_evidence <> before_evidence or after_decisions <> before_decisions or after_route is distinct from before_route then
    raise exception 'atomic rollback test failed';
  end if;
end $$;

do $$
declare
  state jsonb;
begin
  state := public.adaptive_get_state(
    '11111111-1111-4111-8111-111111111111'::uuid,
    '22222222-2222-4222-8222-222222222222'::uuid
  );
  if state ->> 'enrollment_id' <> '66666666-6666-4666-8666-666666666666' then
    raise exception 'adaptive state enrollment mismatch';
  end if;
end $$;

select 'adaptive_learning_v2_behavior_checks: PASS' as result;

rollback;
