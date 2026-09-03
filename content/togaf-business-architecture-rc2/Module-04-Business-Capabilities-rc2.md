# Module 4 — Business Capabilities

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. De capabilitycodes in deze module zijn lescodes en geen officieel TOGAF-referentiemodel.

## Leerprestatie

Na deze module kun je business capabilities definiëren, afbakenen, structureren en analyseren. Je onderscheidt capability van proces, organisatieonderdeel en applicatie, kunt people/processes/information/resources als realisatiecomponenten uitleggen, gebruikt heat mapping bewust en legt relaties naar value streams, processen en organisatie vast zonder één-op-éénrelaties te veronderstellen.

## 1. Een vermogen afbakenen

Een business capability beschrijft een vermogen dat de organisatie nodig heeft om een doel of waarde te ondersteunen. Het gaat om wat de business in staat moet zijn te doen, los van één huidige medewerker, processtap of applicatie.

Neem `Schade beoordelen`. In deze casus betekent dit dat Aurora relevante feiten en aanspraak kan vaststellen om een gemotiveerd claimbesluit te nemen. Betaling uitvoeren valt erbuiten. Dat kan vandaag in hetzelfde team gebeuren, maar het blijft een ander vermogen.

Relatief stabiel betekent niet onveranderlijk. Nieuwe strategie, producten of regelgeving kunnen nieuwe capabilities vragen of grenzen veranderen. Een capabilitylabel alleen is onvoldoende; de definitie en grens moeten duidelijk zijn.

## 2. Capability, proces, organisatie en applicatie onderscheiden

| Beschrijving | Interpretatie | Waarom |
|---|---|---|
| Schade beoordelen | Business capability | Vermogen om een onderbouwd oordeel te vormen. |
| Expert raadplegen na een signaal | Procesactiviteit | Een gekozen manier om werk uit te voeren. |
| Team Schade Expertise | Organisatieonderdeel | Een groep mensen die aan capabilities kan bijdragen. |
| ClaimApp | Applicatie | Een middel dat delen van het werk ondersteunt. |

Dezelfde woorden kunnen in verschillende contexten iets anders betekenen. `Beoordeling` kan resultaat, activiteit of vermogen aanduiden. Vraag daarom altijd wat het model bedoelt en welke grens geldt.

Een business function groepeert verwant werk of verantwoordelijkheid vanuit een gekozen organisatieperspectief. Een capabilitymodel probeert vermogens herkenbaar te houden wanneer organisatie of uitvoering verandert. Beide perspectieven kunnen elkaar aanvullen maar zijn niet universeel uitwisselbaar.

**Aanvultaak.** Herschrijf `medewerker opent ClaimApp en controleert veld 7` als kandidaat-capability zonder de huidige uitvoering vast te zetten. Een mogelijke formulering is `relevante claiminformatie beoordelen`, maar ook die moet nog worden afgebakend: relevant waarvoor en met welk resultaat?

## 3. Exam core — realisatiecomponenten van capabilities

De TOGAF Series Guide Business Capabilities onderscheidt vier belangrijke componenten voor de realisatie van een capability:

- **People** — mensen, rollen, kennis en vaardigheden;
- **Processes** — werkwijzen en activiteiten;
- **Information** — informatie die nodig is of wordt voortgebracht;
- **Resources** — overige middelen die de capability ondersteunen.

Deze componenten zijn niet de capability zelf. Aurora kan `Schade beoordelen` behouden wanneer processen, rollen, informatievoorziening of ondersteunende resources veranderen. Juist daardoor helpt capabilitydenken bij strategische verandering: de vraag wat de business moet kunnen blijft zichtbaar terwijl realisatie kan wijzigen.

## 4. Een capabilitycatalogus maken

Voor Aurora leggen we per capability een identifier, naam, definitie en uitsluiting vast.

| ID | Naam | Definitie | Buiten deze grens |
|---|---|---|---|
| C1 | Schade beoordelen | Feiten en aanspraak vaststellen voor een gemotiveerd claimbesluit. | Betaling uitvoeren. |
| C2 | Schade uitkeren | Een vastgestelde geldelijke vergoeding correct uitvoeren en afwikkelen. | De aanspraak inhoudelijk opnieuw bepalen. |
| C3 | Fraude detecteren | Signalen van mogelijke misleiding herkennen en gericht laten onderzoeken. | Een signaal zonder onderzoek als bewezen fraude behandelen. |
| C4 | Schadeverzoeken innemen | Een verzoek herkenbaar vastleggen en naar behandeling geleiden. | De inhoudelijke claimbeoordeling afronden. |
| C5 | Klantcommunicatie verzorgen | Begrijpelijke en herleidbare uitleg over status, besluit en vervolg mogelijk maken. | Eén communicatiekanaal gelijkstellen aan de hele capability. |

Deze beperkte catalogus dekt alleen de oefenscope. Dat HR of polisproductbeheer niet wordt getoond, betekent niet dat die capabilities niet bestaan.

