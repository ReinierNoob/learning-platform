# EAW Architecture/Product Gate — Adaptive Solution Architecture Modules 4–6

Datum: 31 augustus 2026

## 1. Doelcheck vóór de stap

### Oorspronkelijke einddoelstelling
Een hoogwaardige, inhoudelijk correcte, foolproof en herbruikbare adaptieve Solution Architecture e-learning realiseren die veilig in EAW kan worden gepubliceerd.

### Bijdrage van deze stap
Modules 4–6 vormen de architectuurmijlpaal waarmee wordt bewezen dat adaptive learning niet alleen technisch werkt, maar ook productmatig, didactisch en architectonisch schaalbaar is naar de rest van de training.

Interne doelvraag:
> Ben ik nog bezig met de kortste en architectonisch juiste route naar het einddoel?

Antwoord na correctie: **ja**. De stap richt zich op het sluiten van structurele oorzaken vóór verdere module-uitrol.

---

## 2. Solution Architecture Review

### Single source of truth
PASS na remediation.

- course/module identity komt uit `AdaptiveModuleDefinition`;
- runtime gebruikt de moduledefinities voor source-module-id en course slug;
- Module 6 assessment-answer-key is één server-only bron;
- platformprogress blijft eigendom van de bestaande EAW hostflow.

### Verantwoordelijkheden
PASS.

**Host learning platform**
- sessie/authenticatie;
- entitlement;
- gepubliceerde cursus/module;
- officiële module- en cursusvoortgang.

**Generic adaptive engine**
- intakeflow;
- route A/B/C;
- learner override;
- navigation/focus;
- tutor-observation shell;
- remediation/re-assessment shell;
- completion UX.

**Moduledefinition**
- leerdoelen;
- diagnostiek;
- interventies;
- routes;
- assessments;
- standaardreferenties;
- mediabeleid.

**Server-side modulelogica**
- classifier/rubrics;
- answer keys;
- misconceptiondetectie;
- remediationmapping.

### Afhankelijkheden en interfaces
PASS.

Adaptive routes hergebruiken de normale `/leren` keten:
`session → course → entitlement → startCourse → published module → adaptive runtime`.

Geen parallelle auth- of entitlementflow.

### Datarelaties
PASS na remediation.

Architectuurprincipe:
- learner profile/mastery is **course-scoped**;
- evidence en decisions zijn **module-scoped**;
- navigation/route restore is **module-scoped**;
- officiële progress is **host-platform-scoped**.

Root-cause bevinding tijdens review:
De eerdere restore gebruikte de laatste course-brede decision/route-state zonder modulefilter. Daardoor kon een refresh theoretisch een route uit een andere module herstellen.

Remediation:
`adaptive-state-restore.ts` scopeert route-state, evidence en decisions op de actieve gepubliceerde module. Alleen course-brede mastery blijft bewust herbruikbaar.

### Backward compatibility
PASS.

- standaard lineaire modules blijven ongewijzigd wanneer adaptive flags uit staan;
- adaptive runtime blijft production hard-disabled;
- Module 6 API-contracten blijven gelijk tijdens migratie naar de generieke client-engine;
- bestaande Module 6 platformprogress wrapper blijft compatibel.

### Deployment / rollback
PASS.

- veranderingen uitsluitend featurebranch / preview;
- Modules 4/5/6 hebben onafhankelijke previewflags;
- productie bevat geen actieve adaptive presentation;
- PR blijft draft en ongemerged.

### Race conditions / concurrerende writers
Geen nieuwe blocker gevonden.

De bestaande persistence gebruikt atomic transitions en monotone `event_seq`. Officiële cursusprogress blijft via de bestaande hostwriter lopen.

### Dubbele configuratie / hardcoded versies
Belangrijkste duplicaties geremedieerd:
- module identities niet meer los hardcoded naast definitions;
- Module 6 answer key niet meer dubbel in assess-route en platformprogress.

Niet-blokkerende waarschuwing:
Module 6 server-side classifier/observation code is historisch nog over meerdere serverfiles verdeeld. Nieuwe modules volgen het enkelvoudige server-evaluatorpatroon van Modules 4/5. Dit is onderhoudsopruiming, geen tweede runtimecontract.

---

## 3. Architecture Product Review

### Businessarchitectuur
PASS.

Adaptive learning is een ondersteunend EAW-productvermogen, geen los product naast de leeromgeving. De toegevoegde waarde is differentiatie naar voorkennis en misconcepties zonder de commerciële/toegangsflow te dupliceren.

### Solutionarchitectuur
PASS na bovengenoemde remediation.

