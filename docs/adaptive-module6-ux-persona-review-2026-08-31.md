# Adaptive Solution Architecture Module 6 — UX/persona review

**Datum:** 2026-08-31  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Reviewbasis:** EAW UX Designer/informatiearchitectuur skill + `elearning-persona-toets` + retrospective skill  
**Productie gewijzigd:** nee

## Bewijs en beperking

Aantoonbaar beschikbaar:

- actuele React/Next.js componenten;
- responsive CSS-breakpoints;
- server-side diagnose/assessment/override/state API's;
- Vercel build op de aangepaste UX-baseline: **READY**;
- TypeScript: **PASS**;
- production guard: labroute blijft 404 in productie;
- eerdere persistence/runtime E2E: PASS.

Niet aantoonbaar beschikbaar:

- echte browserrendering/screenshot van de beveiligde Vercel-preview;
- fysieke touch-test;
- echte screenreader-test.

Een headless browserpoging vanuit de codeomgeving werd door netwerkbeleid geblokkeerd met `ERR_BLOCKED_BY_ADMINISTRATOR`. Daarom worden mobile/visual/screenreader-gates niet kunstmatig als volledig gevalideerd gemarkeerd.

## UX scorecard na correcties

| Aspect | Score | Oordeel |
|---|---:|---|
| Taakintegriteit | 9/10 | verplichte route kan niet meer via de stappenlijst worden overgeslagen |
| Begrijpelijkheid intake | 9/10 | Eva stelt één vraag per beurt; duidelijke voortgang en privacyuitleg |
| Adaptieve route-uitleg | 8/10 | route is in gebruikerstaal beschreven; technische codes zijn ingeklapt |
| Actieve verwerking | 8/10 | denkvragen vereisen nu een eigen redenering vóór doorgaan |
| Assessment UX | 9/10 | fieldset/legend, grotere targets, duidelijke remediation |
| Responsive ontwerp | 8/10 statisch | aparte mobiele kaartweergave in plaats van brede desktopmatrix |
| Keyboard/accessibility | 8/10 statisch | focus-visible, progressbar semantics, aria-current, alerts/status, locked future steps |
| Trust/content sanitation | 9/10 | technische learner/evidence-details staan alleen in reviewer disclosure |
| Tutorinteractie | 6/10 | eigen redenering wordt nog niet inhoudelijk beoordeeld of door Alexander/Eva beantwoord |
| Visueel/browserbewijs | OPEN | geen live screenshot/touch/screenreaderbewijs beschikbaar |

## Bevindingen en maatregelen

### P0 — cursist kon rechtstreeks naar de eindcheck springen — OPGELOST

Oorspronkelijk waren alle route-items klikbare knoppen. Daardoor kon een cursist rechtstreeks de assessment openen zonder de verplichte leerstappen te doorlopen.

Maatregel:

- `maxReached` bewaakt de verst bereikte stap;
- toekomstige stappen zijn disabled;
- alleen huidige en reeds doorlopen stappen zijn heropenbaar;
- `aria-current="step"` markeert de actieve stap.

**Referentiepatroon:** een visuele routekaart mag nooit impliciet de leerintegriteit doorbreken.

### P1 — denkvragen waren feitelijk decoratief — DEELS OPGELOST

Eva/Alexander stelden vragen, maar de cursist kon zonder antwoord naar de volgende stap.

Maatregel:

- prompt krijgt een tekstveld `Jouw redenering`;
- volgende stap blijft geblokkeerd totdat een korte redenering is ingevoerd;
- antwoord blijft lokaal in de sessie.

Open punt:

- de redenering wordt nog niet door een tutor-observation service beoordeeld;
- er volgt nog geen inhoudelijke feedback op die redenering.

**Productieregel:** noem iets geen tutorvraag wanneer het antwoord pedagogisch nergens wordt gebruikt. Voor productie moet het antwoord óf feedback/evidence opleveren óf expliciet als zelfreflectie worden gelabeld.

### P1 — technische auditinformatie domineerde de leerervaring — OPGELOST

Reason codes, evidence IDs en learner-modelvelden stonden permanent zichtbaar in de hoofdervaring.

Maatregel:

- gebruikerstaal in de routekaart;
- technische `decisionCode`, evidence, misconcepties en profile-state verplaatst naar `<details>` onder `Pilotdetails voor reviewers`.

