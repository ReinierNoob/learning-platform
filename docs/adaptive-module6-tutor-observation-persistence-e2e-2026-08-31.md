# Adaptive Module 6 — tutor-observation persistence E2E

**Datum:** 31 augustus 2026  
**Omgeving:** tijdelijke Supabase development branch  
**Productie gewijzigd:** nee  
**Tijdelijke branch na afloop verwijderd:** ja

## Doel

Valideer de nieuwe `tutor_observation`-lus tegen dezelfde persistence-contracten als diagnose, assessment en remediation.

## Geteste keten

`strong → partial → needs_work → revised strong`

Per observation is via `adaptive_record_transition(...)` atomair vastgelegd:

- learner profile/state;
- één `learning_evidence` event van type `tutor_observation`;
- één `adaptive_decision`.

## Resultaten

- tutor-observation evidence-events: **4**;
- adaptive decisions: **4**;
- levels in event-volgorde: **strong → partial → needs_work → strong**;
- nieuwste state restore: **strong**;
- laatste reason code: `TUTOR_OBSERVATION_STRONG`;
- monotone decision ordering via `event_seq`: **PASS**;
- entitlement denial zonder actieve enrollment: **PASS**;
- atomic rollback bij ongeldige decision: **PASS**;
- browserrole `authenticated` kan `adaptive_record_transition` niet uitvoeren: **PASS**;
- browserrole `authenticated` kan `adaptive_get_state` niet uitvoeren: **PASS**;
- `service_role` kan transition wel uitvoeren: **PASS**;
- adaptive `SECURITY DEFINER` count: **0**;
- expliciete browser deny-policies: **3**.

## Privacycheck

De tutor-observation persistence bevat alleen afgeleide gegevens:

- `level`;
- `canProceed`;
- `indicators`;
- objective/source/version metadata.

Controles:

- kolommen voor raw/free-text antwoord: **0**;
- evidence payloads met `answer`, `raw_answer`, `response_text`, `raw_text` of `free_text`: **0**.

De vrije cursistredenering is daarmee geen onderdeel van de learner-evidence persistence.

## Advisors

### Adaptive security

Geen nieuwe adaptive security-lints. De branch bevat wel bestaande waarschuwingen op oudere EAW-functies en tabellen buiten deze pilot.

### Adaptive foreign keys

Na herstel van de reeds in PR #14 aanwezige `learning_evidence_objective_idx` zijn er **geen adaptive unindexed-foreign-key findings**.

`unused_index` op de verse testbranch is niet als blocker geclassificeerd; een nieuwe branch heeft onvoldoende workload om indexgebruik betrouwbaar te beoordelen.

## Retrospective

### Behouden

- service-role-only persistence;
- SECURITY INVOKER;
- atomic transition;
- append-only evidence/decisions;
- monotone `event_seq`;
- raw vrije tekst niet standaard persistent maken.

### Aanscherpen

Iedere nieuwe evidence-type uitbreiding krijgt voortaan een expliciete privacy-contracttest op verboden raw-text velden/keys.

### Nieuw referentiepatroon

`prompt → deterministic observation → derived evidence → adaptive decision → feedback/revise/continue`

## Gatebesluit

**Tutor-observation persistence E2E: PASS.**

Nog open vóór productie:

- live browser/mobile review;
- echte keyboard/screenreader-validatie;
- integratie in standaard `/leren`;
- definitieve Eva/Alexander-media;
- expliciete productiereleasebeslissing.

**Productie: NO-GO.**
