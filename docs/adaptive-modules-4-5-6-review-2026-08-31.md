# Review — Adaptive Solution Architecture Modules 4, 5 en 6

**Datum:** 31 augustus 2026  
**Reviewperspectief:** ervaren Solution Architect + opleidingskundige + adaptive-learning architect  
**Status:** code/build en inhoudelijke keten PASS; productierelease NO-GO

## 1. Brontrouw en volgorde

De canonieke EAW-leerlijn bepaalt expliciet:

- Module 4 = kwaliteitsattributen definiëren, meetbaar maken en spanning herkennen;
- Module 5 = modelleren en visualiseren;
- Module 6 = alternatieven vergelijken en trade-offs/ADR.

De volgorde 4 → 5 → 6 is inhoudelijk noodzakelijk en wordt nu ook zichtbaar in de leerervaring.

## 2. Module 4 — inhoudelijke review

### PASS

- leerdoelen volgen de bron: herkennen, norm/noodzaak begrijpen, meetbaar maken, spanning analyseren;
- unit 4.5 `welke attributen doen er hier toe?` is vertaald naar contextueel prioriteren;
- ISO/IEC 25010:2023 wordt gebruikt als actuele begrippenbasis, niet als extra certificeringsexamen;
- de negen hoofdkenmerken zijn correct als referentie opgenomen;
- security/confidentiality en reliability/availability worden correct als hoofdkenmerk/subkenmerkrelatie behandeld in de doorlopende casus;
- open antwoorden worden deterministisch beoordeeld op afgeleide signalen; raw free text hoeft niet persistent te worden opgeslagen;
- assessment answer key staat server-only.

### Reviewcorrectie verwerkt

De eerste versie gebruikte de vuistregel `functioneel = wat / kwaliteit = hoe goed` te absoluut. Dat botst met ISO/IEC 25010:2023 omdat Functional suitability zelf onderdeel is van het productkwaliteitsmodel.

Nieuwe formulering:

- de vuistregel blijft bruikbaar in architectuurgesprekken;
- hij wordt expliciet niet gepresenteerd als formele grens van ISO/IEC 25010:2023.

Ook is het misconceptielabel `alle attributen maximaliseren` niet langer gebruikt voor een cursist die één attribuut automatisch absoluut laat domineren. Daarvoor is nu een apart signaal `een-attribuut-altijd-dominant`.

## 3. Module 5 — inhoudelijke review

### PASS

- ArchiMate 4 is de actuele baseline;
- C4 en ArchiMate worden niet als concurrerende religies gepresenteerd;
- model/detailkeuze blijft gekoppeld aan stakeholder en vraag;
- de progressive architecture canvas bevat nu een `kwaliteitslens uit Module 4`;
- Module 5 doceert ISO/IEC 25010 niet opnieuw maar gebruikt kwaliteit als selectief communicatieperspectief.

## 4. Module 6 — inhoudelijke review

### PASS

Module 6 maakt de handoff uit Module 4 en 5 expliciet voordat de adaptive ervaring start.

De vier Middelveen-besliscriteria blijven bewust scenario-specifiek:

- Beschikbaarheid → subkenmerk van Reliability;
- Vertrouwelijkheid → subkenmerk van Security;
- Onderhoudbaarheid → hoofdkenmerk Maintainability;
- Consistentie → aanvullend ontwerpcriterium, niet gepresenteerd als ISO-hoofdkenmerk.

Dit voorkomt een belangrijke didactische fout: een referentiemodel voor productkwaliteit is niet hetzelfde als een verplichte lijst van uitsluitend toegestane architectuurbesliscriteria.

## 5. Cross-module overlapcheck

### Module 4 → 5

Geen ongewenste herhaling.

Module 4 leert **wat** kwaliteit betekent en hoe je het meetbaar maakt.  
Module 5 leert **welke kwaliteitsinformatie** je in welk architectuurbeeld relevant maakt.

### Module 5 → 6

Geen ongewenste herhaling.

Module 5 kiest een communicatiemodel/view.  
Module 6 vergelijkt ontwerpopties en legt een beslissing vast.

### Module 4 → 6

De oorspronkelijke bronafbakening is behouden:

- Module 4 = criteria begrijpen/meetbaar maken;
- Module 6 = criteria gebruiken voor keuze en consequenties.

## 6. Adaptive/runtime review

PASS:

- Module 4 en 5 draaien op de config-driven generieke engine;
- Module 6 blijft functioneel intact op de bewezen runtime;
- alle modules hergebruiken dezelfde `/leren` auth/entitlement/published-moduleketen;
- afzonderlijke previewflags voor Modules 4, 5 en 6;
- adaptive runtime blijft hard-disabled in productie;
- Module 4 heeft server-only diagnose, tutor-observation en assessment;
- state restore, learner override en targeted remediation aanwezig;
- QA-harnesses voor Modules 4, 5 en 6;
- Next.js/TypeScript-build groen;
- 15 adaptive API-endpoints in de route-table.

## 7. Didactische review

### Progressie

De cognitieve progressie is logisch:

1. **Module 4 — Analyze:** herken kwaliteit, operationaliseer en zie spanningen;
2. **Module 5 — Evaluate:** kies en beoordeel het juiste architectuurbeeld;
3. **Module 6 — Evaluate:** vergelijk alternatieven en onderbouw de beslissing.

### Eva/Alexander

Rolcontract blijft coherent:

- Eva eliciteert/redeneert/daagt uit;
- Alexander legt concepten en contrasten uit;
- formele assessment is systeemgedrag.

Geen aanvullende media genereren vóór de UX-review van Module 4 en 5.

## 8. Open gates

Nog niet groen voor productie:

- Module 4 persistence E2E op branch-only course/module/enrollmentdata;
- Module 5 persistence E2E;
- definitieve centrale platformprogresscontracten voor Modules 4 en 5;
- echte browser/mobile/touch/keyboard/screenreader review voor 4–6;
- persona-review van de volledige doorlopende keten;
- definitieve media na UX-GO;
- definitieve Solution Architecture course-config en releasebesluit.

## 9. Besluit

**Inhoudelijke en code/build-gate voor Modules 4–6: PASS.**

De drie modules vormen nu één coherente leerketen:

`kwaliteit expliciet maken → kwaliteit zichtbaar maken → kwaliteit afwegen`.

**Productierelease: NO-GO totdat de resterende runtime/device/progressgates zijn gesloten.**
