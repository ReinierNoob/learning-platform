# Retrospective — Adaptive Module 6 naar standaard `/leren`

**Datum:** 31 augustus 2026

## Doel

Adaptive Module 6 beschikbaar maken via de normale EAW-leerroute zonder bestaand TOGAF-gedrag, entitlement of productie te beïnvloeden.

## Wat werkte aantoonbaar goed

- integratie vond plaats in de bestaande dynamische modulepagina in plaats van via een tweede leerroute;
- auth, sessie, cursus, entitlement, course-start en published-modulecontrole blijven vóór adaptiviteit staan;
- exact course-slug + source-module-id voorkomt accidental rollout naar andere cursussen;
- aparte flags voor UI-integratie en persistence verminderen blast radius;
- productie wordt in code geweigerd, onafhankelijk van configuratiefouten;
- Next.js compile en TypeScript zijn groen na correctie van één expliciete sessietypefout;
- bestaande niet-adaptive codepad is behouden.

## Wat kostte onnodig tijd

De eerste wrapper nam aan dat `user.email` altijd een string is. Het bestaande sessietype laat `null/undefined` toe; de buildgate ving dit direct af.

### Pipeline-les
Gebruik bestaande platformtypes als contract. Een previewwrapper mag types niet versmallen zonder fallback of expliciete validatie.

## Belangrijkste structurele les

Adaptive learning hoort niet vóór of naast bestaande commerce-/entitlementcontrole te beslissen. De volgorde is:

`platform access gate → published content gate → adaptive presentation/orchestration`.

Dat patroon moet voor iedere volgende adaptive cursus gelden.

## Nieuwe referentiepatronen

1. **Exact allowlist gate**: course slug + module-id + previewflag.
2. **Production hard deny**: runtimecode controleert productie, niet alleen environment configuration.
3. **UI-flag los van persistence-flag**: eerst ervaring valideren, daarna writes activeren.
4. **Bestaande leerroute als fallback**: feature uit betekent oud gedrag, geen alternatieve fallbackimplementatie.
5. **Platform auth vóór adaptiviteit**: adaptiviteit krijgt nooit een eigen entitlementpad.

## Technische schuld

De pilotcomponent en API-routes gebruiken nog `lab` in hun technische namespace. Dat is voor een preview acceptabel, maar vóór productie moet dit worden genormaliseerd naar een generieke adaptive-runtimecomponent/API-namespace.

## Gate die nog ontbreekt

Een groene build bewijst niet dat de geïntegreerde route werkt met een echte Solution Architecture cursus, module en entitlement. Voor dat bewijs is een branch-only dataset en previewkoppeling nodig.

## Classificatie

- `behouden`: bestaande `/leren` access chain;
- `behouden`: exact allowlist + production hard deny;
- `nieuw`: afzonderlijke presentation- en persistencefeatureflags;
- `aanscherpen`: platformtypes als harde integratiecontracten;
- `aanscherpen`: live E2E vereist echte branch-only course/module/entitlement data;
- `verwijderen vóór productie`: technische afhankelijkheid van `lab` namespace.

## Definition of Done voor deze stap

- code-integratie: PASS;
- build/typecheck: PASS;
- regressiepad bij featureflag uit: PASS in code;
- productie hard disabled: PASS;
- echte `/leren` E2E: OPEN;
- productie: NO-GO.
