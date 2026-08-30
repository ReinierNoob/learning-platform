# EAW Adaptive Learning v2 — persistence design

**Datum:** 2026-08-31  
**Status:** branch-validated technical baseline; not applied to production  
**Branch:** `feature/adaptive-solution-architecture-module-6`

## Doel

De Module 6-pilot voorbereiden op persistente adaptatie zonder een parallel auth-, entitlement- of progressiesysteem te introduceren.

## Aansluiting op bestaande EAW-architectuur

Bestaand en hergebruikt:

- `courses` als cursusidentiteit;
- `entitlements` als commerciële toegangsbron;
- `enrollments` als unieke gebruiker/cursus-inschrijving;
- `course_modules` als gepubliceerde module-identiteit;
- het bestaande learning-access/entitlement patroon als autorisatiebasis;
- de bestaande OAuth/PKCE-sessie in `lib/platform.ts`.

Een adaptive learner profile is daarom 1-op-1 gekoppeld aan een `enrollment`, niet aan een los nieuw gebruikersbegrip.

## Datamodel

### `adaptive_learner_profiles`

Eén record per enrollment/gebruiker/cursus met schema- en classifier-versie, `concept_mastery`, `misconception_signals`, `route_state`, expliciete learner preferences en created/updated timestamps.

### `learning_evidence`

Append-only didactisch bewijs met objective id, evidence type, bronreferentie, resultaat als JSON, evidence strength 0..1, classifier version en module/course/enrollment/profile-context.

### `adaptive_decisions`

Append-only audittrail met action/route id, geselecteerde content ids, evidence ids, reason code/rationale, orchestrator version en learner-override indicator.

## Schrijfbeveiliging

Browserrollen `anon` en `authenticated` krijgen geen directe CRUD-grants op de drie tabellen. Daarnaast bestaan expliciete deny-all RLS-policies voor deze browserrollen.

De learning server gebruikt een afzonderlijke, server-only `EAW_SUPABASE_SERVICE_ROLE_KEY`. Voor ieder request valideert de applicatie eerst:

1. geldige EAW learning sessie;
2. bestaande cursus;
3. actieve entitlement;
4. bestaande enrollment;
5. gepubliceerde module binnen die cursus.

Daarna controleert de database opnieuw dat `user_id`, `course_id`, enrollment en entitlement bij elkaar horen.

De service-role key mag nooit als `NEXT_PUBLIC_*` worden geconfigureerd.

### Security invoker

Na de development-branch review zijn de adaptive RPC's en helper expliciet naar `SECURITY INVOKER` gehardend. Omdat alleen `service_role` de mutation-RPC's mag uitvoeren, is privilege-escalatie via `SECURITY DEFINER` niet nodig.

`service_role` heeft uitsluitend voor de adaptive helper `USAGE` op schema `private` plus `EXECUTE` op `private.adaptive_active_enrollment(...)` nodig.

## Atomiciteit

De voorkeursoperatie is `adaptive_record_transition(...)`.

Eén adaptieve transitie schrijft in één Postgres-transactie:

1. learner-profile update;
2. nul of meer evidence records;
3. één adaptive decision met verwijzing naar de zojuist gemaakte evidence ids.

Een fout in een van deze stappen rolt de gehele transitie terug. Dit is op de development branch getest door eerst geldige evidence te laten invoegen en vervolgens de decision bewust op een check constraint te laten falen. Zowel evidence-count als profile route state bleven ongewijzigd.

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

Technische request-/securitylogs blijven een apart loggingregime en horen niet in deze tabellen. Voor productie is nog een cleanup-job nodig die records verwijdert op basis van entitlement-einddatum + vastgestelde retentieperiode.

## SQL-migraties

Geteste bestanden:

- `supabase/migrations/20260831_adaptive_learning_v2_persistence.sql`
- `supabase/migrations/20260831_z_adaptive_learning_v2_atomic_transition.sql`
- `supabase/migrations/20260831_zz_adaptive_learning_v2_hardening.sql`

Tests:

- `supabase/tests/adaptive_learning_v2_schema_checks.sql`
- `supabase/tests/adaptive_learning_v2_behavior_checks.sql`

Deze migraties zijn getest op de tijdelijke Supabase development branch `adaptive-learning-v2-persistence-test` (`bcirrkofoycbuyalqlvk`) en **niet op productie**.

## Branchvalidatie — 2026-08-31

PASS:

- alle drie adaptive tabellen aanwezig;
- RLS ingeschakeld;
- expliciete browser deny-policies aanwezig;
- `anon` en `authenticated` hebben geen directe adaptive INSERT-rechten;
- `authenticated` mag `adaptive_record_transition(...)` niet uitvoeren;
- `service_role` kan de adaptive RPC's uitvoeren;
- adaptive functies draaien als `SECURITY INVOKER`;
- geldige entitlement/enrollment wordt geaccepteerd;
- ontbrekende entitlement wordt geweigerd;
- één geldige transition schrijft profiel + evidence + decision;
- `adaptive_get_state(...)` retourneert de opgeslagen state;
- geforceerde fout in de decision rolt eerdere evidence/profile-updates terug;
- Supabase security advisor bevat na hardening geen meldingen meer voor de drie adaptive tabellen of adaptive RPC's;
- Supabase performance advisor rapporteert geen ontbrekende foreign-key-indexen meer voor de adaptive tabellen.

De advisor bevat nog bestaande meldingen voor andere EAW-tabellen/functies; die zijn niet door deze pilot geïntroduceerd en vallen buiten deze migratie.

## Applicatiecontract

- `lib/adaptive-store.ts` bevat de server-only repository/RPC-wrapper.
- `lib/adaptive-service.ts` resolveert sessie, user, course, entitlement en module via de bestaande learning-platformfuncties.
- Runtimeflows moeten `recordAdaptiveTransition()` gebruiken; losse profiel/evidence/decision-writes zijn low-level.

## Open gates vóór productie

1. Module 6-preview verbinden met de persistence-service in een niet-productieomgeving;
2. end-to-end browser/persona/accessibilitytest met persistence;
3. evidence-strength regels inhoudelijk kalibreren;
4. retentie/privacybesluit formaliseren en cleanup-job implementeren;
5. service-role secret uitsluitend server-side configureren;
6. standaard `/leren` renderer integreren;
7. geselecteerde Eva/Alexander-media pas na UX-go produceren;
8. production apply uitsluitend via aparte releasebeslissing.

## Huidige gate

**PASS voor database-ontwerp en development-branch validatie.**  
**NO-GO voor productie-integratie/release.**
