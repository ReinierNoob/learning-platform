# Adaptive Learning — Pre-scaling Architecture Decision Gate

**Datum:** 2026-08-31  
**Status:** BESLUIT A — van kracht  
**Scope:** Solution Architecture adaptive learning

## Einddoel

Een hoogwaardige, inhoudelijk correcte, foolproof, herbruikbare en veilig publiceerbare Solution Architecture-leerlijn met Modules 1–10 op één beheerste adaptive-learningarchitectuur.

## Besluit

**Generic server-side route factory is de single implementation voor adaptive HTTP/runtimegedrag.**

Moduledefinitions en server-side evaluators blijven eigenaar van vakinhoudelijke pedagogiek. Publieke API-paden blijven module-specifiek en backward compatible, maar hun routebestanden zijn uitsluitend dunne wrappers rond de factory.

## Solution Architecture Review

### Single source of truth
- `lib/adaptive-module-route-factory.ts`: generiek HTTP-, persistence-, restore-, override-, assessment- en progressgedrag.
- `AdaptiveServerModuleContract`: servercontract tussen generieke runtime en modulespecifieke pedagogiek.
- `solution-architecture-module-*-server.ts`: deterministische modulespecifieke diagnose/observatie/answer keys/remediation.
- `solution-architecture-module-*.ts`: client-veilige moduledefinition.

### Verantwoordelijkheden
- Factory: transport, production deny, auth/entitlement-context, persistence, state restore, platformprogress-sync, foutafhandeling.
- Runtimecontract: koppelt één moduledefinition en evaluator aan de factory.
- Modulecontent: doelen, misconcepties, interventies, visuals en assessmentvragen.
- Hostplatform: officiële course/moduleprogressie.

### Afhankelijkheden en data-/releaseflow
- API-routes hangen uitsluitend af van factory + runtimecontract.
- Runtimecontract hangt af van definition + server-evaluator.
- Persistence blijft preview-gated; productie blijft hard-denied.
- Geen nieuwe Supabase-mutatie is onderdeel van deze convergentie.

### Interfaces en backward compatibility
- Bestaande API-paden en HTTP-methoden blijven gelijk: `diagnose`, `observe`, `override`, `state`, `assess`.
- Responsecontract wordt door dezelfde factory geleverd als Modules 7–9.
- Modules 1–4 hergebruiken bestaande evaluatorfuncties ongewijzigd.
- Module 5 gebruikt een adapter rond de bestaande semantische runtime om een risicovolle contentrefactor binnen deze gate te vermijden.
- Module 6 heeft zijn bestaande route-local diagnoseclassificatie gedragbehoudend in een runtimecontract gekregen.

### Deployment en rollback
- Wijzigingen blijven op de bestaande featurebranch en PR #14 blijft draft.
- Geen merge of production flag in deze gate.
- Rollback is het terugzetten van de dunne wrappers naar de voorgaande route-implementaties; persistence-schema's veranderen niet.

### Dubbele configuratie / hardcoded versies
- Versies blijven modulespecifiek waar ze al bestonden; de factory consumeert ze via het runtimecontract.
- Nieuwe route-implementaties mogen geen lokale persistence/progresslogica bevatten.

### Race conditions / concurrerende writers
- Deze wijziging introduceert geen nieuwe writer. Alle routes gebruiken dezelfde bestaande persistence-/progressketen van de factory.

### Productie-impact
- Adaptive presentation en persistence blijven in productie hard-disabled.
- Geen productie-course row, prijs, launch path of websitebeschikbaarheid wordt gewijzigd.

## Verplichte pre-scaling regel

Voordat een volgende adaptive module mag worden toegevoegd, moet het server-side runtimecontract en het factory-routepatroon vaststaan. CI voert `verify:adaptive-routes` uit en faalt wanneer een module opnieuw route-local serverlogica introduceert.

## Root cause

Het generieke servercontract is pas expliciet vastgesteld nadat meerdere modules al met eigen routeboilerplate waren uitgebouwd. Daardoor ontstond structurele duplicatie. De structurele remedie is een architectuurbesluit vóór schaalvergroting plus een uitvoerbare CI-gate.
