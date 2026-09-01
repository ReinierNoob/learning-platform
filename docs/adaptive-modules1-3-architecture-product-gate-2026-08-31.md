# Adaptive Solution Architecture — Modules 1–3 Architecture/Product Gate

Datum: 2026-08-31
Branch: `feature/adaptive-solution-architecture-module-6`
Scope: Modules 1, 2 en 3 van `solution-architectuur-ontwerppraktijk`

## 1. Doelcheck vóór de stap

Oorspronkelijke einddoelstelling: een hoogwaardige, inhoudelijk correcte, foolproof en herbruikbare adaptieve Solution Architecture e-learning realiseren die veilig in EAW kan worden gepubliceerd.

Bijdrage van deze stap: Modules 1–3 vormen de voorkant van de leerketen en moeten aantoonbaar aansluiten op de al gevalideerde Modules 4–6 zonder een tweede runtime-, progress- of persistencearchitectuur te introduceren.

Kortste architectonisch juiste route: hergebruik van de bestaande generieke adaptive engine, dezelfde hostprogressketen en hetzelfde module-scoped restorecontract. Geen nieuwe architectuurlaag en geen productieactivatie.

## 2. Adaptiviteitsbesluit per module

### Module 1 — Rol en positionering
Besluit: **licht adaptief**.

Meerwaarde zit in:
- rolverwarring detecteren;
- solutionmandaat versus businessbesluit onderscheiden;
- mandaat versus invloed corrigeren;
- ervaren cursisten versneld naar conflictanalyse laten gaan.

### Module 2 — De businessvraag ontvangen en toetsen
Besluit: **sterk adaptief**.

Meerwaarde zit in:
- oplossingsdenken herkennen;
- scopefouten corrigeren;
- impliciete aannames zichtbaar maken;
- voorkomen dat `buiten scope` gelijk wordt aan `onbelangrijk`;
- ervaren cursisten sneller door basisuitleg laten gaan.

### Module 3 — Stakeholders en eisen
Besluit: **sterk adaptief**.

Meerwaarde zit in:
- afwezige stakeholders herkennen;
- wensen naar toetsbare eisen vertalen;
- de misconceptie `een getal maakt een eis toetsbaar` gericht repareren;
- voorkomen dat de architect zelf botsende businessbelangen gaat prioriteren.

## 3. Solution Architecture Review

### Single source of truth
- client-safe inhoud: moduledefinition;
- grading, rubrics, misconceptions en answer keys: server-only evaluator;
- officiële cursusvoortgang: bestaande EAW hostprogressflow;
- route/evidence/decision restore: module-scoped;
- course-wide mastery blijft beschikbaar voor expliciete transferlogica.

Resultaat: PASS.

### Verantwoordelijkheden
- generic client runtime: navigation, route UX, focus, learner override, remediation-shell en completion UX;
- moduledefinition: pedagogische inhoud en visuals;
- server evaluator: diagnose, observation rubric, grading en remediation mapping;
- adaptive service/store: persistence;
- EAW hostplatform: auth, entitlement, published module en officiële completion.

Resultaat: PASS.

### Afhankelijkheden en interfaces
- geen nieuwe database- of storagecontracten;
- vijf bestaande adaptive API-contracten per module: diagnose, observe, override, state, assess;
- standaard `/leren/[slug]/module/[id]` blijft toegangspoort;
- previewflags per module; production hard-disabled.

Resultaat: PASS.

### Backward compatibility
Modules 4–6 blijven op dezelfde generic client engine en dezelfde API-envelope draaien. De UX-remediation wijzigde geen servercontracten.

Resultaat: PASS.

### Deployment en rollback
- alleen featurebranch;
- Vercel previewbuilds;
- productieflags blijven uit;
- geen productiedata gewijzigd;
- generieke UX-fix kan via één componentrevert worden teruggedraaid.

Resultaat: PASS.

### Race conditions / concurrerende writers
- `busy` blokkeert gelijktijdige clientacties;
- officiële progress schrijft alleen na geslaagde adaptive mastery en exact hostquizcontract;
- nieuwe prompt-attempt state is client-session-only en introduceert geen writer.

Resultaat: PASS.

