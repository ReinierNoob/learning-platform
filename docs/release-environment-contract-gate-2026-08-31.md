# EAW Solution Architecture — Release Environment Contract Gate

**Datum:** 2026-08-31  
**Scope:** learning-platform releaseconfiguratie; geen productieactivatie en geen Supabase data/schemawijziging.

## 1. Doelcheck

Oorspronkelijk einddoel: Solution Architecture – Ontwerppraktijk, Modules 1–10, veilig en aantoonbaar publiceerbaar maken via de EAW releasegates.

Deze stap draagt rechtstreeks bij door environment-drift, dubbele Supabase-configuratie en onveilige deploymentdefaults vóór de finale geïntegreerde release-E2E weg te nemen.

## 2. Solution Architecture Review

### Single source of truth

Besluit:
- Vercel target environment is de runtime-SoT voor environment-specifieke waarden;
- runtimecode consumeert configuratie en bevat geen project-URL/key fallback;
- basis-CI gebruikt uitsluitend synthetische, niet-live placeholders;
- de previewworkflow bezit de expliciete integration-previewbinding;
- de productionworkflow valideert verplichte production-envkeys vóór deployment.

### Verantwoordelijkheden

- `lib/platform.ts`: consumeert EAW Supabase URL + publishable key en faalt bij ontbrekende configuratie;
- video-route: consumeert uitsluitend dedicated `VIDEO_SUPABASE_URL` + `VIDEO_SUPABASE_SERVICE_ROLE_KEY`;
- basis-CI: code-, build- en contractregressie zonder externe Supabase-afhankelijkheid;
- Vercel preview: echte previewenvironmentconfiguratie;
- Vercel production: production preflight en deployment;
- Supabase: canonical identity/catalog/entitlement/progress data; niet gewijzigd in deze stap.

### Afhankelijkheden en contracts

Bestaande application interfaces blijven ongewijzigd. Alleen configuratie-resolutie en deploymentpreflights zijn aangescherpt.

### Backward compatibility

De generieke `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` mediafallback is bewust verwijderd. Dit is een controlled breaking configuration change vóór productierelease, omdat het media-project expliciet een afzonderlijke bounded context is en verkeerde URL/key-combinaties anders stilzwijgend mogelijk blijven.

### Deployment en rollback

Geen productie-deployment uitgevoerd. De wijziging is volledig terug te draaien via Git. Production deployment blijft alleen via `main` lopen en faalt voortaan vóór deploy bij ontbrekende verplichte environmentkeys.

### Dubbele configuratie / hardcoding

Root cause gevonden:
- hardcoded production publishable key in `lib/platform.ts`;
- hardcoded media Supabase URL in de video-route;
- live integration-preview Supabase URL/key in basis-CI.

Deze patronen compenseerden environment-drift lokaal en creëerden meerdere sources of truth.

### Race conditions / writers

Geen nieuwe writer geïntroduceerd. Persistence/progressownership is ongewijzigd.

### Productie-impact

Geen productieconfiguratie of productiedata gewijzigd. De toekomstige productiondeployment is veiliger omdat ontbrekende configuratie fail-closed wordt gedetecteerd.

## 3. Uitvoering

Uitgevoerd:
- hardcoded production publishable key verwijderd;
- hardcoded media Supabase URL verwijderd;
- legacy generieke mediafallback verwijderd;
- basis-CI hermetisch gemaakt met `https://ci.invalid` en een niet-live CI-key;
- `scripts/verify-environment-contract.mjs` toegevoegd;
- previewpreflight vereist dedicated media credentials;
- productionpreflight vereist EAW Supabase URL/key, account URL en dedicated media URL/servicekey;
- `.env.example` gelijkgetrokken met het doelcontract.

Niet uitgevoerd:
- geen productie-Supabase wijziging;
- geen production course row;
- geen prijs of launch path bedacht;
- geen productie-deployment;
- geen merge van PR #14.

## 4. Technische validatie en retest

Finale retestcommit: `5863d1928292ce8b065df4e0f46cd3217facfc89`.

GitHub Actions run `33402681116`: **PASS**.

Groen:
- dependency install;
- environment contract;
- adaptive architecture/route convergence;
- Next.js build + TypeScript;
- Modules 1–10 adaptive HTTP contracts;
- preview QA-labs;
- production adaptive API hard-deny;
- production QA-lab hard-deny.

