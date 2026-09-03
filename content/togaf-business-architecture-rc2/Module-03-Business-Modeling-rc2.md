# Module 3 — Business Modeling

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. De training gebruikt het Business Model Canvas als concrete werkvorm; dat canvas is niet hetzelfde als het begrip businessmodel zelf.

## Leerprestatie

Na deze module kun je een businessmodel in samenhang analyseren, de negen Business Model Canvas-bouwblokken gebruiken zonder ze als losse vakken te behandelen, aannames van bewijs onderscheiden en uitleggen hoe businessmodelkeuzes architectuurvragen oproepen. Je kunt een mogelijke inconsistentie onderbouwen zonder schijnzekerheid en een model gebruiken als input voor Business Architecture.

## 1. Een businessmodel verklaart samenhang

Een businessmodel beschrijft hoe een organisatie waarde creëert, levert en economisch mogelijk maakt. Het gaat niet alleen om inkomsten. Doelgroepen, propositie, relaties, kanalen, activiteiten, resources, partners, kosten en opbrengsten moeten samen een geloofwaardige logica vormen.

Bij publieke of collectief gefinancierde dienstverlening kunnen betaler en ontvanger verschillende partijen zijn. Zet daarom niet automatisch degene die waarde ontvangt gelijk aan degene die betaalt.

Een businessmodel helpt strategische aannames en onderlinge afhankelijkheden zichtbaar maken. Daarmee kan de architect gerichter onderzoeken welke capabilities, informatie, organisatiekeuzes en veranderingen nodig zijn. Het model bewijst echter niet dat de markt, doelgroep of operationele inrichting de aannames werkelijk bevestigt.

**Instapvraag.** Aurora belooft snellere afhandeling en wil geen extra applicatie kopen. Is dat automatisch inconsistent? Nee. Een betere werkwijze met bestaande middelen kan dezelfde propositie misschien ondersteunen. Of dat haalbaar is, vraagt bewijs.

## 2. Exam core — representatie en rol in architectuur

Een businessmodel kan in verschillende representatievormen worden vastgelegd: narratief, tabulair, visueel of via een canvas. De vorm is niet het doel. Het model moet de relevante samenhang zichtbaar maken.

In deze training gebruiken we het Business Model Canvas (BMC) als concrete werkvorm. Een BMC is dus een manier om een businessmodel te representeren, niet het businessmodelbegrip zelf.

Business Modeling en Business Architecture beantwoorden verschillende vragen. Het businessmodel maakt onder meer propositie, doelgroepen en economische logica expliciet. Business Architecture werkt vervolgens uit welke capabilities, value streams, informatie- en organisatierelaties nodig zijn om die logica te ondersteunen. Er bestaat geen automatische één-op-éénvertaling van elk BMC-vak naar één architectuurelement.

## 3. De negen BMC-bouwblokken

| Bouwblok | Centrale vraag | Veelvoorkomende verwarring |
|---|---|---|
| Customer Segments | Voor welke groepen maken we het aanbod? | Een kanaal als doelgroep opschrijven. |
| Value Propositions | Welke relevante behoefte bedienen we met welke waarde? | Alleen een productnaam noemen. |
| Channels | Hoe bereiken we de doelgroep en leveren we het aanbod? | Het kanaal als complete dienstverlening behandelen. |
| Customer Relationships | Welke relatie en begeleiding organiseren we? | Alleen contactmiddelen opsommen. |
| Revenue Streams | Waar komt vergoeding of opbrengst vandaan? | Betaler en eindgebruiker automatisch gelijkstellen. |
| Key Resources | Welke resources zijn wezenlijk nodig? | Alles opsommen zonder relevantie. |
| Key Activities | Welk werk is wezenlijk voor het aanbod? | Activiteiten zonder analyse als capabilities hernoemen. |
| Key Partnerships | Welke partners leveren relevante bijdragen? | Iedere leverancier als strategische partner benoemen. |
| Cost Structure | Welke kostenstructuur maakt uitvoering mogelijk? | Alleen applicatiekosten meenemen. |

Een vak is pas bruikbaar als de inhoud concreet genoeg is om relaties te onderzoeken. `Klanten` als segment en `kwaliteit` als value proposition bieden te weinig houvast.

## 4. Aurora als uitgewerkt fictief businessmodel

De volgende invulling is een ontwerpvariant voor Aurora Schade. Zij is geen marktvalidatie en bevat geen voorspelling over premie, winst of prestaties.

