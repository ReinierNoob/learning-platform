# Adaptive Learning v2 — Supabase persistence validation

**Datum:** 2026-08-31  
**Doelomgeving:** tijdelijke Supabase development branch  
**Branchnaam:** `adaptive-learning-v2-persistence-test`  
**Project ref:** `bcirrkofoycbuyalqlvk`  
**Productie gewijzigd:** nee  
**Testbranch na validatie verwijderd:** ja

## Uitgevoerde migraties

1. `20260831_adaptive_learning_v2_persistence.sql`
2. `20260831_z_adaptive_learning_v2_atomic_transition.sql`
3. `20260831_zz_adaptive_learning_v2_hardening.sql`

Alle drie zijn succesvol toegepast op de geïsoleerde development branch.

## Schema/security checks

PASS:

- `adaptive_learner_profiles` bestaat;
- `learning_evidence` bestaat;
- `adaptive_decisions` bestaat;
- RLS is op alle drie tabellen actief;
- drie expliciete browser deny-all policies bestaan;
- `anon` en `authenticated` hebben geen directe INSERT-rechten;
- `authenticated` heeft geen EXECUTE op `adaptive_record_transition(...)`;
- `service_role` heeft wel EXECUTE;
- alle zes adaptive functies/helpers zijn `SECURITY INVOKER`;
- acht benodigde adaptive foreign-key-indexen bestaan.

Eindmeting:

- adaptive function count: **6**;
- SECURITY DEFINER count binnen adaptive laag: **0**;
- browser deny-policy count: **3**;
- adaptive index count: **8**;
- authenticated transition execute: **false**;
- service-role transition execute: **true**.

## Gedragstests

### Entitlement gate

Een willekeurige user zonder actieve entitlement/enrollment werd door `adaptive_upsert_profile(...)` geweigerd met SQLSTATE `42501`.

**Resultaat: PASS.**

### Geldige transition

Een branch-only testuser met actieve entitlement, enrollment en gepubliceerde Module 6 kon één transition opslaan.

De transition leverde één profile id, één evidence id en één decision id op. `adaptive_get_state(...)` retourneerde daarna dezelfde enrollment en de verwachte route B/mastery state.

**Resultaat: PASS.**

### Atomic rollback

De test liet eerst geldige evidence invoeren en forceerde daarna een ongeldige `action` in de decision. Daardoor ontstond een check-constraint failure nadat de transition al met profiel/evidence was begonnen.

Na het afvangen van de fout zijn gecontroleerd:

- evidence count ongewijzigd;
- decision count ongewijzigd;
- profile `route_state` ongewijzigd.

**Resultaat: PASS.**

Hiermee is aangetoond dat `adaptive_record_transition(...)` geen half opgeslagen adaptieve overgang achterlaat.

### Volledige write-path als `service_role`

Na de hardening naar `SECURITY INVOKER` is een volledige `adaptive_record_transition(...)` uitgevoerd onder de daadwerkelijke Postgresrol `service_role`, binnen een rollbacktransactie.

De call leverde succesvol een profile id, evidence id en decision id op. Daarna is de transactie teruggedraaid, zodat deze laatste verificatie geen blijvende testdata achterliet.

**Resultaat: PASS.**

Hiermee is bevestigd dat de productiebedoelde serverrol ook na het verwijderen van `SECURITY DEFINER` de volledige persistenceketen kan uitvoeren.

## Supabase advisors

### Security

Na hardening zijn er **geen advisor-meldingen voor de nieuwe adaptive tabellen of adaptive RPC's**.

Er bestaan nog security-advisor meldingen op reeds bestaande EAW-functies/tabellen buiten deze pilot, waaronder diverse bestaande `SECURITY DEFINER` RPC's die door `authenticated` uitgevoerd kunnen worden. Deze zijn niet door Adaptive Learning v2 geïntroduceerd en moeten als aparte platform-security backlog worden beoordeeld.

Referentie: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

### Performance

Na hardening zijn er **geen unindexed-foreign-key meldingen meer voor de adaptive tabellen**.

De advisor noemt de nieuwe indexen voorlopig als `unused_index`; dat is normaal in een verse, vrijwel lege testbranch en is geen reden om de vereiste foreign-key-indexen te verwijderen.

Referentie: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

## Branching-observatie

De Supabase branchlijst rapporteerde `MIGRATIONS_FAILED` als branchstatus, terwijl de previewdatabase zelf `ACTIVE_HEALTHY` was en handmatig uitgevoerde adaptive migraties/tests succesvol waren. Ook bestaande branches/main vertoonden dezelfde statusmelding.

Daarom is dit **niet als fout van de adaptive migraties geclassificeerd**, maar als een aparte EAW/Supabase branching-housekeeping observatie. Automatische branch-migrationstatus moet worden opgeschoond voordat deze als harde CI-gate wordt gebruikt.

## Kostenbeheersing

De tijdelijke development branch is na afronding van alle migratie-, security-, advisor- en gedragstests verwijderd. Daarmee loopt de expliciet goedgekeurde branchkost van **$0,01344 per uur** voor deze testbranch niet verder door.

Andere reeds bestaande Supabase development branches zijn niet gewijzigd of verwijderd.

## Gate

**Database persistence design:** PASS  
**Development-branch migration:** PASS  
**Entitlement enforcement:** PASS  
**Atomicity:** PASS  
**Service-role write path:** PASS  
**Adaptive advisor findings:** PASS  
**Testbranch cleanup:** PASS  
**Production release:** NO-GO

Volgende stap is end-to-end integratie van de Module 6-preview met de persistence-service in een niet-productieomgeving, gevolgd door browser/persona/accessibilityreview. Productie blijft tot die gates ongewijzigd.