## 5. Retrospective

### Wat was het doel?

Environment- en releaseconfiguratie één architectonisch correcte SoT geven voordat geïntegreerde release-E2E wordt uitgevoerd.

### Wat is daadwerkelijk gedaan?

Dubbele runtimeconfiguratie is verwijderd, CI en integratieworkflows zijn gescheiden en deploymentpreflights zijn aangescherpt.

### Is het doel bereikt?

Ja, voor de configuratiearchitectuur en basis-CI.

### Waar was afwijking?

Tijdens de review bleek het probleem breder dan de aanvankelijk gevonden hardcoded publishable key: ook media-URL en basis-CI waren direct aan concrete Supabase-projecten gekoppeld.

### Welke onnodige complexiteit is verwijderd?

Production-key override, mediafallback en live Supabase-afhankelijkheid in basis-CI.

### Root cause

**Environment-drift was lokaal gecompenseerd met hardcoded fallbacks in plaats van één environment-SoT en expliciete releasepreflights.**

### Structurele verbetering

Environment-contract is nu machine-testbaar en CI faalt bij herintroductie van hardcoded runtimeprojecten/keys of legacy mediafallbacks.

### Pipeline-/skillverbetering

Voeg aan toekomstige EAW releasegates standaard toe:
1. scan runtimecode op hardcoded environment/projectbindingen;
2. scheid hermetische CI van echte integratie-E2E;
3. valideer target-environmentkeys vóór deploy;
4. gebruik dedicated bounded-context credentials voor afzonderlijke data/media-projecten.

### Kortste route?

Ja. De structurele configoorzaak is opgelost vóór een finale persistence/commerce E2E wordt gestart.

## 6. Foolproof UX/UI Review

`NO_DIRECT_UI_CHANGE`

Indirecte gebruikersimpact:
- voorkomt dat URL/key-drift zich voor gebruikers uit als onverklaarbare login-, entitlement- of videofouten;
- ontbrekende mediaconfiguratie blijft expliciet een serverfout in plaats van onbedoeld naar een ander project te vallen;
- technische configuratiecomplexiteit lekt niet naar learner UI;
- terminologie `EAW_SUPABASE_*` versus `VIDEO_SUPABASE_*` is per bounded context eenduidig.

## 7. Architecture Product Review

- Businessarchitectuur: commerce/entitlement blijft EAW-verantwoordelijkheid; learning blijft learning-platform-verantwoordelijkheid.
- Solutionarchitectuur: runtimeconfiguratie volgt één target-environment-SoT.
- Datarelaties: canonical training/progresscontract ongewijzigd.
- Technische coherentie: basis-CI, preview en production hebben nu verschillende en expliciete verantwoordelijkheden.
- Productbruikbaarheid: minder kans op verborgen environmentfouten.
- Herbruikbaarheid: environment-contractscan is generiek toepasbaar op volgende modules/releases.
- Onderhoudbaarheid: hardcoded runtimeprojecten/keys zijn verboden en machine-afgedwongen.
- Referentiearchitectuur: separation of concerns, fail-closed deployment en bounded-context credentials zijn versterkt.
- Afhankelijkheden: website/Supabase/Vercel-contracten blijven expliciet onderdeel van de finale geïntegreerde releasegate.

## 8. Remediation

Alle gevonden configbevindingen binnen deze scope zijn verwerkt vóór retest.

## 9. Retest

PASS — GitHub Actions run `33402681116`.

## 10. Gatebesluit

**GO WITH ACCEPTED NON-BLOCKING WARNINGS**

Niet-blocking voor verdere releasevoorbereiding, maar blocking voor productiepromotie:
- de actuele canonical integration/production Supabase projectbinding kon vanuit de huidige Supabase-connector nog niet inhoudelijk worden gelezen/gevalideerd;
- production environmentwaarden zelf zijn niet gewijzigd of uitgelezen; de nieuwe workflow valideert de vereiste keys zodra production deployment aan de orde is.

**Productierelease blijft NO-GO.**

## 11. Doelcheck na de stap

> Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?

Ja. De releaseketen is structureel veiliger en de volgende stap is nu het aantoonbaar vaststellen en testen van de canonical Supabase integration/production-binding zonder productie te muteren.
