# Adaptive Module 6 — learner-experience fixes + retrospective

**Datum:** 31 augustus 2026  
**Scope:** opvolging van `adaptive-module6-learner-experience-review-2026-08-31.md`  
**Productie gewijzigd:** nee

## Uitgevoerde verbeteringen

### 1. Duidelijke exit na succesvolle eindcheck — PASS voor zichtbare UX

Na een geslaagde adaptive eindcheck krijgt de cursist nu:

- een positieve, niet-technische succesmelding;
- een primaire `Terug naar de training`-actie wanneer de component vanuit `/leren` wordt gebruikt.

Belangrijk: deze wijziging claimt niet dat de bestaande EAW `completion_percentage` al door de adaptive eindcheck wordt bijgewerkt. De huidige vaste-moduleprogressflow gebruikt een eigen `record-progress` assessmentcontract. Die koppeling blijft daarom een afzonderlijke integratiestap.

### 2. Mobiele leerstappen standaard ingeklapt — PASS in code/build

`Bekijk leerstappen` wordt nu responsief beheerd:

- desktop: open;
- <= 760px: standaard dicht;
- de cursist kan het blok mobiel zelf openen.

Daardoor begint mobiel niet meer met de volledige routelijst vóór de feitelijke les.

### 3. Reviewdetails alleen in QA — PASS

`AdaptiveModule6Experience` accepteert nu `showReviewDetails`.

- normale `/leren` wrapper: reviewdetails niet zichtbaar;
- `/lab/solution-architecture-module-6`: reviewdetails expliciet zichtbaar voor QA.

Reason codes, evidence, misconception-signalen en persistence-status zijn daarmee uit de normale cursistbeleving gehaald.

### 4. `Ik weet dit nog niet` — PASS

Iedere intakevraag heeft nu een expliciete escape voor beginners.

Gedrag:
- antwoord wordt als onvoldoende bewijs behandeld;
- de cursist kan zonder gokken verder;
- op de laatste vraag wordt de diagnose direct uitgevoerd met het volledige antwoordobject.

Classifiercheck:
- `Ik weet dit nog niet.` matcht geen knowledge-evidence patroon;
- matcht geen Module 6 misconceptionpatroon;
- leidt dus veilig richting de conservatieve route A wanneer onvoldoende ander bewijs aanwezig is.

### 5. Middelveen vóór vraag 1 geïntroduceerd — PASS

De intake bevat nu een korte casusintro:

- fictieve Gemeente Middelveen;
- statusinformatie rond keuringsgegevens;
- verschillende oplossingsrichtingen moeten worden afgewogen.

Hiermee test vraag 1 minder op het kunnen raden van context.

### 6. Learner-friendly routetaal — PASS

Interne classificatietaal is uit de primaire routekaart gehaald.

Cursistlabels zijn nu:
- `Uitgebreide route`;
- `Verkorte route`;
- `Focusroute`;
- na een onvoldoende eindcheck: `Extra oefenroute`.

Terms zoals `actieve misconceptie`, `weinig/conflicterend bewijs` en reason codes blijven intern/QA.

### 7. Mobiel: uitleg vóór visual — PASS in responsive code

Onder 760px wordt de lesson panel vóór het afwegingsbord getoond.

Desktop behoudt de tweekoloms ervaring met visual en uitleg naast elkaar.

## Technische validatie

- Next.js compile: PASS;
- TypeScript: PASS;
- route generation: PASS;
- preview deployment: READY;
- bestaande `/api/adaptive/...` route-set intact;
- productiefeature blijft hard disabled.

## Retrospective

### Wat werkte

1. Eerst door de ogen van de cursist kijken leverde relevantere verbeteringen op dan nog een extra infrastructuurtest.
2. Interne learner-modeltermen en cursistentaal moeten twee aparte presentatielagen zijn.
3. `Ik weet het niet` is geldige adaptive evidence en moet niet als UX-fout worden behandeld.
4. QA-observability hoort beschikbaar te blijven, maar niet in de normale leerervaring.
5. Responsive UX gaat niet alleen over kolombreedte; ook informatievolgorde en progressive disclosure moeten veranderen.

### Wat we voortaan standaard doen

Na iedere user-facing adaptive module:

1. doorloop de ervaring als beginner, basisgebruiker en ervaren gebruiker;
2. controleer of onzekerheid expliciet mag worden aangegeven;
3. controleer of interne classificatietaal niet aan de cursist wordt getoond;
4. controleer mobile information order, niet alleen responsiveness;
5. controleer of technische review/debugdata QA-only is;
6. controleer de exit/continuïteit na assessment;
7. onderscheid `visueel afgerond` van `platformprogressie geregistreerd`;
8. houd live browser/touch/screenreader als aparte bewijsgates.

## Resterend uit stap 1

### OPEN — platformprogressie na adaptive eindcheck

De cursist krijgt nu een duidelijke exit, maar de adaptive eindcheck schrijft nog niet naar hetzelfde `record-progress` contract als de vaste modulequiz.

Dit moet vóór productierelease worden opgelost of expliciet worden ontworpen, anders kan de cursist na `Terug naar de training` een voortgangspercentage zien dat nog niet overeenkomt met de adaptive eindcheck.

### OPEN — echte visuele/touch/a11y review

De uitvoeromgeving kan nog geen volledige browserrender/screenshot/touch/screenreaderbewijs leveren. Daarom blijven deze afzonderlijk OPEN:

- desktop visual review;
- mobile/touch review;
- keyboard review;
- screenreader review.

## Gatebesluit

**Learner-facing UX fixes uit review:** PASS in code/build.  
**Platformprogress synchronization:** OPEN.  
**Live visual/mobile/accessibility proof:** OPEN.  
**Productie:** NO-GO.
