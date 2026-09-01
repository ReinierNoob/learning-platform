# Adaptive Module 5 — inhoudelijke review

**Datum:** 31 augustus 2026  
**Scope:** Modelleren en visualiseren  
**Bronbasis:** EAW leerlijn Solution Architectuur  
**Webverificatie:** ArchiMate 4 + actuele C4-documentatie  
**Productie gewijzigd:** nee

## Conclusie

**GO voor implementatie van de Module 5-config.**

De module blijft inhoudelijk trouw aan de bronleerdoelen, maar corrigeert/verdiept twee punten op basis van actuele externe bronnen.

## 1. ArchiMate 4 — PASS

De bron bevatte nog het open punt dat de exacte ArchiMate-versie moest worden vastgesteld.

Dat punt is gesloten:

- normatieve baseline voor nieuwe content: **ArchiMate® 4 Specification**;
- The Open Group documentnummer: **C260**;
- publicatie: **april 2026**;
- Module 5 gebruikt 3.2 niet als actuele standaard.

Didactische keuze:

- geen certificeringstraining van de volledige metamodelstructuur;
- wel functioneel begrip van model, view en viewpoint;
- focus op stakeholdervraag en communicatiedoel;
- 3.2 alleen wanneer later expliciet migratie/historie wordt behandeld.

## 2. C4 kernniveaus — bron bevestigd

De actuele officiële C4-documentatie noemt nog steeds de vier kern-diagrammen:

1. System Context;
2. Container;
3. Component;
4. Code.

Daarmee blijft bronleerdoel 1 valide.

Belangrijke actuele nuance:

- je hoeft niet alle vier niveaus te gebruiken;
- alleen niveaus die waarde toevoegen zijn nodig;
- System Context en Container zijn voor veel teams al voldoende;
- Component en Code zijn optioneel wanneer ze geen extra waarde leveren.

De adaptive Module 5-content leert daarom expliciet dat **meer detail niet automatisch beter is**.

## 3. C4 System Landscape — verrijking, geen nieuwe verplichte mastery

De officiële C4-documentatie bevat daarnaast een ondersteunend **System Landscape diagram** voor de vraag hoe software-systemen binnen een organisatie of breder landschap samenhangen.

Dat is inhoudelijk relevant voor de Solution Architect-vraag:

> “Hoe past deze oplossing in ons landschap?”

Besluit:

- System Landscape wordt als verdieping/voorbeeld gebruikt;
- het wordt niet toegevoegd als extra verplicht leerdoel of aparte toetscategorie;
- de vier bron-kernniveaus blijven de verplichte basis.

Zo wordt de bron niet stil vervangen door externe content, maar wel professioneel geactualiseerd.

## 4. Bronvraag over wethouder — formulering aangescherpt

De oorspronkelijke bronvraag motiveerde het vermijden van een containerdiagram met de formulering dat de wethouder “niet over componenten beslist”.

Dat is conceptueel ongelukkig: een **Container diagram** toont containers/applicaties/datastores, niet C4 Components.

De nieuwe Module 5-assessment gebruikt daarom de preciezere reden:

> het technische detailniveau sluit meestal niet aan op de vraag en beslissing van die stakeholder.

Hiermee blijft de didactische bedoeling behouden zonder C4-termen door elkaar te halen.

## 5. C4 versus ArchiMate 4 — PASS

De module presenteert deze niet als elkaar uitsluitende standaarden.

C4 wordt gebruikt voor heldere zoomniveaus rond software-/oplossingsstructuur. ArchiMate 4 wordt gebruikt om bredere architectuurrelaties en stakeholdergerichte views te modelleren. De cursist leert een modelkeuze maken op basis van vraag en publiek.

Dit sluit aan bij het huidige C4-principe dat de notatie onafhankelijk is en dat C4-diagrammen ook met andere notaties kunnen worden weergegeven.

## 6. Adaptive ontwerp — PASS

Sterk ten opzichte van Module 6:

- geen mechanische herhaling van vier open intakevragen;
- drie scenarioselecties + één motivatie passen beter bij modelkeuze;
- eigen misconceptions voor visualisatie/modellering;
- progressive architecture canvas in plaats van trade-offmatrix;
- mobile krijgt een andere taakrepresentatie;
- Eva blijft challenger;
- Alexander legt uit;
- media nog niet genereren vóór UX-review.

## 7. Open vóór runtime-integratie

- server-side diagnose-/answer-key contract;
- deterministic tutor-observation rubrics voor vrije tekst;
- progressive architecture canvas component;
- UX/UI-review van desktop + mobile information order;
- runtime aansluiten op generieke moduledefinitie;
- retrospective na implementatie.

## Gate

**Inhoudelijke Module 5-review: PASS.**  
**Module 5-config: READY FOR RUNTIME IMPLEMENTATION.**  
**Productie: NO-GO.**