C4 en C5 zijn kandidaat-capabilities binnen de oefening. In een echte repository moet worden onderzocht of hetzelfde vermogen al onder een ander label bestaat voordat een nieuwe capability wordt toegevoegd.

## 5. Capability mapping: top-down en bottom-up

Een starterset van capabilities kan op verschillende manieren worden gevonden.

**Top-down:** vertrek bijvoorbeeld vanuit strategie, businessmodel, value propositions en gewenste waarde. Vraag welke vermogens de organisatie nodig heeft om die richting te realiseren.

**Bottom-up:** onderzoek bestaand werk, processen, services, teams en systemen en abstraheer daaruit stabielere vermogens.

Geen van beide routes ontslaat de architect van normalisatie. Controleer doublures, definities, grenzen en consistent niveau. Een bottom-upmodel dat alleen huidige afdelingen hernoemt is geen capabilitymap; een top-downmodel met alleen ambitieuze labels zonder operationele betekenis evenmin.

## 6. Decompositie, stratificatie en leveling

Bij decompositie verfijn je een capability in samenhangende deelvermogens. De kinderen moeten uitleggen wat nodig is voor de oudercapability zonder alleen een procesvolgorde, teams of applicaties te kopiëren.

Binnen de oefening plaatsen we `C1 Schade beoordelen` als L2-capability. Een mogelijke L3-uitwerking:

| ID | Deelvermogen | Bijdrage en grens |
|---|---|---|
| C1.1 | Schadefeiten vaststellen | Relevante feiten voldoende onderbouwen; nog geen dekkingsbesluit. |
| C1.2 | Aanspraak bepalen | Feiten en polisgrondslag verbinden aan dekking en omvang. |
| C1.3 | Besluit onderbouwen | Oordeel, gebruikte grondslag en motivering samenhangend vastleggen. |

Deze indeling is een modelvoorstel, geen bewezen universele taxonomie. Vakdeskundigen kunnen bijvoorbeeld besluiten dat bedragbepaling apart moet worden gemodelleerd.

**Stratificatie** helpt capabilities logisch groeperen naar gekozen categorieën of perspectieven. **Leveling** maakt de decompositiehiërarchie zichtbaar. Voeg geen extra niveau toe alleen omdat een tool dat kan; ieder niveau moet een analytische functie hebben.

**Foutvoorbeeld.** `Maandagteam`, `Dinsdagteam` en `ClaimApp` zijn geen L3-capabilities onder Schade beoordelen. Ze mengen organisatie en middelen met het vermogen.

## 7. Heat mapping met expliciete beoordelingslens

Een heat map legt een gekozen criterium over een capability map. Voorbeelden:

- strategische bijdrage;
- performance/effectiveness;
- criticality;
- risico;
- veranderbehoefte.

De kleur is geen argument. Eerst moet duidelijk zijn **wat** wordt beoordeeld en op basis van welk bewijs.

Voor deze oefening gebruiken we bijvoorbeeld geen officiële maturityschaal, maar fictieve beoordelingsankers voor geborgde uitvoering. Onbekend blijft een aparte status en wordt niet automatisch als laagste score ingevuld.

| Capability | Fictief bewijs | Voorlopige conclusie | Wat ontbreekt? |
|---|---|---|---|
| C1 | Werkinstructie bestaat; slechts enkele dossiers onderzocht. | Werkwijze bestaat, organisatiebrede naleving onbekend. | Representatiever bewijs. |
| C5 | In geselecteerde dossiers wacht uitleg na intern besluit. | Prestatieprobleem aannemelijk in deze selectie. | Omvang, oorzaken en ernst breder onderzoeken. |
| C2 | Enkele betalingen mislukken en worden handmatig hersteld. | Herstel bestaat; eindresultaat vertraagt in die gevallen. | Oorzaak en impact analyseren. |

Dezelfde capability kan in een heat map op `strategische bijdrage` een andere kleur hebben dan op `performance`. Daarom moet de legenda altijd criterium en betekenis benoemen.

## 8. Relationship mapping

Capabilities krijgen extra betekenis wanneer relaties met andere architectuurperspectieven zichtbaar worden. Belangrijke voorbeelden:

- capability ↔ organization;
- capability ↔ value stream;
- capability ↔ business process.

`C5 Klantcommunicatie verzorgen` kan bijvoorbeeld door meerdere teams worden gerealiseerd, aan meerdere value stages bijdragen en door verschillende processen worden uitgevoerd. Maak daarom geen automatische één-op-éénrelatie tussen capability en afdeling, capability en stage of capability en proces.

In module 5 wordt vooral capability ↔ value stream uitgewerkt. Module 6 verdiept capability ↔ information en organization.

## 9. Van capabilityanalyse naar prioriteit

Een verdedigbare prioritering benoemt:

- welk businessresultaat of welke stakeholderwaarde wordt geraakt;
- welk bewijs beschikbaar is;
- ernst en onzekerheid;
- afhankelijkheden met andere capabilities;
- uitvoerbaarheid van verandering.

