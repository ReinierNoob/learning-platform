# Retrospective — Adaptive Solution Architecture Modules 4, 5 en 6

**Datum:** 31 augustus 2026

## Wat werkte goed

1. **Bronvolgorde serieus nemen.** De leerlijn had Module 4 bewust vóór Module 6 gezet; de implementatie gebruikt dat nu ook als didactische ruggengraat.
2. **Freshness review vóór contentcodering.** ISO/IEC 25010:2023 en ArchiMate 4 zijn eerst geverifieerd voordat de nieuwe modules verder werden uitgewerkt.
3. **Generic engine, specific pedagogy.** Module 4 en 5 gebruiken dezelfde engine maar hebben verschillende diagnostiek en visuals.
4. **Cross-module review.** Door Modules 4–6 samen te bekijken werd zichtbaar waar termen opnieuw werden geïntroduceerd of te absoluut waren.
5. **Server-only grading.** Correcte antwoorden en rubrics blijven buiten de client-safe moduledefinition.

## Wat bijna fout ging

### 1. Vuistregel versus formele standaard

`Functioneel = wat, kwaliteit = hoe goed` is pedagogisch bruikbaar, maar geen formele beschrijving van ISO/IEC 25010:2023 omdat Functional suitability onderdeel is van het productkwaliteitsmodel.

**Nieuwe regel:** wanneer een didactische vuistregel een formele taxonomie vereenvoudigt, label hem expliciet als vuistregel.

### 2. Taxonomie versus besliscriteria

Module 6 gebruikt `Consistentie` als relevant criterium, terwijl dit geen top-level ISO/IEC 25010:2023-hoofdkenmerk is.

Dat is niet fout zolang dit expliciet wordt gemaakt.

**Nieuwe regel:** een kwaliteitsreferentiemodel is een checklist/taalbron; architectuurbesliscriteria mogen ook contextspecifieke criteria bevatten.

### 3. Misconceptielabel te breed

Een cursist die `security altijd wint` zegt heeft een ander denkprobleem dan iemand die `alles prioriteit 1` geeft.

**Nieuwe regel:** misconception IDs beschrijven één observeerbaar denkpatroon; geen samengestelde catch-all labels.

### 4. Tussencommits kunnen rood zijn

Module 4 API-routes werden eerder gecommit dan de complete runtimeallowlist, waardoor enkele tussenbuilds rood waren. De gecombineerde head werd later groen.

**Nieuwe regel:** bij toevoeging van een nieuwe adaptive module commit waar mogelijk in verticale slices:
`definition + evaluator + runtime gate + one route → build`, daarna overige endpoints.

## Wat we behouden

- elke module eigen previewflag tijdens controlled rollout;
- client-safe definition zonder answer key;
- QA-harness per module;
- no-production hard guard;
- inhoudelijke review vóór media;
- cross-module vocabulary contract voor opeenvolgende modules.

## Pipelineverbeteringen

Voeg toe:

1. **Cross-module learning-spine review** voor elke reeks van minimaal twee opeenvolgende modules;
2. **Didactic heuristic vs formal standard check**;
3. **Reference taxonomy vs decision criteria check**;
4. **Misconception atomicity check**;
5. **Vertical-slice build cadence** bij nieuwe module-runtime.

## Besluit

De aanpak schaalt. De generieke engine mag verder worden gebruikt voor volgende Solution Architecture-modules, mits iedere module opnieuw bron-, freshness-, didactische en cross-module review doorloopt.
