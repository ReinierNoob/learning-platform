# Adaptive Module 5 — Modelleren en visualiseren

**Datum:** 31 augustus 2026  
**Status:** inhoudelijk/adaptief ontwerp  
**Bronbasis:** EAW leerlijn Solution Architectuur — ontwerplaag  
**Actuele ArchiMate-baseline:** ArchiMate® 4 Specification, The Open Group, document C260, april 2026

## 1. Bronbasis uit de leerlijn

De bronmodule definieert vier leerdoelen:

1. de niveaus van het C4-model benoemen en uit elkaar houden;
2. uitleggen waarom je per publiek een ander detailniveau kiest;
3. voor een gegeven gesprek het passende model en detailniveau kiezen;
4. beoordelen of een diagram zijn doel dient en aanwijzen wat eraan schort.

De bronstructuur is:

- 5.1 Waarom modelleren: het gesprek, niet het plaatje;
- 5.2 C4: vier niveaus, van context naar code;
- 5.3 ArchiMate;
- 5.4 Eén diagram, één publiek;
- 5.5 Diagrammen die niets zeggen.

De bron noemt als misconceptions:

- één diagram kan alle publieken bedienen;
- notatiecorrectheid is het doel in plaats van begrijpelijkheid.

## 2. ArchiMate 4-correctie

De oude bronomschrijving `ArchiMate: lagen en viewpoints` wordt niet één-op-één overgenomen.

Voor nieuwe content gebruiken we ArchiMate 4 als normatieve basis. De module focust niet op certificeringskennis, maar op wat een beginnend Solution Architect nodig heeft om een geschikt architectuurbeeld te kiezen en te communiceren.

Nieuwe formulering voor 5.3:

**`ArchiMate 4: domain, view en viewpoint als communicatiemiddel`**

Didactische scope:

- ArchiMate is een modelleringstaal voor architectuurrelaties, niet een doel op zichzelf;
- een `view` toont een selectie uit het model voor een concrete vraag;
- een `viewpoint` beschrijft de conventies/keuzes waarmee zo'n view wordt opgebouwd;
- de cursist hoeft in deze module niet de volledige ArchiMate 4-metamodelstructuur te memoriseren;
- nieuwe voorbeelden gebruiken ArchiMate 4-terminologie en geen 3.2-only lesmateriaal;
- ArchiMate 3.2 komt alleen terug wanneer expliciet migratie of historische vergelijking wordt behandeld.

## 3. Didactisch kernprincipe

De module leert niet "diagrammen maken" als doel.

De kernbeslissing is steeds:

> **Welke architectuurvraag moet dit beeld voor deze stakeholder beantwoorden?**

Daarna pas volgen:

- modelkeuze;
- detailniveau;
- notatie;
- visualisatie.

## 4. Adaptive learner model

### Objectives

- `sa.m05.c4-niveaus`
- `sa.m05.publiek-detailniveau`
- `sa.m05.modelkeuze`
- `sa.m05.diagramkwaliteit`
- `sa.m05.archimate4-viewpoint`

### Misconceptions

- `sa.mc.een-diagram-voor-iedereen` — één volledig diagram is beter dan meerdere stakeholdergerichte views;
- `sa.mc.notatie-is-doel` — een diagram is goed zodra de notatie formeel klopt;
- `sa.mc.meer-detail-is-beter` — meer technische details maken communicatie altijd beter;
- `sa.mc.c4-en-archimate-zijn-concurrenten` — je moet voor een oplossing exclusief C4 óf ArchiMate kiezen;
- `sa.mc.viewpoint-is-een-plaatje` — viewpoint en view worden door elkaar gehaald.

## 5. Diagnostiek — Eva

Niet vier open tekstvragen zoals Module 6. Module 5 gebruikt **drie scenarioselecties + één korte motivatie**, omdat het leerdoel vooral model- en detailkeuze is.

### D1 — wethouder

Middelveen wil aan de wethouder uitleggen welke partijen en hoofdsystemen betrokken zijn bij de digitale aanvraag.

Vraag: welk niveau is het meest bruikbaar?

- C4 System Context;
- C4 Container;
- C4 Component;
- volledig technisch detailmodel.

Evidence: `sa.m05.c4-niveaus` + `sa.m05.publiek-detailniveau`.

### D2 — keuringsinstantie

De keuringsinstantie wil begrijpen welke systemen met elkaar communiceren en waar de statusuitwisseling plaatsvindt.

Vraag: welk detailniveau helpt het gesprek het beste?

Verwacht: container-/systeeminteractieniveau, niet code/componentdetail.

Evidence: `sa.m05.modelkeuze`.

### D3 — ArchiMate 4

Je hebt een groot architectuurmodel, maar de opdrachtgever wil alleen zien hoe de oplossing in het omliggende landschap past.

Vraag: wat doe je?

- het hele model tonen;
- een stakeholdergerichte view maken vanuit een passend viewpoint;
- alle elementen exporteren naar PDF;
- alleen C4 gebruiken omdat ArchiMate te groot is.

Evidence: `sa.m05.archimate4-viewpoint`.

### D4 — korte motivatie

Een diagram is notatiecorrect maar bevat vijftien systemen en ongelabelde verbindingen. Is het een goed diagram? Waarom wel/niet?

Evidence: `sa.m05.diagramkwaliteit`; vrije tekst alleen afgeleid beoordelen, niet raw persistent maken.

## 6. Routes

### Route A — Opbouwen

Trigger: onvoldoende bewijs of meerdere misconceptions.

Volgorde:

1. waarom modelleren: de vraag vóór het plaatje;
2. C4-niveaus met Middelveen;
3. detailniveau per stakeholder;
4. ArchiMate 4: model, view en viewpoint;
5. C4 en ArchiMate combineren zonder religieuze keuze;
6. diagramkritiek: betekenisvolle relaties en labels;
7. toepassing;
8. eindcheck.

