# Adaptive Learning v2 — Supabase persistence validation

**Datum:** 2026-08-31  
**Status:** historische development-branch validatie; canonical schema is inmiddels gecentraliseerd in `ReinierNoob/enterprise-architecture-works`  
**Productie gewijzigd:** nee

## Historische validatie

De oorspronkelijke adaptive persistence is op een tijdelijke Supabase development branch gevalideerd op:

- `adaptive_learner_profiles`, `learning_evidence`, `adaptive_decisions`;
- RLS en browser deny-all;
- service-role-only RPC writes;
- `SECURITY INVOKER` hardening;
- entitlement/enrollment gating;
- atomic profile/evidence/decision transition;
- rollback bij een ongeldige decision;
- service-role write path;
- benodigde foreign-key-indexen;
- advisorcontrole.

De testbranch is na validatie verwijderd en heeft productie niet gewijzigd.

## Architectuurwijziging na Data Model Gate

De gedeelde Supabase-DDL en databasecontracttests zijn niet langer onderdeel van de `learning-platform` schemahistorie. Dit voorkomt twee database-sources-of-truth.

Canonical eigenaar is nu:

`ReinierNoob/enterprise-architecture-works`

Canonical migrations:

1. `20260831173000_adaptive_learning_v2_persistence.sql`
2. `20260831173500_adaptive_learning_v2_atomic_transition.sql`
3. `20260831174000_adaptive_learning_v2_hardening.sql`
4. `20260831174500_adaptive_learning_v2_event_ordering.sql`
5. `20260831175000_adaptive_course_scope_integrity.sql`

Canonical databasecontracts:

- `adaptive_learning_v2_schema_checks.sql`
- `adaptive_learning_v2_behavior_checks.sql`
- `adaptive_learning_v2_event_ordering_regression.sql`

Deze contracten draaien samen met de course-domain-, course-scope- en lifecyclecontracten in de centrale EAW clean migration replay.

## Runtimeverantwoordelijkheid

`learning-platform` behoudt uitsluitend:

- adaptive module/runtimecontracten;
- session/course/entitlement/module context;
- server-only adaptive RPC-client;
- fail-closed platformprogress sync;
- learner UX.

Officiële course completion blijft eigendom van het bestaande EAW enrollment/module/item progressmodel.

## Productiegate

Deze centralisatie is geen productiepromotie. Production apply, production adaptive flags, commerciële configuratie, launch en learnerrelease blijven aparte gated stappen.
