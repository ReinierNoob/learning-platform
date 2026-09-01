# EAW Adaptive Learning v2 — persistence design

**Datum:** 2026-08-31  
**Status:** controlled feature-branch baseline; production remains disabled  
**Runtime repository:** `ReinierNoob/learning-platform`  
**Shared Supabase schema source of truth:** `ReinierNoob/enterprise-architecture-works`

## Doel

Persistente adaptatie ondersteunen zonder een parallel auth-, entitlement- of progressiesysteem te introduceren.

## Verantwoordelijkheden

`learning-platform` bezit de adaptive runtime, modulepedagogiek en server-side RPC-clients. De gedeelde Supabase-DDL, databasecontracts en migration replay horen uitsluitend in `enterprise-architecture-works`.

Hierdoor bestaat één database source of truth en kan de runtime geen eigen, concurrerende schemahistorie introduceren.

## Aansluiting op EAW

Bestaand en hergebruikt:

- `courses.id` als learning identity;
- `entitlements` als toegangsbron;
- `enrollments` als gebruiker/cursus-inschrijving;
- `course_modules` als module-identiteit;
- `module_items` als officiële progressie-/assessmenteenheden;
- bestaande OAuth/PKCE-sessie en learning-access contracten.

Een adaptive learner profile is 1-op-1 gekoppeld aan een enrollment en course. Adaptive state is aanvullend bewijs en bepaalt niet zelfstandig officiële course completion.

## Datamodel

### `adaptive_learner_profiles`
Eén record per enrollment/user/course met schema- en classifier-versie, concept mastery, misconception signals, route state en expliciete learner preferences.

### `learning_evidence`
Append-only didactisch bewijs met objective id, evidence type, bronreferentie, resultaat, evidence strength, classifier version en volledige enrollment/course/module-scope.

### `adaptive_decisions`
Append-only audittrail met route/action, geselecteerde content ids, evidence ids, reason code/rationale, orchestrator version en learner override.

## Security en writers

Browserrollen hebben geen directe CRUD op de adaptive tabellen. Runtime writes lopen server-side via service-role RPC's, nadat de normale learning-context sessie, course, entitlement, enrollment en gepubliceerde module heeft gevalideerd.

De database controleert dezelfde enrollment/user/course/module-scope opnieuw. RPC's draaien als `SECURITY INVOKER`; alleen `service_role` heeft execute-rechten. De service-role key is server-only en mag nooit als `NEXT_PUBLIC_*` worden geconfigureerd.

## Atomiciteit en ordering

De voorkeursoperatie is `adaptive_record_transition(...)`. Eén transitie schrijft atomair:

1. learner-profile update;
2. nul of meer evidence records;
3. één adaptive decision die naar dezelfde transition-evidence verwijst.

Een fout rolt de gehele transitie terug. Evidence en decisions krijgen daarnaast een monotone `event_seq`, zodat state restoration ook bij gelijke transaction timestamps deterministisch blijft.

## Course-scope integrity

Composite foreign keys borgen:

- adaptive profile ↔ enrollment/user/course;
- evidence ↔ profile/enrollment/user/course;
- decision ↔ profile/enrollment/user/course;
- evidence/decision module ↔ dezelfde course.

Dit sluit aan op de centrale EAW course-scope hardening.

## Canonieke migrations en tests

De canonical DDL staat niet langer in deze runtime-repository. Gebruik uitsluitend de EAW-repository:

- `supabase/migrations/20260831173000_adaptive_learning_v2_persistence.sql`
- `supabase/migrations/20260831173500_adaptive_learning_v2_atomic_transition.sql`
- `supabase/migrations/20260831174000_adaptive_learning_v2_hardening.sql`
- `supabase/migrations/20260831174500_adaptive_learning_v2_event_ordering.sql`
- `supabase/migrations/20260831175000_adaptive_course_scope_integrity.sql`

Databasecontracts staan eveneens in EAW:

- `supabase/tests/adaptive_learning_v2_schema_checks.sql`
- `supabase/tests/adaptive_learning_v2_behavior_checks.sql`
- `supabase/tests/adaptive_learning_v2_event_ordering_regression.sql`

De EAW Supabase Migration Replay bouwt de volledige database vanaf nul en voert zowel de centrale course-contracten als deze adaptive-contracten uit.

## Privacy en retentie

Niet opslaan: gevoelige persoonskenmerken zonder leerdoel, vrije psychologische classificaties, pseudowetenschappelijke learning-style labels of volledige chatinhoud wanneer compacte evidence volstaat.

Adaptief profiel en didactisch bewijs vallen functioneel onder leerprogressie. Productieretentie blijft een aparte privacy/releasegate; een cleanup-mechanisme moet vóór productie definitief zijn.

## Applicatiecontract

- `lib/adaptive-store.ts` = server-only RPC wrapper;
- `lib/adaptive-service.ts` = normale sessie/course/entitlement/module-context;
- `lib/adaptive-platform-progress.ts` = enige brug naar officiële platformprogress;
- runtimeflows gebruiken `recordAdaptiveTransition()` voor adaptive state.

## Releasegate

Database-ontwerp mag alleen via de centrale EAW migration/replayketen worden gepromoveerd. Production apply, production adaptive flags, course commercial terms en launch blijven buiten deze featurebranch-gate.
