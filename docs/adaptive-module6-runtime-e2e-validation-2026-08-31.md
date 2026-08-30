# Adaptive Solution Architecture Module 6 — runtime E2E validation

**Datum:** 2026-08-31  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Status:** persistence/runtime E2E PASS; interactieve browsergate blijft OPEN  
**Productie gewijzigd:** nee  
**Tijdelijke testbranch verwijderd:** ja

## Doel

Valideren dat de Module 6 runtime de volledige adaptieve statecyclus betrouwbaar kan opslaan en teruglezen:

`diagnose → state restore → learner override → assessment → remediation → recheck → state restore`

## Testomgeving

Tijdelijke Supabase development branch `adaptive-learning-v2-runtime-e2e` (`xblzfoqbryibmabjhdyj`), zonder productiedata en uitsluitend met een synthetische branch-only testuser, testcursus, entitlement, enrollment en module.

De expliciet goedgekeurde branchprijs was **$0,01344/uur**. De branch is na de tests verwijderd; deze kosten lopen niet verder door.

Toegepaste migraties:

1. `20260831_adaptive_learning_v2_persistence.sql`;
2. `20260831_z_adaptive_learning_v2_atomic_transition.sql`;
3. `20260831_zz_adaptive_learning_v2_hardening.sql`;
4. `20260831_zzz_adaptive_learning_v2_event_ordering.sql`.

## Runtimeflow — resultaat

De test voerde onder de daadwerkelijke Postgresrol `service_role` vier transitions uit.

1. **Diagnose** — route B, reason `DEMONSTRATED_WITH_CHECK`, vier diagnostic evidence-events, state restore geeft route B.
2. **Learner override** — cursist kiest volledige route A, `learner_override=true`, state restore geeft route A.
3. **Assessment/remediation** — drie assessment-events; `sa.m06.adr-beoordelen` wordt `needs_remediation`; decision `ASSESSMENT_REMEDIATION`.
4. **Recheck** — één nieuw assessment-event; objective wordt weer `demonstrated`; laatste decision `REMEDIATION_RECHECK_PASS`.

Eindstand:

- evidence-events: **9**;
- adaptive decisions: **4**;
- eindmastery `sa.m06.adr-beoordelen`: **demonstrated**.

## Gevonden fout — audit ordering

De eerste volledige E2E-run vond een echte fout in `adaptive_get_state()`.

`created_at` gebruikte `now()`. PostgreSQL behandelt `now()` als transaction-stable, waardoor meerdere transitions binnen één transactie dezelfde timestamp konden krijgen. De statefunctie sorteerde alleen op `created_at`, waardoor niet gegarandeerd was dat de laatste beslissing bovenaan stond.

### Fix

Migratie `20260831_zzz_adaptive_learning_v2_event_ordering.sql`:

- monotone `event_seq` identity voor `learning_evidence`;
- monotone `event_seq` identity voor `adaptive_decisions`;
- state restore sorteert op `event_seq desc`;
- ondersteunende profile/sequence-indexen.

Regressietest `supabase/tests/adaptive_learning_v2_event_ordering_regression.sql` schrijft twee decisions in dezelfde transactie en vereist dat de tweede decision altijd als nieuwste terugkomt en dat `event_seq` strikt oploopt.

**Regressietest: PASS.**  
**Volledige vierstaps E2E na fix: PASS.**

## Security/advisor review

Security advisor na de vierde migratie:

- geen adaptive RLS-policy waarschuwingen;
- geen adaptive `SECURITY DEFINER` waarschuwingen;
- resterende warnings horen bij bestaande EAW-platformfuncties buiten deze pilot.

Performance advisor:

- geen unindexed-foreign-key waarschuwingen voor de adaptive laag;
- adaptive indexen kunnen op deze vrijwel lege testbranch als `unused_index` verschijnen; dat is verwacht.

Supabase-remediatiereferenties:

- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

## Vercel/browserstatus

De tijdelijke preview-only selftest route compileerde en Vercel rapporteerde de deployment als `READY`. De verbonden Vercel fetch-tool bleef de beschermde preview via SSO redirecten, ook met een share-link. Daarom is de interactieve browsergate **niet** kunstmatig als geslaagd gemarkeerd.

De tijdelijke selftest-route met branchspecifieke publieke anon-key is na de test weer uit GitHub verwijderd.

## Retrospective

Generieke les:

> Auditvolgorde mag nooit alleen op een timestamp steunen wanneer meerdere events in één transactie of zeer korte tijd kunnen ontstaan.

Adaptive Learning v2 vereist voortaan:

- monotone event-ordering voor evidence en decisions;
- state restoration op die canonieke volgorde;
- timestamps uitsluitend als metadata, niet als enige ordering-bron;
- een same-transaction ordering regression test bij iedere persistence-implementatie.

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
| Tijdelijke testcode/branch cleanup | PASS |
| Interactieve browser/UX/accessibility test | OPEN |
| Productierelease | NO-GO |

Volgende inhoudelijke gate: echte interactieve previewtest met browsertoegang, gevolgd door persona-, UX/UI- en accessibilityreview. Daarna kan de runtime gecontroleerd naar de standaard `/leren`-flow worden gebracht.