Er is nu één client runtimepatroon voor Modules 4, 5 en 6:
`client-safe definition → generic engine → module visual plugin → server evaluator/API → adaptive persistence/host progress`.

### Informatie-/datarelaties
PASS.

Course-brede mastery kan transfer tussen modules ondersteunen, terwijl routehistorie en diagnostische evidence niet tussen modules lekken.

### Technische coherentie
PASS.

Module 6 is gemigreerd van een eigen client-engine naar dezelfde generieke engine als Modules 4/5. Oude Module 6 runtime-CSS is verwijderd.

### Productbruikbaarheid
PASS op ontwerp/code, met releasecheck open.

Sterke punten:
- beginner kan `Ik weet dit nog niet` kiezen;
- ervaren cursist kan verkorten;
- learner override houdt agency bij de cursist;
- remediation is gericht in plaats van volledige herhaling;
- mastery en officiële EAW-progress worden zichtbaar onderscheiden;
- technische learner-modeldetails lekken niet naar de gewone cursist.

### Herbruikbaarheid
PASS.

Het patroon is voldoende generiek om volgende modules te ontwikkelen zonder een enginefork.

Belangrijk productprincipe:
**niet iedere module hoeft maximaal adaptief te zijn.** Per module moet didactische meerwaarde aantoonbaar zijn. De engine is herbruikbaar; de pedagogiek blijft modulespecifiek.

### Onderhoudbaarheid
PASS met niet-blokkerende waarschuwing over de historische Module 6 server-file-indeling.

### Referentiearchitectuurprincipes
PASS:
- single source of truth;
- separation of concerns;
- fail closed;
- least privilege;
- backward compatible rollout;
- no parallel progress model;
- generic engine, specific pedagogy.

### Afhankelijkheden met andere EAW-producten
Beheerst:
- Supabase: identity, entitlement, progress en adaptive persistence;
- Vercel: preview/release;
- website/catalogus: aparte availability/releasegate;
- HeyGen/media: aanvullend, pas na live UX GO.

---

## 4. Foolproof UX/UI Review

Status: **PASS op code/statische productreview; fysieke device-check blijft releasegate**.

Geremedieerde bevindingen uit de volledige 4→5→6-keten:
- Module 4 visuals waren desktop-onzichtbaar door mobile-only classgebruik → hersteld;
- dynamische stepwissels konden keyboard/screenreader-oriëntatie verliezen → focusmanagement toegevoegd;
- inhoudelijk mastery-pass kon worden verward met hostprogress-sync → gescheiden statussen + retry;
- Module 6 gebruikte afwijkende UX-engine → gemigreerd naar generieke runtime.

Foolproof uitgangspunten na remediation:
- één primaire taak per leerstap;
- onzekerheid is geldige invoer;
- duidelijke routecopy zonder classifierjargon;
- geen sprong naar locked inhoud;
- assessment blijft verplicht;
- sync failure maskeert geen volledige cursusafronding;
- technische complexiteit blijft achter de interface.

Open releasechecks:
- fysieke desktop/mobile/touch-run;
- VoiceOver/NVDA of equivalente screenreader-run.

Deze zijn **blocking voor production release**, maar niet voor controlled content rollout naar volgende modules omdat de gedeelde runtime hierna niet opnieuw per module wordt geforkt.

---

## 5. Didactische/contentreview 4→5→6

PASS.

Doorlopende lijn:
1. Module 4 — kwaliteit expliciet maken;
2. Module 5 — kwaliteit stakeholdergericht zichtbaar maken;
3. Module 6 — kwaliteit en aanvullende criteria gebruiken om alternatieven af te wegen.

Belangrijkste kwaliteitsregels:
- ISO/IEC 25010:2023 is begrippenkaart, geen verplichte prioriteitenlijst;
- ArchiMate 4 is actuele ArchiMate-baseline;
- C4 en ArchiMate zijn complementair, niet concurrerend;
- didactische vuistregels worden niet als formele standaarden gepresenteerd;
- scenario-specifieke besliscriteria worden niet onterecht als ISO-hoofdkenmerken gelabeld;
- Module 6 herhaalt Module 4/5 niet volledig, maar gebruikt de opgebouwde kennis voor beslissingen.

---

## 6. Technische validatie

Na remediation:
- Next.js compile: PASS;
- TypeScript: PASS;
- static generation: PASS;
- 15 adaptive API endpoints aanwezig;
- drie QA-harnesses aanwezig;
- Modules 4/5/6 samen in dezelfde build: PASS;
- Module 6 generic-engine migration: PASS;
- legacy Module 6 runtime CSS verwijderd en build opnieuw PASS;
- module identities uit definitions: PASS;
- Module 6 answer-key single source: PASS;
- finale technische bewijsdeployment `dpl_FBe1hYvxJVKuucT8CxKpKuENYKdd`: READY op commit `11885c9963a0cdda6bfc3b9764443e65c9eb0b69`.