Gebruik geen fictieve gewichten om schijnprecisie te creëren. Wanneer de gegevens onvoldoende zijn, kan gericht onderzoek zelf de eerste prioriteit zijn.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Waarom zijn people, processes, information en resources geen vier subcapabilities?
2. Wanneer kan top-down identificatie nuttig zijn en wanneer bottom-up?
3. Wat is het verschil tussen leveling en heat mapping?
4. Waarom kan dezelfde capability in twee heat maps een andere kleur hebben?
5. Welke drie relationship mappings moet je kunnen herkennen?
6. Waarom is een applicatievervanging geen reden om automatisch een capability uit het model te verwijderen?

## Zelfstandige opdracht — Nova

Maak een beperkte capabilitycatalogus voor Nova's leenlaptopdienst. Neem minimaal op:

- middelen plannen;
- apparaten gereedmaken;
- toegang verzorgen;
- deelnemers informeren.

Decomponeer één capability tot bruikbare deelvermogens. Beschrijf voor één capability afzonderlijk:

1. people/processes/information/resources;
2. één gekozen heat-mapcriterium;
3. minimaal twee relaties met andere perspectieven.

Fictief gegeven: bij drie onderzochte starts was een laptop aanwezig maar vereiste toegang werkte niet. De selectie is niet representatief. Formuleer een onderzoeksprioriteit zonder organisatiebrede percentages te verzinnen.

### Beoordelingscriteria

- Capabilities zijn onderscheiden van teams, handelingen en applicaties.
- Definities hebben doel en afbakening.
- Decompositie is samenhangend en vermijdt doublures.
- Realisatiecomponenten zijn niet verward met capabilitylevels.
- Onbekend bewijs wordt niet als lage score gepresenteerd.
- Prioriteit volgt uit waarde, bewijs en afhankelijkheden.
- Relationship mapping is inhoudelijk onderbouwd.

### Vrijgegeven voorbeeldredenering

`Toegang verzorgen` kan worden verfijnd in benodigde toegang bepalen, toegang beschikbaar maken en toegang verifiëren, mits de grenzen met registratie en beheer helder zijn. De drie gevallen wijzen op een te onderzoeken tekort rond bruikbare toegang, niet op een bewezen organisatiebrede foutkans. Onderzoek configuratie, accountstatus en overdracht voordat nieuwe reserveringssoftware als oplossing wordt gekozen.

## Zelftoets — 6 formatieve vragen

### Vraag 1

Welke formulering benoemt het duidelijkst een business capability?

- A. Een behandelaar klikt op akkoord.
- B. Het Schadeportaal.
- C. Schade beoordelen.
- D. Team Klantondersteuning.

### Vraag 2

Waarom is een capability niet automatisch gelijk aan één proces?

- A. Capabilities mogen geen processen ondersteunen.
- B. Een vermogen kan via verschillende uitvoeringsroutes worden gerealiseerd.
- C. Processen zijn altijd kleine taken.
- D. Iedere afdeling heeft precies één capability.

### Vraag 3

Welke decompositie past het beste onder `Schade beoordelen`?

- A. Schadeportaal, Polisdatabase, E-mailserver.
- B. Team Noord, Team Zuid, Team Oost.
- C. Schadefeiten vaststellen, aanspraak bepalen, besluit onderbouwen.
- D. Ontvangen, beoordelen, betalen als verplichte procesvolgorde.

### Vraag 4

Er zijn geen gegevens over de huidige performance van een capability. Welke aanduiding past het beste?

- A. Onbekend, met een gerichte informatievraag.
- B. Automatisch de laagste score.
- C. Automatisch gemiddeld.
- D. De kleur van de naastgelegen capability.

### Vraag 5

Wat beschrijven people, processes, information en resources in relatie tot een capability?

- A. Mogelijke componenten waarmee het vermogen wordt gerealiseerd.
- B. Vier verplichte hiërarchische capabilitylevels.
- C. Vier ADM-fasen.
- D. Vier soorten value stages.

### Vraag 6

Waarom krijgt een heat map een expliciet criterium en legenda?

- A. Omdat kleur anders zonder betekenis en bewijscontext wordt geïnterpreteerd.
- B. Omdat TOGAF precies één universele kleurcodering voorschrijft.
- C. Om discussie onmogelijk te maken.
- D. Om onbekende data automatisch te berekenen.

## Naar module 5

Neem de definities C1–C5, de decompositie en de capabilityrelaties mee. Module 5 laat zien hoe dezelfde capabilities in verschillende value stages bijdragen aan stakeholderwaarde en hoe heat mapping op stage-capabilityrelaties een andere analyse is dan heat mapping op een losse capabilitymap.

## Bronbasis

- The Open Group, TOGAF Series Guide: Business Capabilities, Version 2 (G211).
- X2202 Business Capabilities learning unit.
- EAW e-learningontwerpmethode v4.
