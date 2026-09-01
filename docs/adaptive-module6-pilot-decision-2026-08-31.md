# Adaptive Solution Architecture — pilotbesluit na Module 6

**Datum:** 31 augustus 2026  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Productie gewijzigd:** nee

## Besluit

**GO voor gecontroleerde uitbreiding van Adaptive Learning naar de overige Solution Architecture-modules.**

Dit is nadrukkelijk geen besluit om Module 6 negen keer te kopiëren. De pilot bewijst het generieke patroon; iedere volgende module krijgt een leerdoel-specifieke diagnostiek, interventievorm en assessment.

## Waarom GO

Module 6 heeft aantoonbaar bewezen:

- één-vraag-per-beurt diagnostiek;
- route A/B/C op basis van evidence en misconcepties;
- learner override zonder verplichte leerdoelen te omzeilen;
- tutor-observation met strong/partial/needs_work;
- targeted remediation en recheck;
- persistence gekoppeld aan bestaande enrollment;
- append-only evidence en decisions;
- atomische transitions en deterministische event ordering;
- auth/entitlement vóór adaptiviteit;
- integratie in de standaard `/leren`-architectuur;
- centrale platformprogress als eigenaar van completion;
- learner-facing UX gescheiden van QA/debugdata;
- expliciete didactische rolverdeling Eva/Alexander;
- media alleen waar didactisch relevant.

## Wat de pilot niet bewijst

Nog steeds aparte releasechecks:

- fysieke browser/touch/screenreader-validatie;
- definitieve Solution Architecture course-config en progress-E2E;
- productieretentie/cleanup;
- commerciële velden;
- uiteindelijke productierelease.

Deze open punten blokkeren **productie**, maar niet het gecontroleerd ontwikkelen van de overige modules op de featurebranch.

## Schaalregels

1. Geen vaste vier intakevragen per module als het leerdoel iets anders vraagt.
2. Geen vaste drievragen-eindcheck als een ander assessmenttype passender is.
3. Iedere module definieert eigen misconceptions en evidencecontracten.
4. Verplichte objectives worden nooit volledig overgeslagen.
5. Eva blijft interviewer/challenger; Alexander blijft tutor/explainer; formele beoordeling blijft systeemfunctie.
6. Geen raw vrije cursisttekst standaard persistent maken.
7. Nieuwe of veranderlijke vakstandaarden worden vóór contentontwikkeling geverifieerd.
8. Oefenregels worden niet als universele industriestandaard gepresenteerd.
9. Mobile information order wordt per module ontworpen, niet achteraf gerepareerd.
10. Iedere module doorloopt review + UX/UI-review + retrospective.

## Eerste vervolgmodule

**Module 5 — Modelleren en visualiseren.**

Reden:

- het bronontwerp bevat een expliciet open verificatiepunt over de ArchiMate-versie;
- ArchiMate 4 is in april 2026 gepubliceerd en verandert relevante taal- en modelleringsconcepten;
- Module 5 is daarom een goede test of de pipeline ook een inhoudelijk veranderde standaard kan verwerken in plaats van alleen adaptiviteit toe te voegen.

## Gate

**Adaptive pilot architecture: GO voor gecontroleerde rollout.**  
**Productierelease: NO-GO.**
