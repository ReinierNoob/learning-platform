# Retrospective — Adaptive Module 5 runtime

**Datum:** 31 augustus 2026

## Wat werkte goed
- `AdaptiveModuleDefinition` bleek geschikt om flow, routes, interventions en assessment client-safe te configureren.
- De server-only evaluator voorkomt dat answer keys of classifierdetails naar de browser lekken.
- Dezelfde `/leren` hostroute kan Module 5 en 6 onafhankelijk activeren via afzonderlijke featureflags.
- De progressive architecture canvas laat zien dat module-specifieke visuals als plugin kunnen blijven bestaan.
- Build + route-table maakten snel zichtbaar of nieuwe runtimecontracten echt door Next.js werden opgenomen.

## Wat ging minder goed
- De eerste generieke client had een async-fout in een state updater; build caught it direct.
- De eerste versie van de generieke engine miste state restore en targeted remediation. Dat zijn geen modulespecifieke details maar engineverantwoordelijkheden.
- Een volledig generieke evaluator in één client-safe definitie zou security en didactiek vermengen. Daarom blijft evaluator/rubric server-only en modulespecifiek.

## Besluiten
1. `AdaptiveModuleDefinition` blijft client-safe en bevat geen correcte antwoorden.
2. Iedere module krijgt een server-only runtime/evaluator naast de client-safe definition.
3. Generic engine bevat flowgedrag: restore, route override, observation loop, remediation, assessment shell.
4. Moduleconfig bevat inhoud; visualisatie blijft een moduleplugin.
5. Iedere nieuwe module krijgt een eigen previewflag totdat multi-module rollout voldoende bewezen is.
6. Geen productie- of platformprogress-koppeling voordat de definitieve course/module/quizconfig bestaat.

## Nieuwe pipeline-regel
`source → freshness review → client-safe definition → server-only evaluator → visual plugin → generic engine → build/route-table → review → retrospective`

## Gate
Retrospective verwerkt: **PASS**.
