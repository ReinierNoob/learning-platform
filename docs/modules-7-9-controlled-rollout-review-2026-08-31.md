# Modules 7–9 Controlled Rollout — Gate Review

**Datum:** 2026-08-31  
**Scope:** factoryconvergentie Modules 1–9 als remediation binnen de open Modules 7–9 gate.

## Doelcheck vóór de stap

Oorspronkelijk einddoel: een hoogwaardige, inhoudelijk correcte, foolproof, herbruikbare en veilig publiceerbare EAW e-learning Solution Architecture – Ontwerppraktijk met Modules 1–10 op één beheerste adaptive-learningarchitectuur.

Deze stap draagt daar rechtstreeks aan bij doordat Modules 1–9 vóór verdere schaal één server-side runtimepatroon krijgen. Module 10 start pas na sluiting van deze gate.

## Uitvoering

- Architectuurbesluit A formeel vastgelegd: generic server-side route factory is single implementation.
- Runtimecontracten toegevoegd voor Modules 1–6.
- Alle 30 routes van Modules 1–6 gedragbehoudend omgezet naar dunne factorywrappers.
- Modules 7–9 gebruikten de factory al; daarmee zijn Modules 1–9 geconvergeerd.
- Executable CI-gate toegevoegd die 9 runtimecontracten en 45 factory-endpoints controleert.
- HTTP-contractsuite toegevoegd voor diagnose, state restore in persistence-disabled mode, learner override, invalid override, observe-errorcontract, assessment/remediation en platformprogress-not-requested.
- Production hard-deny wordt voor alle 45 endpoints als afzonderlijke runtimecheck uitgevoerd.
- Bestaande undeclared dependency `react-markdown` expliciet gedeclareerd nadat een schone install deze fout zichtbaar maakte.
- Next.js op de bestaande 16.1.6-baseline gepind om ongecontroleerde minor-drift zonder lockfile te voorkomen.

## Technische validatie

De laatste geldige head moet groen zijn op:

1. `npm run verify:adaptive-routes`;
2. Next.js production build / TypeScript;
3. lokale HTTP-contractsuite voor Modules 1–9;
4. lokale production hard-deny suite;
5. Vercel preview deployment `READY`.

Een eerdere Vercel-build werd terecht `ERROR` door de undeclared `react-markdown` dependency. Dit was een bestaande latente fout die door de dependencycache was gemaskeerd. Na declaratie en versiehardening bouwde de opvolgende preview weer `READY`. De finale gate gebruikt uitsluitend bewijs van de uiteindelijke head.

## Retrospective

### Wat was het doel?

Modules 1–9 naar één generieke serverruntime brengen zonder pedagogisch gedrag te wijzigen en daarmee de open Modules 7–9 gate sluitbaar maken.

### Wat is daadwerkelijk gedaan?

De duplicerende route-implementaties van Modules 1–6 zijn vervangen door runtimecontracten en factorywrappers. CI bevat nu zowel structurele convergentiechecks als uitvoerbare HTTP-contracttests.

### Is het doel bereikt?

Functioneel en architectonisch: ja, onder voorbehoud van een volledig groene finale retest op de uiteindelijke head.

### Waar is afgeweken?

Tijdens de retest kwam een reeds bestaande undeclared `react-markdown` dependency aan het licht. Die lag buiten de factorywijziging, maar blokkeerde een reproduceerbare schone build en moest daarom binnen de gate worden geremedieerd.

### Welke onnodige complexiteit is geïntroduceerd?

Module 5 behoudt voorlopig zijn historische semantische `*-runtime.ts` en heeft daarnaast een `*-factory-runtime.ts` adapter. Dit is bewust minder risicovol dan tijdens deze gedragbehoudende migratie de semantische file te hernoemen. Het is onderhoudbare, lokale technische schuld en geen parallel runtime-/persistencemodel.

### Root cause

