# Adaptive Module 6 — standaard `/leren` integratie

**Datum:** 31 augustus 2026  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Productie gewijzigd:** nee

## Doel

De Solution Architecture Module 6-pilot vanuit het Learning Lab in de normale EAW-leerroute kunnen aanbieden zonder de bestaande auth-, entitlement-, course-start- en published-modulecontroles te omzeilen.

## Implementatie

De bestaande route `app/leren/[slug]/module/[id]/page.tsx` blijft de enige toegangspoort.

Volgorde:

1. source module-id valideren;
2. access token ophalen;
3. sessiegebruiker controleren;
4. cursus op slug ophalen;
5. actieve learning access / entitlement controleren;
6. `startCourse` uitvoeren;
7. gepubliceerde module ophalen;
8. pas daarna adaptive feature gate evalueren;
9. bij een positieve gate de Adaptive Module 6 experience renderen;
10. anders exact de bestaande hoofdstuk + QuizClient flow renderen.

## Dubbele feature gate

Adaptive Module 6 in de normale leerroute is alleen actief wanneer alle voorwaarden waar zijn:

- `VERCEL_ENV !== production`;
- `EAW_ADAPTIVE_MODULE6_IN_LEARNING=true`;
- cursus-slug exact `solution-architectuur-ontwerppraktijk`;
- `source_module_id === 6`.

Persistence blijft een afzonderlijke preview-only flag:

- `EAW_ADAPTIVE_PERSISTENCE_ENABLED=true`.

Hierdoor kan de adaptive UI eerst zonder persistence worden getest.

## Regressie-invariant

Voor alle andere cursussen/modules, of wanneer de featureflag uit staat, blijft de bestaande modulepagina onveranderd:

`chapters → hoofdstukken → QuizClient`.

De actuele Next.js/Vercel build is PASS/READY.

## Security

De adaptive experience krijgt geen alternatieve toegangspoort in `/leren`.

De adaptive keuze vindt pas plaats na:

- geldige sessie;
- bestaande cursus;
- actieve entitlement;
- `startCourse`;
- gepubliceerde module.

Productie blijft hard uitgeschakeld in code, ook wanneer iemand de previewfeatureflag per ongeluk in productie zou zetten.

## UX

De normale leerroute behoudt:

- teruglink naar de training;
- ingelogde gebruikerscontext;
- logoutmogelijkheid.

De Adaptive Module 6 component zelf gebruikt de eerder gevalideerde foolproof route-integriteit en tutor-observation flow.

## Bewijs

- Vercel/Next.js compile: PASS;
- TypeScript: PASS;
- `/leren/[slug]/module/[id]` route build: PASS;
- bestaande featureflag-uit flow: codepad behouden;
- productie hard disabled: PASS in code;
- live routefetch wordt door Vercel SSO afgevangen en is daarom geen inhoudelijk browserbewijs.

## Open gate voor echte `/leren` E2E

De Solution Architecture-cursus bestaat nog niet als verkoop-/leerrecord in productie en mag daar nog niet voor worden aangemaakt.

Voor een echte end-to-end preview zijn daarom nog nodig:

1. tijdelijke Supabase development branch;
2. adaptive migrations toepassen;
3. branch-only Solution Architecture course/module/test entitlement seeden;
4. preview Vercel koppelen aan die branch;
5. `EAW_ADAPTIVE_MODULE6_IN_LEARNING=true`;
6. eerst persistence uit: auth → entitlement → `/leren/.../module/6` → adaptive UI;
7. daarna persistence aan: diagnose → observation → assessment → restore;
8. bestaande TOGAF-module regressiecheck;
9. tijdelijke branch en previewconfig opruimen.

## Architectuurreview

### Behouden
- één bestaande `/leren` toegangspoort;
- entitlement vóór adaptiviteit;
- exacte slug + module gate;
- feature flag los van persistence;
- productie hard disabled.

### Aanscherpen vóór productie
- de huidige adaptive client en API's leven technisch nog onder `lab`-paden; dit is acceptabel voor de previewpilot, maar moet vóór productierelease naar een generieke adaptive runtime namespace worden verplaatst;
- een echte browser/mobile/screenreader run blijft verplicht.

## Gatebesluit

**Code-integratie in standaard `/leren`: PASS.**  
**Echte end-to-end `/leren` preview met branchdata: OPEN.**  
**Productie: NO-GO.**
