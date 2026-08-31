# Retrospective — eerste adaptive rollout na Module 6

**Datum:** 31 augustus 2026  
**Referentiemodule:** Module 5 — Modelleren en visualiseren

## Wat werkte

1. Eerst een expliciet pilotbesluit nemen voorkwam dat Module 6 stilzwijgend de template voor alle modules werd.
2. De bronleerlijn bleef de basis voor leerdoelen, structuur en toetsniveau.
3. Veranderlijke standaarden zijn vóór uitwerking opnieuw geverifieerd.
4. ArchiMate 4 is inhoudelijk verwerkt in plaats van alleen het versienummer te vervangen.
5. De actuele C4-documentatie bevestigde de bronkern maar leverde een nuttige verdieping op met System Landscape.
6. Een generiek `AdaptiveModuleDefinition` contract maakt modulecontent configureerbaar zonder nu al een tweede runtime te bouwen.
7. Vercel-builds bleven groen na de generieke contract- en Module 5-configtoevoeging.

## Wat niet gekopieerd mag worden uit Module 6

- exact vier open diagnostische vragen;
- dezelfde A/B/C-stappen;
- dezelfde visuele matrix;
- dezelfde tutor-observation rubrics;
- drie vaste assessmentvragen;
- dezelfde mediapunten.

A/B/C mag als routepatroon generiek blijven, maar de bewijs- en interventielogica is modulespecifiek.

## Nieuwe pipeline-regel — source-preserving freshness review

Wanneer een bronbestand leerdoelen of content bevat die aan een veranderlijke standaard hangt:

1. markeer wat letterlijk uit de bron komt;
2. verifieer alleen de veranderlijke standaard extern;
3. behoud bronleerdoelen en scope tenzij er een aantoonbare inhoudelijke fout is;
4. label externe verdieping expliciet als uitbreiding;
5. corrigeer bronfouten transparant;
6. maak geen nieuwe verplichte mastery-eis alleen omdat een actuele standaard meer mogelijkheden biedt;
7. versieer de gebruikte standaard in de moduledefinition.

## Nieuwe pipeline-regel — generic engine, specific pedagogy

Generiek:

- identity/access/persistence;
- learner-model statuscontract;
- route/audit contract;
- intervention envelope;
- assessment-security contract;
- platformprogress;
- media policy fields.

Modulespecifiek:

- diagnostics;
- objectives;
- misconceptions;
- evidence rubrics;
- intervention sequence;
- visual task;
- assessmentvorm;
- tutorvragen;
- media-selectie.

## Gatebesluit

**Pilot rollout pattern: PASS.**  
**Volgende stap:** Module 5-runtime generiek maken op basis van `AdaptiveModuleDefinition`, zonder Module 6 te dupliceren.  
**Productie:** NO-GO.
