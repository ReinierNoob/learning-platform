# Adaptive Solution Architecture Module 6 — runtime E2E validation

**Datum:** 2026-08-31  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Status:** persistence/runtime E2E PASS; interactieve browsergate blijft OPEN  
**Productie gewijzigd:** nee

## Doel

Valideren dat de Module 6 runtime niet alleen compileert, maar de volledige adaptieve statecyclus betrouwbaar kan opslaan en teruglezen:

`diagnose → state restore → learner override → assessment → remediation → recheck → state restore`

## Testomgeving

Tijdelijke Supabase development branch:

- naam: `adaptive-learning-v2-runtime-e2e`;
- project ref: `xblzfoqbryibmabjhdyj`;
- zonder productiedata;
- alleen synthetische branch-only testuser, testcursus, entitlement, enrollment en module;
- goedgekeurde branchkosten: $0,01344/uur;
- branch wordt na afronding verwijderd.

Toegepaste migraties:

1. `20260831_adaptive_learning_v2_persistence.sql`;
2. `20260831_z_adaptive_learning_v2_atomic_transition.sql`;
3. `20260831_zz_adaptive_learning_v2_hardening.sql`;
4. `20260831_zzz_adaptive_learning_v2_event_ordering.sql`.

## Runtimeflow

De test voerde onder de daadwerkelijke Postgresrol `service_role` vier transitions uit.

### 1. Diagnose

- route: B;
- reason code: `DEMONSTRATED_WITH_CHECK`;
- vier diagnostische evidence-events;
- profiel na restore bevat route B.

### 2. Learner override

- cursist kiest bewust volledige basisroute A;
- één `learner_override` evidence-event;
- decision heeft `learner_override=true`;
- state restore levert route A.

### 3. Assessment en remediation

- drie assessment evidence-events;
- twee objectives aangetoond;
- `sa.m06.adr-beoordelen` wordt `needs_remediation`;
- decision: `ASSESSMENT_REMEDIATION`;
- alleen relevante herstelcontent wordt geselecteerd.

### 4. Recheck

- één nieuwe assessment evidence na remediation;
- `sa.m06.adr-beoordelen` wordt weer `demonstrated`;
- laatste decision: `REMEDIATION_RECHECK_PASS`.

Eindstand:

- evidence-events: **9**;
- adaptive decisions: **4**;
- eindmastery `sa.m06.adr-beoordelen`: **demonstrated**.

## Bevinding tijdens E2E — audit ordering

De eerste volledige E2E-run vond een echte fout in `adaptive_get_state()`.

`created_at` gebruikte `now()`. PostgreSQL behandelt `now()` als transaction-stable, waardoor meerdere transitions binnen één transactie exact dezelfde timestamp kregen. De statefunctie sorteerde alleen op `created_at`, zodat niet gegarandeerd was dat de laatste beslissing bovenaan stond.

Gevolg in de eerste run:

- alle 4 decisions waren opgeslagen;
- alle 9 evidence-events waren opgeslagen;
- de actuele mastery was correct;
- maar `recent_decisions[0]` kon een oudere reason code tonen.

### Fix

Nieuwe migratie `20260831_zzz_adaptive_learning_v2_event_ordering.sql`:

- voegt monotone `event_seq` identity toe aan `learning_evidence`;
- voegt monotone `event_seq` identity toe aan `adaptive_decisions`;
- state restore sorteert voortaan op `event_seq desc`;
- profile/sequence indexen ondersteunen deze read-path.

Nieuwe regressietest:

- `supabase/tests/adaptive_learning_v2_event_ordering_regression.sql`;
- schrijft twee decisions in dezelfde transactie;
- vereist dat de tweede decision altijd bovenaan staat;
- vereist dat `event_seq` strikt oploopt.

**Resultaat regressietest: PASS.**

Na de fix is de volledige vierstaps E2E-run opnieuw uitgevoerd.

**Resultaat: PASS.**

## Security/advisor review

Security advisor na de vierde migratie:

- geen nieuwe adaptive RLS-policy waarschuwingen;
- geen adaptive `SECURITY DEFINER` waarschuwingen;
- bestaande EAW-waarschuwingen buiten Adaptive Learning blijven aparte platformbacklog.

Performance advisor:

- geen nieuwe unindexed-foreign-key waarschuwingen voor de adaptive laag;
- diverse adaptive indexen worden op de vrijwel lege testbranch als `unused_index` gemeld; dit is verwacht en geen reden om de vereiste audit/FK-indexen te verwijderen.

## Vercel/browserstatus

De tijdelijke preview-only selftest route compileerde succesvol en Vercel rapporteerde de deployment als `READY`.

De verbonden Vercel fetch-tool bleef de beschermde preview echter via SSO redirecten, ook met een tijdelijke share-link. Daardoor kon de tool de GET-selftest niet daadwerkelijk doorlopen.

Dit wordt niet als applicatie-PASS gemarkeerd.

Daarom:

- Vercel build: **PASS**;
- runtime persistence + restore: **PASS**;
- database security/atomicity/order: **PASS**;
- interactieve browser/mobile/accessibility gate: **OPEN**.

## Retrospective

Belangrijkste generieke les:

> Auditvolgorde mag nooit alleen op een timestamp steunen wanneer meerdere events in één transactie of zeer korte tijd kunnen ontstaan.

Voor Adaptive Learning v2 geldt voortaan:

- iedere evidence- en decision-event krijgt een monotone volgorde-identiteit;
- state restoration gebruikt die volgorde als canonieke ordering;
- timestamps blijven metadata, niet de enige ordering-bron;
- iedere persistence-implementatie krijgt een same-transaction ordering regression test.

## Gate

| Gate | Status |
|---|---|
| Vier migraties op development branch | PASS |
| Diagnose persistence | PASS |
| State restore na diagnose | PASS |
| Learner override audit | PASS |
| Assessment → remediation persistence | PASS |
| Recheck → mastery herstel | PASS |
| 9 evidence / 4 decisions | PASS |
| Deterministische event ordering | PASS |
| Ordering regression test | PASS |
| Adaptive security advisor | PASS |
| Adaptive FK/index advisor | PASS |
| Vercel preview build | PASS |
| Interactieve browser/UX/accessibility test | OPEN |
| Productierelease | NO-GO |

De volgende inhoudelijke gate is een echte interactieve previewtest met browsertoegang, gevolgd door persona-/UX-/accessibilityreview. Daarna kan de runtime gecontroleerd naar de standaard `/leren`-flow worden gebracht.
