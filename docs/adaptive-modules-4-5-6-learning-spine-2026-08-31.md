# Solution Architecture — learning spine Modules 4, 5 en 6

**Datum:** 31 augustus 2026  
**Status:** inhoudelijk/runtime ontwerp  
**Doorlopende casus:** Gemeente Middelveen

## 1. Bronbasis

De canonieke EAW-leerlijn maakt de afbakening expliciet:

- Module 3: wie wil wat en hoe maak je dat toetsbaar;
- **Module 4: wat is een kwaliteitsattribuut en hoe meet je het;**
- **Module 5: modelleren en visualiseren;**
- **Module 6: ontwerpkeuzes en trade-offs.**

De bron stelt expliciet dat Module 4 vóór Module 6 hoort, omdat je geen trade-offs kunt analyseren wanneer de criteria waarop je afweegt nog niet beheerst worden.

## 2. Actuele standaardbasis Module 4

Voor veranderlijke begrippen is de bron geactualiseerd met ISO/IEC 25010:2023, Edition 2 (november 2023).

Het productkwaliteitsmodel kent negen hoofdkenmerken:

1. Functional suitability
2. Performance efficiency
3. Compatibility
4. Interaction capability
5. Reliability
6. Security
7. Maintainability
8. Flexibility
9. Safety

Dit is een **referentiemodel**, geen verplichte top-9-prioriteitenlijst. Module 4 leert vooral classificeren, meetbaar maken en contextueel prioriteren.

## 3. Module 4 — Kwaliteit expliciet maken

### Leerhandeling

`wens → kwaliteitskenmerk → meetcontext → maat → norm → prioriteit/spanning`

### Output naar volgende modules

De cursist kan na Module 4:

- een kwaliteitseigenschap herkennen;
- een vage kwaliteitswens meetbaar maken;
- meerdere relevante kenmerken expliciet prioriteren;
- herkennen wanneer kwaliteitskenmerken elkaar in een ontwerp kunnen beïnvloeden.

### Niet doen

Module 4 kiest nog geen oplossing en schrijft nog geen ADR. Dat hoort bij Module 6.

## 4. Module 5 — Kwaliteit zichtbaar maken

Module 5 herhaalt ISO/IEC 25010 niet als theorieles.

De kwaliteitskenmerken uit Module 4 worden een **lens op het architectuurbeeld**:

- wethouder: alleen kwaliteit die een bestuurlijke beslissing ondersteunt;
- opdrachtgever: reliability/availability, security, maintainability/flexibility als risico- en haalbaarheidslens;
- keuringsinstantie: compatibility/interoperability, security/confidentiality en reliability;
- integratieteam: compatibility, reliability, performance efficiency en maintainability als ontwerp-/testcriteria.

De nieuwe vraag is dus niet: `welke kwaliteitskenmerken bestaan er?`, maar:

> **Welke kwaliteitsinformatie moet dit architectuurbeeld voor deze stakeholder zichtbaar maken?**

## 5. Module 6 — Kwaliteit afwegen

Module 6 gebruikt kwaliteitskenmerken en andere relevante besliscriteria om alternatieven te vergelijken.

Voor de Middelveen-oefening zijn vier scenario-specifieke criteria gekozen:

- **Beschikbaarheid** — binnen ISO/IEC 25010:2023 een subkenmerk van Reliability;
- **Vertrouwelijkheid** — binnen ISO/IEC 25010:2023 een subkenmerk van Security;
- **Onderhoudbaarheid** — een hoofdkenmerk in ISO/IEC 25010:2023;
- **Consistentie** — een aanvullend casus-/ontwerpcriterium; dit wordt niet als ISO-hoofdkenmerk gepresenteerd.

Daarmee is expliciet dat een architectuurbeslissing niet alleen op top-level ISO-labels hoeft te worden beoordeeld. De relevante criteria volgen uit de concrete ontwerpvraag.

### Leerhandeling

`criteria uit Module 4 → relevante zichtbaarheid uit Module 5 → serieuze alternatieven → winst/verlies → beslissing → ADR`

## 6. Didactische progressie

| Module | Kernvraag | Bloom-zwaarte | Bewijs |
|---|---|---|---|
| 4 | Welke kwaliteit is relevant en hoe maak ik die toetsbaar? | Understand / Apply / Analyze | classificatie + meetbare formulering + spanning |
| 5 | Welk architectuurbeeld helpt deze stakeholder de juiste vraag beantwoorden? | Apply / Evaluate | model-/detailkeuze + diagramreview |
| 6 | Welke serieuze optie past het best gegeven de criteria en consequenties? | Analyze / Evaluate | trade-offanalyse + ADR-beoordeling |

## 7. Adaptive architectuur

### Generiek

- A/B/C route envelope;
- learner override;
- tutor-observation;
- state restore;
- assessment/remediation shell;
- persistence/auditcontract.

### Modulespecifiek

- Module 4: quality canvas + meetbare-eis builder;
- Module 5: progressive architecture canvas;
- Module 6: trade-offmatrix + ADR-opbouw.

Dit is het gewenste patroon: **generic engine, specific pedagogy**.

## 8. Reviewbesluit

**Modules 4 → 5 → 6 vormen nu inhoudelijk één coherente leerlijn.**

Open releasechecks blijven per module afzonderlijk:

- persistence E2E;
- centrale platformprogress E2E;
- echte browser/mobile/touch/keyboard/screenreader review;
- persona-review;
- media alleen na UX GO;
- productiereleasebesluit.