### P1 — desktopmatrix was op mobiel een horizontale 680–720px tabel — OPGELOST IN ONTWERP

Maatregel:

- desktop behoudt matrix;
- mobiel rendert elk alternatief als kaart met attribuut/value-paren;
- geen verplichte horizontale tabelscroll op kleine schermen.

Live touchbewijs blijft open.

### P1 — keyboard/focusfeedback onvoldoende — OPGELOST IN CODE

Maatregelen:

- zichtbare `:focus-visible`-ring;
- minimaal 44px interactieve targets;
- `fieldset/legend` voor toetsvragen;
- `role=progressbar` met waardes;
- `role=alert` voor fouten;
- `role=status`/`aria-live` voor resultaten;
- heading-focus na stapwissel;
- toekomstige stappen disabled en semantisch gelabeld.

Live screenreaderbewijs blijft open.

### P2 — terminologie kan beginners nog afremmen — OPEN

`ADR`, `trade-off` en kwaliteitsattributen zijn vaktermen. De module legt ze inhoudelijk uit, maar een beginner kan vóór de uitleg al cognitieve belasting ervaren.

Aanbeveling voor de uiteindelijke cursus:

- contextuele begripsuitleg bij eerste voorkomen;
- geen los woordenboek als primaire oplossing;
- jargon pas gebruiken nadat de gewone-taalbetekenis duidelijk is.

## Persona-toets

### Marieke — ervaren e-learningconsultant

**Sterk:**

- leerpad is nu daadwerkelijk sequentieel waar de module dat vereist;
- diagnose → route → actieve verwerking → eindcheck → remediation is didactisch coherent;
- assessment kan niet meer per ongeluk als losse navigatiestap worden geopend;
- mobiel is taakgericht herontworpen in plaats van alleen gestapeld;
- technische debugdata is uit de primaire cursistlaag gehaald;
- server-side antwoordkey blijft gescheiden.

**Kritiek:**

- de nieuwe redeneringsvelden zijn een echte verbetering, maar nog geen volwaardige actieve tutorinteractie omdat het antwoord inhoudelijk niet wordt beoordeeld;
- retentie-opvolging 1/7/30 dagen valt buiten deze Module 6-pilot en is nog niet aangetoond;
- zonder browser/screenreaderbewijs is toegankelijkheid nog een implementatiehypothese, geen afgeronde gate.

**Oordeel Marieke:** **pilot-reviewbaar, nog niet productierijp**. Doorslaggevend zijn de ontbrekende tutor-response loop en het ontbrekende live browser/accessibilitybewijs.

### Sem — onervaren cursist

**Wat nu beter werkt:**

- één vraag tegelijk voelt minder als een formulier;
- ik weet waarom Eva vragen stelt;
- ik kan niet per ongeluk vooruit springen naar iets wat ik nog niet snap;
- op mobiel krijg ik alternatieven als losse kaarten in plaats van een grote tabel;
- als ik een vraag krijg, moet ik nu zelf kort nadenken voordat ik verder kan.

**Afhaakmomenten:**

1. `ADR` kan nog onbekend zijn wanneer het voor het eerst prominent verschijnt.  
   **Verbetering:** eerste gebruik kort in gewone taal ankeren: “Architecture Decision Record (ADR): een compact besluitdocument”.
2. De afwegingsmatrix kan ervaren worden als abstract wanneer alle cellen alleen “te beoordelen” tonen.  
   **Verbetering:** laat Alexander in de eerstvolgende inhoudelijke iteratie één onderbouwd voorbeeld invullen en laat de cursist daarna zelf één rij beoordelen.
3. Na een geschreven redenering reageert Eva/Alexander nog niet op mijn antwoord.  
   **Verbetering:** voeg tutor-observation + korte inhoudelijke feedback toe.

**Oordeel Sem:** duidelijker en minder foutgevoelig; de ontbrekende reactie op zijn eigen redenering is het belangrijkste resterende afhaakrisico.

### Yasmin — ervaren cursist

**Diepgang:**

- serieuze alternatieven, kwaliteitsattributen, consequenties en ADR-kwaliteit bieden voldoende ruimte voor redenering;
- route B/C voorkomt onnodige beginneruitleg;
- learner override respecteert autonomie zonder de standaardroute te verwijderen;
- gerichte remediation is inhoudelijk sterker dan de hele module herhalen.

**Beperking:**

