# EAW Adaptive Learning v2 — persistence design

**Datum:** 2026-08-31  
**Status:** design + typed repository, not applied to any database  
**Branch:** `feature/adaptive-solution-architecture-module-6`

## Doel

De session-only Module 6-pilot voorbereiden op persistente adaptatie zonder een parallel auth-, entitlement- of progressiesysteem te introduceren.

## Aansluiting op bestaande EAW-architectuur

Bestaand en hergebruikt:

- `courses` als cursusidentiteit;
- `entitlements` als commerciële toegangsbron;
- `enrollments` als unieke gebruiker/cursus-inschrijving;
- `course_modules` als gepubliceerde module-identiteit;
- `private.has_active_entitlement(...)` / bestaand learning-access patroon als autorisatiebasis;
- de bestaande OAuth/PKCE-sessie in `lib/platform.ts`.

Een adaptive learner profile is daarom 1-op-1 gekoppeld aan een `enrollment`, niet aan een los nieuw gebruikersbegrip.

## Datamodel

### `adaptive_learner_profiles`

Eén record per enrollment/gebruiker/cursus.

Bevat:

- schema- en classifier-versie;
- `concept_mastery`;
- `misconception_signals`;
- `route_state`;
- expliciete learner preferences;
- created/updated timestamps.

### `learning_evidence`

Append-only didactisch bewijs.

Bevat onder meer:

- objective id;
- evidence type;
- bronreferentie;
- resultaat als JSON;
- evidence strength 0..1;
- classifier version;
- module/course/enrollment/profile-context.

### `adaptive_decisions`

Append-only audittrail van adaptieve keuzes.

Bevat onder meer:

- action en route id;
- geselecteerde content ids;
- de evidence ids waarop het besluit steunt;
- reason code en rationale;
- orchestrator version;
- indicator voor learner override.

## Schrijfbeveiliging

Browserrollen `anon` en `authenticated` krijgen geen directe CRUD-grants op de drie tabellen.

De learning server gebruikt een afzonderlijke, server-only `EAW_SUPABASE_SERVICE_ROLE_KEY`. Voor ieder request valideert de applicatie eerst:

1. geldige EAW learning sessie;
2. bestaande cursus;
3. actieve entitlement;
4. bestaande enrollment;
5. gepubliceerde module binnen die cursus.

Daarna controleert de database opnieuw dat `user_id`, `course_id`, enrollment en entitlement bij elkaar horen.

De service-role key mag nooit als `NEXT_PUBLIC_*` worden geconfigureerd.

## Atomiciteit

De voorkeursoperatie is `adaptive_record_transition(...)`.

Eén adaptieve transitie schrijft in één Postgres-transactie:

1. learner-profile update;
2. nul of meer evidence records;
3. één adaptive decision met verwijzing naar de zojuist gemaakte evidence ids.

Een fout in een van deze stappen rolt de gehele transitie terug. Losse low-level RPC's blijven alleen beschikbaar voor gecontroleerde support/migratiehandelingen.

## Privacy en minimale data

Niet opslaan:

- gevoelige persoonskenmerken die niet nodig zijn voor leren;
- vrije psychologische classificaties;
- pseudowetenschappelijke learning-style labels;
- volledige chatinhoud wanneer een compacte evidence-samenvatting volstaat.

Wel toegestaan wanneer didactisch nodig:

- aangetoonde conceptbeheersing;
- expliciete misconcepties;
- toets-/diagnostisch bewijs;
- gekozen ondersteuning/tempo als expliciete voorkeur;
- routegeschiedenis en learner overrides.

## Retentievoorstel

Adaptief profiel en didactisch bewijs vallen functioneel onder leerprogressie. De bestaande EAW-retentiebaseline voor leerprogressie is daarom de logische bovengrens: bewaren tot 12 maanden na einde toegang, tenzij een latere privacyreview een kortere termijn voorschrijft.

Technische request-/securitylogs blijven een apart loggingregime en horen niet in deze tabellen.

Voor productie is nog een expliciete cleanup-job nodig die records verwijdert op basis van entitlement-einddatum + vastgestelde retentieperiode.

## SQL-migraties

Ontwerpbestanden:

- `supabase/migrations/20260831_adaptive_learning_v2_persistence.sql`
- `supabase/migrations/20260831_z_adaptive_learning_v2_atomic_transition.sql`

Deze bestanden zijn **niet op de productie-Supabase toegepast**.

## Applicatiecontract

- `lib/adaptive-store.ts` bevat de server-only repository/RPC-wrapper.
- `lib/adaptive-service.ts` resolveert sessie, user, course, entitlement en module via de bestaande learning-platformfuncties.
- Runtimeflows moeten `recordAdaptiveTransition()` gebruiken; losse profiel/evidence/decision-writes zijn low-level.

## Open gates vóór database-activatie

1. migraties uitvoeren op een echte Supabase development branch;
2. SQL/RLS/security tests op die branch;
3. testen dat anon/authenticated geen directe writes kunnen doen;
4. testen van verkeerde user/course/module/evidence combinaties;
5. transaction rollback test bij ongeldige evidence;
6. retentie- en privacyreview vastleggen;
7. service-role secret alleen in server-side Preview environment configureren;
8. pas daarna Module 6 preview verbinden met persistence;
9. production apply pas na aparte releasebeslissing.

## Huidige gate

**NO-GO voor productie.**

Het datamodel en repositorycontract zijn klaar voor een development-branch test. De productie-DB is bewust ongewijzigd gebleven.