Het generieke server-side contract is te laat, pas na schaalvergroting naar meerdere modules, als expliciet architectuurbesluit genomen. Daardoor ontstond routeboilerplate per module. Een tweede latente root cause was ontbreken van een reproduceerbare dependencygrens: een cache kon een undeclared import maskeren.

### Structurele verbeteringen

- Pre-scaling architecture decision gate vóór toevoeging van een volgende adaptive module.
- CI faalt op route-local serverlogica en ontbrekende runtimecontracten.
- HTTP-contractsuite draait na iedere production build.
- Kritieke frameworkbaseline is gepind; een lockfile blijft een kandidaat voor latere repository-brede dependency-hardening als die gecontroleerd kan worden gegenereerd en gereviewd.

### Kortste route naar het einddoel?

Ja. Eerst convergentie en bewijs, daarna pas Module 10; geen parallelle runtime en geen contentrewrite tijdens remediation.

## Foolproof UX/UI Review

`NO_DIRECT_UI_CHANGE`

- Begrijpelijkheid: learner-facing route- en foutteksten blijven door de generieke client bepaald; geen nieuwe terminologie.
- Foutgevoeligheid: daalt doordat alle modules dezelfde HTTP-/restore-/override-/assessmentketen gebruiken.
- Informatiepresentation: geen wijziging.
- Toekomstige UI: Module 10 kan op hetzelfde contract aansluiten zonder nieuwe technische varianten zichtbaar te maken.
- Complexiteitslek naar gebruiker: verkleind; servervarianten kunnen niet meer per module verschillend falen door lokale boilerplate.
- Anti-lockout blijft generiek: na twee niet-doorgaande deterministische tutorobservaties mag de learner door; mastery blijft via de verplichte eindcheck bewaakt.

## Architecture Product Review

### Businessarchitectuur
De leerlijn blijft gericht op het ontwikkelen van het vermogen van een beginnende solution architect om van businessvraag naar verantwoord ontwerp en migratie te komen. Geen capability-/rolgrens is door de technische migratie gewijzigd.

### Solutionarchitectuur
Single implementation voor generiek servergedrag; modulespecifieke pedagogiek blijft via contractinjectie gescheiden. Geen nieuwe production writer, persistencevariant of progressmodel.

### Informatie-/datarelaties
Module-scoped evidence/state/decisions blijven hetzelfde contract gebruiken. Officiële courseprogressie blijft eigendom van het hostplatform.

### Technische coherentie
Modules 1–9 gebruiken één routefactory. CI bewaakt dit patroon uitvoerbaar.

### Productbruikbaarheid
Geen directe UI-regressie bedoeld; foutgedrag en persistence-disabled fallback zijn uniformer.

### Herbruikbaarheid en onderhoudbaarheid
Nieuwe modules hoeven alleen definition/evaluator/runtimecontract + dunne routes te leveren. Duplicatie is structureel teruggedrongen.

### Referentiearchitectuurprincipes
Separation of concerns, single source of truth, fail-closed platformprogress en backward-compatible publieke API-paden zijn gehandhaafd.

### Afhankelijkheden met andere EAW-producten
Geen wijziging aan websitebeschikbaarheid, commerce, production course row of productie-Supabase. PR #88 blijft buiten deze gate.

## Remediation

- Factoryconvergentie 1–6 uitgevoerd.
- CI-convergentiegate toegevoegd.
- HTTP-contracttests toegevoegd.
- Undeclared `react-markdown` dependency opgelost.
- Next.js baseline gepind.

## Retest

Formeel gatebesluit mag pas worden afgegeven nadat de finale GitHub Actions-run en de finale Vercel-preview voor dezelfde head groen/READY zijn.

## Doelcheck na de stap

Vraag: **Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?**

Antwoord: ja. Deze remediation verwijdert de laatste architectuurblokkade vóór Module 10. Module 10 mag uitsluitend starten na formeel `GO` op deze gate.
