# Adaptive Module 6 — generieke runtime refactor

**Datum:** 31 augustus 2026  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**PR:** #14  
**Release:** NO-GO

## Doel

Verwijder de technische afhankelijkheid waarbij de normale `/leren`-route productie-achtige runtimecode rechtstreeks uit `app/lab/...` importeerde. De QA-/labroute mag de runtime gebruiken, maar mag niet de eigenaar zijn van de runtime.

## Voor de refactor

- user-facing component: `app/lab/solution-architecture-module-6/AdaptiveModule6PilotV3.tsx`;
- API: `/api/lab/solution-architecture-module-6/*`;
- runtimeconfig: `lib/adaptive-pilot-runtime.ts`;
- normale `/leren/[slug]/module/[id]` importeerde indirect uit `app/lab/...`.

## Na de refactor

### Runtimecomponent

`components/adaptive/solution-architecture-module-6/AdaptiveModule6Experience.tsx`

### Runtime-API

- `/api/adaptive/solution-architecture-module-6/diagnose`
- `/api/adaptive/solution-architecture-module-6/observe`
- `/api/adaptive/solution-architecture-module-6/assess`
- `/api/adaptive/solution-architecture-module-6/override`
- `/api/adaptive/solution-architecture-module-6/state`

### Runtimeconfig

`lib/adaptive-runtime.ts`

### QA-harness

`/lab/solution-architecture-module-6` blijft bestaan als dunne preview-only pagina en rendert exact dezelfde generieke component als de normale learning-flow.

## Gedragsbehoud

De refactor verandert de pedagogische of adaptieve beslislogica niet. Behouden zijn onder meer:

- Eva-intake, één vraag per beurt;
- routes A/B/C;
- negatiebewuste misconceptiedetectie;
- learner override;
- verplichte volgorde/step lockout;
- tutor-observation loop;
- assessment → targeted remediation → recheck;
- privacyregel: vrije tutor-/intaketekst niet als learner evidence bewaren;
- geen verzonnen matrixwaarderingen;
- normale `/leren` sessie-, entitlement-, course-start- en published-modulecontrole blijft vóór de adaptive renderer plaatsvinden.

## Veiligheid

De releaseguards blijven onveranderd:

- adaptive APIs: 404 in `VERCEL_ENV=production`;
- adaptive renderer: alleen non-production + `EAW_ADAPTIVE_MODULE6_IN_LEARNING=true` + exacte course/module match;
- persistence: alleen non-production + `EAW_ADAPTIVE_PERSISTENCE_ENABLED=true`;
- productie-Supabase niet gewijzigd;
- geen HeyGen-media geproduceerd;
- PR blijft draft.

## Technische validatie

Vergelijking vanaf pre-refactor commit `ce1cac618a24449f7b6a31386166ca026956660e` naar cleanup commit `f4aa6ffa6541ed3c14cfb7f0a2b3ce86fd9a4edf` laat zien:

- 5 API-bestanden herkend als rename van `api/lab` naar `api/adaptive`;
- V3 component herkend als rename naar `components/adaptive`;
- V3 CSS herkend als rename naar `components/adaptive`;
- runtimeconfig herkend als rename naar `lib/adaptive-runtime.ts`;
- alleen historische V1/V2 pilotimplementaties zijn verwijderd.

Dit ondersteunt dat het primair een structurele refactor is en geen herimplementatie van de adaptieve logica.

### Vercel build

Deployment `dpl_7obp8DArKJXJaENf13wis4wQvv8Y` op commit `f4aa6ffa6541ed3c14cfb7f0a2b3ce86fd9a4edf`:

- Next.js compile: PASS;
- TypeScript: PASS;
- page generation: PASS;
- deployment: READY;
- route-table bevat uitsluitend de vijf `/api/adaptive/...` endpoints;
- route-table bevat geen `/api/lab/...` endpoints meer;
- `/lab/solution-architecture-module-6` resteert alleen als QA-harness.

## UX/UI review

Er is in deze stap bewust geen interfaceherontwerp uitgevoerd. De huidige V3-interactie is één-op-één naar de generieke component verplaatst, met alleen terminologische opschoning van `pilot/preview` naar `adaptieve leerroute` in de normale learning wrapper.

Daarom verandert de eerder uitgevoerde statische UX/a11y-beoordeling niet. Live browser-, touch- en screenreader-validatie blijven open.

## Reviewbevindingen

### PASS

- normale `/leren`-route bezit geen import meer naar `app/lab`;
- runtimecomponent staat in een herbruikbare componentnamespace;
- adaptive endpoints staan in een runtime-API-namespace;
- QA-harness en runtime zijn gescheiden;
- oude dubbele API-endpoints verwijderd;
- oude V1/V2/V3 pilotbestanden verwijderd;
- oude `adaptive-pilot-runtime.ts` verwijderd;
- build + TypeScript + route-table PASS;
- production guards behouden.

### OPEN

- geautomatiseerde protected-preview `/leren` E2E met officiële Vercel automation bypass;
- interactieve desktopreview route A/B/C;
- mobile/touch review;
- keyboard/screenreader review;
- persona-review op geïntegreerde `/leren` runtime;
- definitieve media/HeyGen-productie;
- expliciete productiereleasebeslissing.

## Retrospective

### Wat werkte goed

1. Eerst de generieke paden toevoegen en bouwen, pas daarna legacy verwijderen.
2. GitHub rename-detectie gebruiken om te bewijzen dat logica niet onnodig is herschreven.
3. De Next.js route-table als expliciete architectuurtest gebruiken: niet alleen build groen, maar ook controleren welke endpoints werkelijk bestaan.
4. QA-harness behouden, maar eigenaarschap van de runtime verplaatsen naar een neutrale namespace.

### Pipelineverbetering

Voeg een vaste **prototype-to-runtime promotion gate** toe:

`prototype/lab → generic runtime → build → route-table verification → legacy cleanup → build → review → retrospective`

Regels:

- productie- of standaardroutes mogen niet importeren uit `lab`, `demo`, `poc` of `prototype` namespaces;
- test-/QA-routes mogen wel een generieke runtime importeren;
- API-contracten die richting productie gaan krijgen een neutrale runtime-namespace;
- verwijder oude pilots pas nadat de nieuwe runtime buildt;
- valideer na cleanup dat legacy routes niet meer in de framework route-table staan;
- een namespace-refactor verandert geen releasegate: live UX/E2E moet nog afzonderlijk worden bewezen.

## Gatebesluit

**Generic runtime refactor: PASS.**  
**Productierelease: NO-GO.**