Latere commits in deze branch zijn documentatie van dezelfde gate en wijzigen de bewezen runtime niet.

Niet uitgevoerd omdat dit een aparte release/data-gate vereist:
- branch-only Supabase write-E2E voor de nieuwe Module 4/5 fixtures;
- fysieke device/screenreader E2E.

De onderliggende persistence- en atomic-transitionarchitectuur is eerder met Module 6 branch-E2E gevalideerd; de open tests betreffen nieuwe modulefixtures en releasebewijs, niet een nieuw persistenceontwerp.

---

## 7. Retrospective

### Wat was het doel?
Bewijzen of Modules 4–6 samen een architectonisch, didactisch en productmatig verantwoord patroon vormen voor de rest van de Solution Architecture-training.

### Wat is daadwerkelijk gedaan?
- volledige cross-module review;
- structurele persistence/restore review;
- runtime-SSOT review;
- product/UX/didactische review;
- blockers geremedieerd;
- build/retest uitgevoerd.

### Is het doel bereikt?
Ja voor **controlled rollout**. Niet voor production release.

### Waar is afgeweken?
Eerdere iteraties begonnen nieuwe modules voordat de architectuurmijlpaal formeel gesloten was. Deze gate corrigeert dat.

### Welke onnodige complexiteit was geïntroduceerd?
- een aparte Module 6 client-engine naast de generieke engine;
- course-brede route-state zonder modulefilter bij restore;
- dubbele Module 6 answer key;
- losse module-identiteitsconstanten naast definitions.

Deze zijn geremedieerd.

### Root cause
De pilot werd incrementeel uitgebreid voordat de promotie van pilot-specifiek naar multi-module productarchitectuur als expliciete milestonegate werd uitgevoerd.

### Structurele verbetering
Na de tweede module moet voortaan verplicht een multi-module architecture/product gate plaatsvinden vóór verdere rollout.

### Pipeline-/skillverbetering
Voeg controles toe voor:
- course-scoped learner model versus module-scoped route state;
- één runtime-engine;
- één server-side answer-key bron;
- module identity uit definition/catalog;
- productwaarde per module, niet automatisch adaptive-by-default.

### Kortste route naar einddoel?
Ja. De volgende modules kunnen nu op hetzelfde patroon worden ontwikkeld zonder nieuwe runtimearchitectuur te introduceren.

---

## 8. Remediation

Verwerkt vóór gatebesluit:
1. modulegescheiden state restore;
2. Module 6 naar generic client engine;
3. Module 6 visualisatie als moduleplugin;
4. obsolete Module 6 runtime CSS verwijderd;
5. module identity vanuit definitions;
6. previewflag-registry gecentraliseerd;
7. Module 6 server answer key gecentraliseerd;
8. shared platformprogress sync gebruikt;
9. eerdere focus/completion/mobile findings behouden en opnieuw gebouwd.

---

## 9. Retest

Finale retest na remediation:
- compile PASS;
- TypeScript PASS;
- route-table PASS;
- preview deployment READY;
- production flags onveranderd hard-disabled.

---

## 10. Gatebesluit

# GO WITH ACCEPTED NON-BLOCKING WARNINGS

**Scope van GO:** controlled rollout van de adaptive architectuur naar de overige Solution Architecture-modules.

Geaccepteerde niet-blokkerende waarschuwingen voor rollout:
1. Module 6 server-side pedagogische code kan later organisatorisch worden samengebracht in één evaluatorfile; er is geen tweede runtimecontract meer.
2. Branch-only Module 4/5 persistence/platformprogress write-E2E wacht op definitieve testfixtures.
3. Fysieke mobile/touch/screenreader-validatie wacht op de releasefase.
4. Definitieve media wacht op live UX GO.

**Deze waarschuwingen zijn wél blocking voor production release.**

Productierelease blijft daarom afzonderlijk:
# NO-GO

Dit onderscheid is expliciet: `GO WITH ACCEPTED NON-BLOCKING WARNINGS` geldt uitsluitend voor verdere ontwikkeling/controlled rollout op de featurebranch, niet voor publicatie, merge of productie-activering.

---

## 11. Doelcheck na de stap

Vraag:
> Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?

Antwoord: **ja**. De architectuurmijlpaal 4–6 is gesloten; verdere moduleontwikkeling kan nu dezelfde bewezen productarchitectuur gebruiken zonder nieuwe engine- of progressarchitectuur te introduceren.