### Dubbele configuratie / hardcoded versies
Geen nieuwe answer-key duplicatie. Module-identiteit komt uit definitions/runtime registry. Routebestanden bevatten nog repetitieve endpoint-boilerplate; dit is een onderhoudswaarschuwing, geen functionele blocker voor controlled rollout.

## 4. Technische validatie

Laatste bewijsdeployment: `dpl_FDfZwJQFDdfJh1toVYiFtRXtfhE9` — READY.

PASS:
- Next.js production compile;
- TypeScript;
- static generation 44/44;
- 30 adaptive endpoints, vijf voor iedere Module 1–6;
- 6 QA-harnesses;
- standaard `/leren` hostroute intact;
- Module 1–6 bouwen gezamenlijk;
- production blijft hard-disabled.

Niet uitgevoerd in deze omgeving:
- fysieke browser/touch-run;
- VoiceOver/NVDA of equivalente screenreader-run;
- finale Supabase branch write-E2E voor Modules 1–5 met definitieve course fixture.

Deze punten blijven blocking voor productie, maar niet voor verdere controlled featurebranch-rollout.

## 5. Foolproof UX/UI Review

### Bevinding F1 — focus na dynamische stapwissel
Probleem: focus ging na `Volgende` naar de herhaalde moduletitel in plaats van de nieuwe leerstap.

Remediation:
- focus target verplaatst naar de actieve interventiontitel (`h2`);
- diagnostic focus blijft op de actieve vraag;
- routewissel, remediation en lesson navigation gebruiken dezelfde generic focusflow.

Retest: build PASS.

### Bevinding F2 — deterministische rubric kan cursist blokkeren
Probleem: een inhoudelijk geldige vrije formulering kan buiten de regex/rubric vallen. Daardoor kon een cursist theoretisch onbeperkt op één practice-step blijven hangen.

Remediation:
- succesvolle server-observations blijven leidend;
- na twee niet-doorgaande observations wordt `Volgende` beschikbaar;
- UI vermeldt expliciet dat de cursist niet hoeft vast te lopen;
- mastery wordt niet cadeau gegeven: de verplichte eindcheck blijft beslissend en kan targeted remediation starten.

Retest: build PASS.

### Overige foolproof controles
PASS op code/static review:
- `Ik weet dit nog niet` levert geen false-positive mastery op;
- route A/B/C heeft learner-facing namen;
- ervaren cursist kan volledige uitleg opvragen;
- route override kan worden teruggedraaid;
- foutmeldingen gebruiken `role=alert`;
- feedback/completion gebruikt `role=status`;
- touch targets zijn minimaal 44px;
- mobile CSS valt terug naar één kolom;
- visuals zijn informatief en geen decoratieve blokkade;
- mastery en officiële EAW-progresssync worden zichtbaar onderscheiden;
- sync-failure verwijdert bewezen mastery niet;
- terugkeer naar training blijft mogelijk.

Accepted warning:
- geen fysieke browser-, touch- of echte screenreaderbewijsrun in deze uitvoeromgeving.

## 6. Didactische/contentreview 1 → 2 → 3 → 4

Leerlijn:
1. **Wat is mijn rol en mandaat?**
2. **Is de ontvangen veranderopgave werkbaar genoeg om te ontwerpen?**
3. **Wie wordt geraakt en welke eisen moeten toetsbaar worden?**
4. **Welke kwaliteitsattributen zitten achter relevante kwaliteitseisen?**

Resultaat: coherent en oplopend in Bloom-complexiteit.

### Bevinding C1 — grens met Business Architecture
Probleem: Module 2 kon met `vraag achter de vraag` gelezen worden alsof de solution architect zelf de businessvraag formuleert, terwijl de cursus expliciet start bij een ontvangen businessvraag.

Remediation:
- tekst maakt nu expliciet dat de solution architect de businessvraag niet opnieuw formuleert;
- onderliggende doelen worden gebruikt om de ontvangen opdracht te toetsen op begrip en volledigheid;
- de businesskeuze blijft bij bevoegde opdrachtgever/businessarchitectuur.

Retest: build PASS.

### Bevinding C2 — Module 1 bronlabel
Probleem: een assessmentoptie was uitgebreid van `Business-architect` naar `Business-architect / businessverantwoordelijke`.

Remediation:
- brongebonden toets teruggezet naar `Business-architect`;
- classifier daarop aangepast.

Retest: build PASS.