### Route B — Versneld toepassen

Trigger: C4/detailniveau aantoonbaar aanwezig, geen actieve misconception.

Volgorde:

1. korte C4-verificatie;
2. ArchiMate 4 view/viewpoint;
3. stakeholdergerichte modelkeuze;
4. diagramreview;
5. transferopdracht;
6. eindcheck.

### Route C — Gerichte correctie

Trigger: relevante ervaring plus actieve misconception.

Gerichte interventies op:

- één diagram voor iedereen;
- notatie boven betekenis;
- meer detail is beter;
- C4 versus ArchiMate als schijnkeuze;
- view versus viewpoint.

Daarna transfer + eindcheck.

## 7. Interventiecatalogus

### Alexander — uitleg

#### `m5-model-doel-standard-v1`
**Titel:** Eerst de vraag, dan het diagram  
Kern: een model is een hulpmiddel voor begrip/besluitvorming. Begin bij stakeholder + vraag, niet bij notatie.

#### `m5-c4-standard-v1`
**Titel:** Vier C4-niveaus, vier verschillende gesprekken  
Kern: Context → Container → Component → Code. Niet ieder gesprek vraagt het diepste niveau.

#### `m5-archimate4-standard-v1`
**Titel:** ArchiMate 4: model, view en viewpoint  
Kern: een architectuurmodel kan rijk zijn; de stakeholder ziet een relevante view. Een viewpoint helpt bepalen welke selectie en presentatie bij het doel past.

#### `m5-modelmix-standard-v1`
**Titel:** C4 óf ArchiMate? Dat is de verkeerde vraag  
Kern: gebruik het modeltype dat het gesprek helpt. C4 kan oplossingsstructuur compact tonen; ArchiMate kan relaties met bredere architectuurcontext modelleren. Beide kunnen naast elkaar bestaan als hun doel duidelijk is.

#### `m5-diagramkwaliteit-standard-v1`
**Titel:** Een pijl zonder betekenis helpt niemand  
Kern: relaties moeten betekenis dragen; labeling, scope en vraag beantwoorden zijn belangrijker dan visuele drukte.

### Eva — challenge/repair

#### `m5-one-diagram-repair-v1`
Vraag: waarom is één allesomvattend model meestal juist minder bruikbaar voor verschillende stakeholders?

#### `m5-more-detail-repair-v1`
Vraag: welke informatie zou je bewust weglaten voor een wethouder, en waarom?

#### `m5-notation-repair-v1`
Vraag: als de notatie klopt maar niemand begrijpt welke beslissing het diagram ondersteunt, wat ontbreekt dan?

#### `m5-view-viewpoint-check-v1`
Vraag: beschrijf in je eigen woorden het verschil tussen een `view` en een `viewpoint`.

#### `m5-transfer-v1`
Opdracht: maak voor dezelfde Middelveen-oplossing twee verschillende beschrijvingen van een te maken architectuurbeeld: één voor de wethouder en één voor het integratieteam. Benoem doel, detailniveau en modelkeuze.

## 8. Visualisatieconcept

Module 5 heeft geen afwegingsmatrix zoals Module 6.

De primaire interactive visual wordt een **progressive architecture canvas**:

- C4 Context-kaart;
- omschakelbaar naar Container-detail;
- vereenvoudigde ArchiMate 4-landschapsview;
- stakeholderfilter: `wethouder`, `opdrachtgever`, `keuringsinstantie`, `integratieteam`;
- verbindingen krijgen betekenislabels;
- een `te veel detail`-variant om te laten beoordelen.

Mobile:

- geen miniatuurdiagram met onleesbare labels;
- per stakeholder een kaart met `doel`, `toon`, `laat weg` en `detailniveau`;
- daarna optioneel diagram openen.

## 9. Eindcheck

De bron bevat zes scenario-meerkeuzevragen. Voor adaptive mastery blijven minimaal de volgende concepten verplicht:

1. C4-volgorde herkennen;
2. detailniveau kiezen voor stakeholder;
3. passende model-/viewkeuze;
4. diagramkwaliteit beoordelen;
5. view versus viewpoint begrijpen.

De definitieve assessment wordt server-side geconfigureerd; antwoordkeys komen niet in client-safe content.

## 10. Media

### Eva
Geen vooraf opgenomen vraagvideo's. De diagnostiek en challenges moeten werkelijk op de cursist reageren.

### Alexander
Maximaal twee optionele clips:

1. **`Eerst de vraag, dan het diagram`** — mentale kapstok voor beginners;
2. **`C4 en ArchiMate 4 zijn geen concurrenten`** — korte conceptcorrectie wanneer de cursist modelkeuze als exclusieve keuze ziet.

Media pas genereren na content- en UX-review van deze Module 5-versie.

## 11. Bronnen en versiebeheer

Bronleerlijn: `/E-learning Solution Architectuur/leerlijn-solution-architectuur-ontwerplaag.md`.

Webverificatie augustus 2026:

- ArchiMate 4 Specification is gepubliceerd door The Open Group in april 2026, document C260;
- nieuwe Module 5-content gebruikt daarom ArchiMate 4 als normatieve baseline;
- oudere 3.2-benamingen worden niet zonder verificatie overgenomen.

## 12. Gate

**Module 5 adaptive content architecture: READY FOR IMPLEMENTATION.**

Vóór productie blijven nodig:

- inhoudelijke review door Solution Architect/ArchiMate-perspectief;
- UX/UI-review van progressive architecture canvas;
- assessmentcontract + server-side answer key;
- runtime-integratie;
- browser/mobile/accessibilitybewijs;
- retrospective.