Er is in deze pilot geen vrije chatbot/tutor-runtime met een beschikbare tutor-systeeminstructie waarop een echt kritisch gesprek kan worden gesimuleerd. De UI gebruikt vooraf ontworpen Eva/Alexander-interventies. Volgens de persona-skill mag daarom geen chatbotgesprek worden verzonnen.

**Oordeel Yasmin:** de inhoud is uitdagender dan een definitiescursus, maar de echte meerwaarde van een adaptieve tutor is pas bewezen wanneer mijn vrije redenering aanleiding geeft tot een gerichte vervolgvraag, correctie of challenge.

## Gecombineerde prioriteiten

1. **P1 — tutor observation loop:** vrije redenering beoordelen en terugvertalen naar feedback/evidence/volgende interventie.
2. **P1 — live browser/mobile/screenreader gate:** daadwerkelijke rendering en bediening aantonen zodra previewbrowsertoegang beschikbaar is.
3. **P2 — begrippen in context:** ADR/trade-off/kwaliteitsattribuut bij eerste voorkomen in gewone taal ankeren.
4. **P2 — voorbeeld → zelf invullen:** één onderbouwd trade-offvoorbeeld tonen en daarna de cursist zelf laten beoordelen.
5. **P2 — retentie:** cursusbrede 1/7/30-dagen retrieval buiten de Module 6-pilot ontwerpen.

## Retrospective

### Behouden

- één vraag per beurt bij diagnostiek;
- routekeuze uitlegbaar maken in gebruikerstaal;
- learner override als autonomiepatroon;
- technische auditdetails via progressive disclosure;
- aparte mobile task rendering voor complexe modellen;
- minimaal 44px targets en expliciete focusstates;
- build ≠ browserbewijs als harde UX-regel.

### Aanscherpen

**Trigger:** een route bevat verplichte of assessable leerstappen.  
**Nieuwe regel:** navigatie naar toekomstige verplichte stappen is locked totdat de vorige stappen aantoonbaar zijn bereikt.  
**Bewijs:** UI-state + static/componentcheck + browserjourney.  
**Gate-effect:** directe assessment-skip is P0/no-go.

**Trigger:** tutor/interviewer stelt een cursist inhoudelijk een vraag.  
**Nieuwe regel:** de vraag moet leiden tot een van drie expliciete vormen: `tutor_observation`, `self_reflection` of `assessment`. Een decoratieve vraag zonder verwerking is niet toegestaan.  
**Bewijs:** inputcontract + feedback/evidence of expliciet reflectielabel.  
**Gate-effect:** onduidelijke/decoratieve tutorvragen zijn P1.

**Trigger:** complexe tabel/matrix op mobiel.  
**Nieuwe regel:** ontwerp de mobiele taakvorm apart; horizontale desktopscroll is geen standaardoplossing.  
**Bewijs:** mobile componentvariant + browser/touchbewijs.  
**Gate-effect:** onbehandelbare desktopmatrix op mobiel is P1.

### Nieuw referentiepatroon

> **Routekaart is status, geen bypass.** Een route-overzicht mag de cursist context en terugnavigatie geven, maar mag nooit de didactische voorwaarden van verplichte toekomstige stappen omzeilen.

## Gatebesluit

| Gate | Status |
|---|---|
| UX-structuur / information hierarchy | PASS |
| Foolproof route-integriteit | PASS |
| Active-processing interaction | PASS voor invoer, PARTIAL voor tutorfeedback |
| Static responsive ontwerp | PASS |
| Static keyboard/a11y semantics | PASS |
| Technical/public-content sanitation | PASS |
| Persona Marieke | PILOT GO / PRODUCTIE NO-GO |
| Persona Sem | PILOT GO |
| Persona Yasmin | PARTIAL — vrije tutorloop ontbreekt |
| Live desktop browserbewijs | OPEN |
| Live mobile/touchbewijs | OPEN |
| Live screenreaderbewijs | OPEN |
| Productierelease | **NO-GO** |

## Volgende stap

Bouw de generieke `tutor_observation`-loop voor vrije redeneringen:

`cursistantwoord → server-side observatie → evidence → learner model → feedback/challenge → orchestrator → volgende interventie`

Pas daarna definitieve Eva/Alexander-media produceren. De browser/mobile/screenreadergate blijft daarnaast verplicht vóór integratie in productie.