### Bevinding C3 — getal-is-toetsbaar misconception
Probleem: de expliciete bronmisconceptie was niet observeerbaar in de diagnostiek.

Remediation:
- diagnostic distractor `Binnen 10 werkdagen` toegevoegd als bewust incomplete schijnprecisie;
- server-classifier detecteert deze keuze;
- route C kan vervolgens gericht `m3-getal-repair-v1` aanbieden;
- de brongebonden eindtoets is niet veranderd.

Retest: build PASS.

## 7. Architecture Product Review

### Businessarchitectuur
PASS. De cursus blijft binnen de afgesproken ontwerplaag en neemt businessbesluiten niet stilzwijgend over.

### Solutionarchitectuur
PASS. Eén generic client runtime, modulespecifieke pedagogiek, bestaande EAW hostprogress en module-scoped adaptive state blijven de kern.

### Informatie/datarelaties
PASS. Geen nieuwe persoonsgegevens of raw free-text persistence toegevoegd. Learner mastery blijft course-scoped; route/evidence/decisions blijven module-scoped.

### Technische coherentie
PASS met waarschuwing. Vijf endpointbestanden per module leveren repetitieve Next.js-boilerplate op. Er is nog geen gedragsdrift, maar vóór de codebase substantieel verder groeit moet worden beoordeeld of shared route handlers de onderhoudbaarheid verbeteren zonder de routecontracten te wijzigen.

### Productbruikbaarheid
PASS. De eerste drie modules hebben verschillende adaptive intensiteit in plaats van één uniforme truc. Module 1 bespaart theorie voor ervaren cursisten; Modules 2–3 gebruiken adaptiviteit waar denkfouten daadwerkelijk downstream impact hebben.

### Herbruikbaarheid
PASS. Dezelfde engine die Modules 4–6 draagt, draagt nu ook Modules 1–3.

### Onderhoudbaarheid
PASS met accepted warning voor endpoint-boilerplate. Definitions/evaluators blijven wel helder gescheiden.

### Referentiearchitectuurprincipes
PASS:
- single source of truth;
- generic engine, specific pedagogy;
- hostplatform owns official completion;
- course-scoped mastery != module-scoped navigation state;
- client-safe content != server-only answer key;
- adaptiviteit alleen waar didactisch gerechtvaardigd.

### Afhankelijkheden met andere EAW-producten
Geen nieuwe cross-product dependency. De bestaande TOGAF-overlap blijft relevant voor latere Modules 8–9 en is buiten deze stap.

## 8. Remediation

Uitgevoerd vóór gatebesluit:
1. Module 1 bronlabel teruggezet;
2. Module 3 numeric-only misconception observeerbaar gemaakt;
3. Module 3 classifier daarop aangepast;
4. dynamic focus naar actieve leerstap;
5. anti-lockout na twee niet-doorgaande tutor-observations;
6. businessarchitectuurgrens in Module 2 expliciet gemaakt.

## 9. Retest

Na alle remediation:
- Vercel deployment READY;
- Next.js compile PASS;
- TypeScript PASS;
- 30 adaptive routes aanwezig;
- 6 QA-harnesses aanwezig;
- geen productieactivatie;
- geen wijziging aan persistence- of hostprogresscontract.

## 10. Gatebesluit

### Controlled rollout naar de volgende Solution Architecture-modules
**GO WITH ACCEPTED NON-BLOCKING WARNINGS**

Accepted warnings:
1. fysieke desktop/mobile/touch-run nog niet uitgevoerd;
2. echte screenreader-run nog niet uitgevoerd;
3. finale persistence/platformprogress write-E2E wacht op definitieve course fixture;
4. endpoint-boilerplate verdient onderhoudbaarheidsreview vóór grootschalige verdere groei.

Deze warnings blokkeren featurebranch-ontwikkeling niet, maar 1–3 blokkeren productie-release wel.

### Productierelease
**NO-GO**

## 11. Doelcheck na de stap

Vraag: “Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?”

Antwoord: ja. Modules 1–3 leveren de noodzakelijke voorkant van dezelfde adaptieve Solution Architecture-leerlijn en gebruiken het reeds gevalideerde architectuurpatroon zonder productie te raken.

Volgende stap mag pas starten op basis van het controlled-rollout gatebesluit hierboven.
