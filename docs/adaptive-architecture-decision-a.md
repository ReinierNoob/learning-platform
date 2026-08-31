# EAW Adaptive Learning — Architecture Decision A

**Status:** ACCEPTED  
**Datum:** 2026-08-31  
**Scope:** Solution Architecture adaptive learning, Modules 1–10 en volgende modules op hetzelfde patroon

## Besluit

De **generic server-side route factory** is de enige implementatie voor de generieke adaptive API-keten:

- diagnose request/response lifecycle;
- tutor observation lifecycle;
- learner override;
- module-scoped state restore;
- assessment orchestration;
- adaptive persistence;
- standaard EAW platformprogress-sync;
- production hard deny.

Modulespecifieke code blijft eigenaar van:

- `AdaptiveModuleDefinition`;
- diagnose/evaluatorlogica;
- misconceptiondetectie;
- tutor-rubrics;
- answer key en remediationmapping;
- inhoud en visuals.

Publieke API-paden blijven stabiel. Bestaande responsecontracten worden bij migratie gedragbehoudend gehouden; een legacy response-adapter mag uitsluitend de JSON-presentatie aanpassen en mag geen auth-, persistence-, routing- of progresslogica dupliceren.

## Single source of truth

| Concern | Eigenaar |
|---|---|
| API lifecycle / persistence / restore / progress | `lib/adaptive-module-route-factory.ts` |
| Platformprogress contract | `lib/adaptive-platform-progress.ts` |
| Client navigation / focus / anti-lockout / remediation | `components/adaptive/config-driven/AdaptiveModuleExperience.tsx` |
| Vakinhoud | moduledefinition + module server evaluator/runtimecontract |
| Officiële course progress | EAW hostplatform |

## Pre-scaling architecture decision gate

**Vóór het toevoegen van een volgende adaptive module moet deze architectuurkeuze nog geldig zijn.**

De CI-gate moet daarom minimaal bewijzen dat:

1. iedere aangetroffen adaptive Solution Architecture module een `AdaptiveServerModuleContract` heeft;
2. alle vijf endpoints via de factory lopen;
3. endpointbestanden geen persistence/auth/state-logica dupliceren;
4. anti-lockout in de generieke client aanwezig blijft;
5. platformprogress fail-closed valideert vóór de eerste write;
6. contract-/behavior-regressies en production hard deny groen zijn.

Als een volgende module een afwijkende serverruntime nodig lijkt te hebben, is dat **geen lokale implementatiekeuze**. Eerst volgt een Solution Architecture Review en een expliciete wijziging of vervanging van dit besluit.

## Deployment / rollback

- Geen production enablement via deze beslissing.
- Featurebranch/preview blijft de implementatiezone.
- PR blijft ongemerged totdat releasegates zijn gesloten.
- Rollback van de factorymigratie kan op Git-commitniveau zonder productiedata terug te draaien, omdat deze migratie geen productie-Supabase-mutaties uitvoert.

## Root cause die dit besluit adresseert

Bij Modules 1–6 ontstond endpointboilerplate voordat de server-side schaalarchitectuur formeel was vastgelegd. Daardoor werd de structurele keuze te laat genomen en ontstond duplicatie. Deze pre-scaling gate voorkomt dat een volgende module opnieuw vóór een expliciete architectuurbeslissing wordt opgeschaald.