| Bouwblok | Oefeninvulling |
|---|---|
| Customer Segments | Particuliere huishoudens met behoefte aan begrijpelijke schadeverzekering en ondersteuning bij eenvoudige claims. |
| Value Propositions | Begrijpelijke dekking en voorspelbare behandeling; een gemotiveerd besluit en bij dekking een correct gerealiseerde vergoeding. |
| Channels | Digitale omgeving en telefonisch contact voor uitleg en ondersteuning. |
| Customer Relationships | Zelfservice waar passend, met bereikbare ondersteuning bij onduidelijkheid of uitzonderingen. |
| Revenue Streams | Premie-inkomsten uit verzekeringen; geen bedragen of rendement in deze oefening. |
| Key Resources | Deskundige medewerkers, polis- en claiminformatie, financiële middelen en ondersteunende voorzieningen. |
| Key Activities | Aanbod beheren, claims innemen, beoordelen, uitkeren en klanten informeren. |
| Key Partnerships | Expertisebureaus en betalingsdienstverleners voor afgebakende bijdragen. |
| Cost Structure | Onder meer schadevergoedingen, behandeling, ondersteuning, expertise en informatievoorziening. |

De propositie noemt begrijpelijkheid en voorspelbaarheid. Daarom moet ondersteuning in de rest van het model terugkomen. Claims beoordelen vraagt betrouwbare informatie en deskundigheid. Een geldelijke vergoeding vraagt uitvoerbare financiële afhandeling. De bouwblokken ondersteunen dus dezelfde logica.

Premie-inkomsten en schade-uitgaven vormen nog geen getoetst economisch model. Om levensvatbaarheid te beoordelen zijn aanvullende gegevens nodig over omvang, risico, kosten en opbrengsten. Deze module leert vooral ontbrekende informatie en relaties herkennen; zij rekent geen verzekeringsproduct door.

## 5. Consistentie beoordelen zonder schijnzekerheid

Gebruik drie verschillende oordelen:

- **tegenstrijdig** — twee expliciete aannames of afspraken kunnen niet samen gelden;
- **informatie ontbreekt** — er is nog onvoldoende bewijs voor een oordeel;
- **aannemelijk maar te toetsen** — de redenering kan kloppen maar is nog niet bevestigd.

### Geval A — echte interne spanning

Aurora stelt dat iedere claim vóór afronding persoonlijk telefonisch wordt toegelicht. Tegelijk bepaalt dezelfde oefenvariant dat er geen menselijke ondersteuning beschikbaar is en ieder contact uitsluitend automatisch verloopt. Dit is een concrete spanning tussen belofte en inrichting.

### Geval B — onvolledig, niet tegenstrijdig

Aurora biedt zelfservice met ondersteuning indien nodig. Er staat nog niets over benodigde personeelscapaciteit. Dat is onvolledig; het ontbreken van een berekening bewijst niet dat ondersteuning onmogelijk is.

### Geval C — aannemelijk maar nog te toetsen

Aurora wil snellere afhandeling zonder nieuwe applicatie. Er zijn aanwijzingen dat dossiers tussen teams wachten, maar de oorzaak is nog niet onderzocht. Een proces- of verantwoordelijkheidsverbetering kan helpen, maar dat moet worden getest.

Een goede review volgt relaties tussen bouwblokken. Vraag bijvoorbeeld of het gekozen channel de doelgroep bereikt, of de relationship-vorm door resources en kosten wordt gedragen en of partners werkelijk de benodigde bijdrage kunnen leveren.

## 6. Gestructureerde businessmodelinnovatie

De TOGAF Series Guide Business Models beschrijft businessmodelinnovatie als een gestructureerde ontwerp- en leeractiviteit. Voor deze training gebruiken we de volgende didactische parafrase:

1. observeer omgeving en huidige businessmodellogica;
2. formuleer expliciete hypotheses over een toekomstige businessmodellogica;
3. werk alternatieven of prototypes uit;
4. test de belangrijkste aannames waar mogelijk;
5. bevestig of verwerp hypotheses en pas het model aan;
6. concretiseer de gekozen richting voldoende voor architectuur, planning en implementatie.

De structuur voorkomt dat een aantrekkelijk idee direct als bewezen targetmodel wordt behandeld. Innovatie mag iteratief zijn; een hypothese die niet standhoudt is leerinformatie, geen reden om bewijs te negeren.

## 7. Van businessmodel naar Business Architecture

Een businessarchitect vertaalt het model niet mechanisch naar een ander diagram. Hij gebruikt uitspraken als bron voor gerichte architectuurvragen.

| Uitspraak in businessmodel | Architectuurvraag | Volgende uitwerking |
|---|---|---|
| Begrijpelijke claimuitleg | Wat moet de verzekerde op welk moment ontvangen of begrijpen? | Value stream. |
| Deskundige beoordeling | Welk vermogen moet beschikbaar zijn? | Business capability. |
| Herleidbare informatie | Welke businessbegrippen en relaties zijn nodig? | Information Mapping. |
| Teams en partners ondersteunen | Wie draagt bij en wie is verantwoordelijk? | Organization Mapping. |
| Sneller zonder kwaliteitsverlies | Welk concreet probleem en welke requirements onderzoeken we? | Business Scenario. |

`Claims beoordelen` kan als activity in het BMC staan. Om er een capability van te maken, moet je het vermogen afbakenen: wat moet Aurora kunnen, waarvoor en wat valt erbuiten? Alleen het label grammaticaal aanpassen is geen architectuurmodel.

