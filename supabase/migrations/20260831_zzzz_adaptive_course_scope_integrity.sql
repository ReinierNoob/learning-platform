-- Adaptive Learning v2 course-scope integrity.
-- Depends on the central EAW course-scope migration that provides composite
-- enrollment/course-module keys. Apply only after that platform migration.

alter table public.adaptive_learner_profiles
  add constraint adaptive_profiles_id_scope_key
    unique (id, enrollment_id, user_id, course_id),
  add constraint adaptive_profiles_enrollment_scope_fkey
    foreign key (enrollment_id, user_id, course_id)
    references public.enrollments(id, user_id, course_id)
    not valid;

alter table public.adaptive_learner_profiles
  validate constraint adaptive_profiles_enrollment_scope_fkey;

alter table public.learning_evidence
  add constraint learning_evidence_profile_scope_fkey
    foreign key (profile_id, enrollment_id, user_id, course_id)
    references public.adaptive_learner_profiles(id, enrollment_id, user_id, course_id)
    not valid,
  add constraint learning_evidence_module_course_fkey
    foreign key (module_id, course_id)
    references public.course_modules(id, course_id)
    not valid;

alter table public.learning_evidence
  validate constraint learning_evidence_profile_scope_fkey;
alter table public.learning_evidence
  validate constraint learning_evidence_module_course_fkey;

alter table public.adaptive_decisions
  add constraint adaptive_decisions_profile_scope_fkey
    foreign key (profile_id, enrollment_id, user_id, course_id)
    references public.adaptive_learner_profiles(id, enrollment_id, user_id, course_id)
    not valid,
  add constraint adaptive_decisions_module_course_fkey
    foreign key (module_id, course_id)
    references public.course_modules(id, course_id)
    not valid;

alter table public.adaptive_decisions
  validate constraint adaptive_decisions_profile_scope_fkey;
alter table public.adaptive_decisions
  validate constraint adaptive_decisions_module_course_fkey;