Let op de scope. De claimvalue stream uit module 5 maakt niet het hele businessmodel zichtbaar. Het afsluiten van een verzekering is bijvoorbeeld een andere waardestroom.

## 8. Oefenen, feedback en herziening

**Aanvultaak.** Een model bevat alleen `particulieren`, `verzekering` en `portaal`. Formuleer welke informatie ontbreekt voordat je samenhang kunt beoordelen. Vraag naar de value proposition, relatievorm, economische logica, benodigde resources en uitvoering. Zeg niet dat dit fragment bewijst dat de rest van het businessmodel niet bestaat.

**Zelfcontrole.** Kies één belofte uit het Aurora-model. Wijs de benodigde activity, resource, relationship-vorm en kostenpost aan. Staat één relatie alleen op basis van een aanname? Markeer die aanname en beschrijf hoe je haar zou toetsen.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Waarom is een Business Model Canvas niet hetzelfde als het begrip businessmodel?
2. Welke toegevoegde waarde heeft een businessmodel voor Business Architecture?
3. Waarom bewijst een intern consistent businessmodel nog niet dat klanten de propositie waarderen?
4. Wat is het verschil tussen een hypothese over een toekomstig businessmodel en een gevalideerd targetbesluit?

## Zelfstandige opdracht — Nova

Ontwerp een businessmodel voor Nova's leenlaptopdienst.

Casusafspraken:

- het leercentrum betaalt uit het opleidingsbudget;
- deelnemers betalen niet per lening;
- Nova gebruikt eigen apparaten en kan een partner inzetten bij pieken;
- bruikbaar kunnen deelnemen is de beoogde waarde.

Vul de negen bouwblokken in. Markeer aanvullende aannames en toets minimaal drie relaties tussen bouwblokken. Beoordeel afzonderlijk of `geen extra software kopen` strijdig is met de propositie.

Voeg één extra analyse toe: **welke aanname in jouw businessmodel heeft de grootste architectuurimpact wanneer zij onjuist blijkt?**

### Beoordelingscriteria

- Financier en ontvanger zijn onderscheiden.
- Alle bouwblokken zijn concreet genoeg voor beoordeling.
- Relaties zijn beredeneerd vanuit de value proposition.
- Onvolledigheid en tegenstrijdigheid worden onderscheiden.
- Aannames hebben toetsvragen.
- Architectuurimpact van een kritieke aanname is beredeneerd.

### Vrijgegeven voorbeeldredenering

De deelnemer ontvangt de bruikbaarheid, terwijl het opleidingsbudget financiert. Resources zijn apparaten, toegang en ondersteuning; activities omvatten beschikbaarheid plannen, gereedmaken en uitgifte. Kosten omvatten aanschaf/afschrijving, beheer en ondersteuning. Een partner kan piekcapaciteit leveren als afspraken, apparaten en toegang dat mogelijk maken. Geen nieuwe software is niet automatisch strijdig: onderzoek of bestaande reservering en werkwijze de propositie kunnen dragen.

## Zelftoets — 4 formatieve vragen

### Vraag 1

Nova heeft deelnemers als gebruikers en een fonds als betaler. Wat moet het businessmodel zichtbaar maken?

- A. Gebruiker en betaler zijn altijd hetzelfde segment.
- B. Alleen de laptopmerken.
- C. De verschillende waarde-, relatie- en financieringsrollen.
- D. Alleen de interne afdelingen.

### Vraag 2

Welke combinatie bevat uitsluitend BMC-bouwblokken?

- A. Value streams, exitcriteria, capabilities.
- B. Customer Segments, Value Propositions, Revenue Streams.
- C. Servers, tabellen, API-methoden.
- D. Architecture Vision, Implementation Governance, Change Management.

### Vraag 3

Aurora belooft persoonlijke uitleg maar sluit expliciet alle menselijke ondersteuning uit. Wat kun je verantwoord concluderen?

- A. De propositie is zeker winstgevend.
- B. Menselijke ondersteuning is altijd verplicht.
- C. Er is een interne spanning tussen belofte en gekozen inrichting.
- D. Alle digitale uitleg is onbruikbaar.

### Vraag 4

Wat laat een ingevuld BMC op zichzelf nog niet zien?

- A. Dat de aannames over vraag, kosten en opbrengsten empirisch zijn bevestigd.
- B. Welke value proposition is voorgesteld.
- C. Welke partners in het voorstel voorkomen.
- D. Welke revenue streams zijn verondersteld.

## Naar module 4

Neem uit je businessmodel vooral de onderbouwde behoeften en kritieke aannames mee. Module 4 vertaalt activiteiten niet blind naar capabilities, maar onderzoekt welke stabielere vermogens Nova en Aurora werkelijk nodig hebben.

## Bronbasis

- The Open Group, TOGAF Series Guide: Business Models (G18A).
- X2202 Business Modeling learning unit.
- Strategyzer, Business Model Canvas als gebruikte concrete werkvorm.
