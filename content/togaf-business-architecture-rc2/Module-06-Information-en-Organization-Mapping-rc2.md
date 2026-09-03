# Module 6 — Information en Organization Mapping

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. Information Mapping en Organization Mapping worden in één module verbonden omdat overdrachten beide perspectieven raken; voor examendoeleinden blijven de technieken expliciet van elkaar onderscheiden.

## Leerprestatie

Na deze module kun je businessinformatieconcepten en relaties modelleren, information maps onderscheiden van data models, organization maps onderscheiden van organization charts en beide technieken verbinden aan capabilities, value streams en ADM-toepassing. Je kunt een overdrachtsprobleem analyseren vanuit betekenis én verantwoordelijkheid zonder applicatievelden of organogrammen als volledige businessarchitectuur te behandelen.

## 1. Begin bij betekenis, niet bij schermvelden

Information Mapping maakt relevante businessinformatie en samenhang expliciet. Het is niet alleen een lijst documenten en niet alleen input/output van processtappen. De techniek helpt stakeholders dezelfde businessbetekenis te gebruiken, los van één applicatie.

Bij Aurora gebruiken twee teams het woord `polis`. Het ene bedoelt de verzekeringsafspraak; het andere het pdf-document waarin een versie van die afspraak staat. Wanneer dat verschil niet wordt opgelost, kan een requirement als `de polis moet vindbaar zijn` twee verschillende betekenissen hebben.

**Instapvraag.** Is een klantnummer hetzelfde als de klant? Nee. Een klantnummer is een identificerend gegeven binnen een context. De architect moet weten welk businessconcept wordt geïdentificeerd, welke relaties relevant zijn en wie dezelfde betekenis gebruikt.

## 2. Exam core A — Information Mapping

### Wat is een information map?

Een information map helpt zichtbaar maken welke betekenisvolle informatieconcepten de business nodig heeft, creëert of uitwisselt en hoe die concepten samenhangen met andere Business Architecture-perspectieven.

De nadruk ligt op businessbetekenis. Een information concept hoeft niet één-op-één gelijk te zijn aan een database-entiteit, document of berichtveld.

### Waarom is Information Mapping nuttig?

De techniek kan helpen:

- verschillende betekenissen voor hetzelfde woord zichtbaar maken;
- informatiebehoeften van capabilities en value stages expliciteren;
- overdrachtsproblemen analyseren;
- verantwoordelijkheid voor betekenis en kwaliteit bespreekbaar maken;
- Business Architecture verbinden met verdere Data Architecture.

### Information map versus data model

Een information map start vanuit zakelijke betekenis en relevante relaties. Een conceptueel of logisch data model kan die betekenis verder structureren in data-entiteiten, attributen, cardinaliteiten en regels. Een fysiek data model ligt dichter bij technische opslag.

De modellen kunnen op elkaar aansluiten, maar beantwoorden niet dezelfde vraag. Een businessconcept `Polis` is niet automatisch `POLIS_TABEL` en een pdf is niet automatisch het concept zelf.

### Gebruik binnen de ADM

In Phase A kan informatiecontext al relevant zijn voor scope en concerns. In Phase B kan Information Mapping Business Architecture verdiepen, vooral wanneer businessinformatie een belangrijke factor in capabilities en value streams is. De techniek kan vervolgens de aansluiting naar Data Architecture ondersteunen. De benodigde diepgang wordt getailord op de architectuurvraag.

## 3. Aurora — information concepts en relaties

De volgende definities zijn fictieve casusafspraken.

| Concept | Betekenis in de oefening | Niet hetzelfde als |
|---|---|---|
| Verzekerde | Partij voor wie de claim in deze scope wordt behandeld. | Een toevallig account of e-mailadres. |
| Polis | De verzekeringsafspraak waarop de beoordeling betrekking heeft. | Alleen het document waarin de afspraak staat. |
| Polisversie | Herleidbare versie van relevante polisafspraken die voor een beoordeling wordt gebruikt. | Altijd de actuele schermweergave. |
| Claim | Verzoek om schade onder een polis te beoordelen. | De eventuele betaling. |
| Besluit | Vastgelegd oordeel over aanspraak, met motivering en grondslag. | Een onverklaard statusvinkje. |
| Betaling | Uitvoering van een vastgestelde geldelijke vergoeding. | Het besluit dat vergoeding verschuldigd is. |
| Toelichting | Begrijpelijke uitleg van besluit of vervolgstap. | Alleen een technisch verzendlog. |

### Relaties in de oefenscope

Een claim betreft in deze eenvoudige casus één polis. Een polis kan meerdere claims hebben. Een claim kan nog geen besluit hebben of achtereenvolgens meerdere besluiten. Ieder besluit verwijst naar de claim en de gebruikte polisversie. Een besluit kan aanleiding geven tot geen, één of meerdere betalingen. Eén besluit kan meerdere toelichtingen hebben, bijvoorbeeld oorspronkelijke uitleg en latere verduidelijking.

Deze cardinaliteiten zijn casuskeuzes. In een echte organisatie moeten zij met domeinexperts worden gevalideerd.

Waarom zo expliciet? Wanneer claim en betaling worden samengevoegd verdwijnen afgewezen claims uit het model. Wanneer een besluit alleen naar de actuele polis verwijst kan de historische grondslag verloren gaan. Wanneer `Toelichting` alleen een verzendstatus is, wordt begrijpelijkheid onzichtbaar.

## 4. Informatie verbinden aan value stages en capabilities

| Value stage | Capability | Relevante informatie | Kwaliteitsvraag |
|---|---|---|---|
| S1 Verzoek in behandeling genomen | C4 Schadeverzoeken innemen | Claim, contact, polisverwijzing. | Is het verzoek herleidbaar en is duidelijk wat ontbreekt? |
| S2 Aanspraak verduidelijkt | C1 Schade beoordelen | Feiten, claim, gebruikte polisversie, besluit. | Is de grondslag passend en motivering herleidbaar? |
| S2 Aanspraak verduidelijkt | C5 Klantcommunicatie verzorgen | Besluit, toelichting, afleverinformatie. | Wat bewijst aflevering en wat bewijst begrip? |
| S3 Vergoeding gerealiseerd | C2 Schade uitkeren | Besluit, betalingsafspraak, betaling, bevestiging. | Kloppen bedrag en ontvanger en is realisatie aangetoond? |

Een CRUD-matrix kan later helpen wie informatie creëert of gebruikt, maar begin niet met letters. Stel eerst vast welk concept en welke verantwoordelijkheid worden bedoeld.

**Aanvultaak.** Requirement: `bewaar het polisdocument bij de claim`. Wat is nog onzeker? Of dat document de gebruikte polisversie bevat, of besluit en grondslag herleidbaar blijven en of het document de relevante businessbetekenis voldoende vertegenwoordigt.

## 5. Exam core B — Organization Mapping

### Wat is een organization map?

Een organization map is een architectuurrepresentatie van relevante organisatie-entiteiten en relaties. Zij kan formele structuur tonen, maar ook bijdragen, verantwoordelijkheden, afhankelijkheden en relaties met andere architectuurperspectieven.

### Organization map versus organization chart

Een traditioneel organization chart toont primair formele hiërarchie: wie rapporteert aan wie en hoe organisatie-eenheden zijn gegroepeerd.

Een organization map kan breder analyseren:

- welke organisatieonderdelen aan capabilities bijdragen;
- welke partijen in value stages betrokken zijn;
- waar besluitbevoegdheid ligt;
- waar overdrachten of afhankelijkheden ontstaan;
- welke externe partijen architectuurrelevant zijn.

Een organogram kan dus input zijn, maar is niet automatisch voldoende voor architectuuranalyse.

### Relatie met andere architectuurperspectieven

Organization Mapping kan organisatie-eenheden verbinden aan capabilities, value streams, processen en information concepts. Waar relevant kunnen ook relaties naar applicatie- of technologiedomeinen worden onderzocht. Teken alleen relaties die een architectuurvraag ondersteunen; een volledig spinnenweb is geen kwaliteitsdoel.

### Gebruik binnen de ADM

In Phase A helpt een organization map stakeholders, scope en relevante organisatiecontext begrijpen. In Phase B kan de map worden verdiept om baseline- en targetverantwoordelijkheden en relaties te analyseren. De techniek ondersteunt de ADM en is niet automatisch een verplicht standaarddeliverable op dezelfde diepte voor iedere opdracht.

## 6. Aurora — organisatiebijdragen en verantwoordelijkheid

De volgende inrichting is fictief.

| Organisatieonderdeel | Bijdrage | Verantwoordelijkheid die moet worden afgesproken |
|---|---|---|
| Team Schade | C1 beoordelen en inhoud besluit. | Wie mag besluiten en bewaakt grondslag? |
| Klantondersteuning | C5 uitleg over status en vervolg. | Wie borgt tijdige en begrijpelijke aflevering? |
| Betalingsbeheer | C2 geldelijke afwikkeling. | Wie constateert en herstelt mislukte betaling? |
| Extern expertisebureau | Specialistische bijdrage aan C1.1 feiten vaststellen. | Wie vraagt onderzoek aan, accepteert resultaat en blijft verantwoordelijk voor het besluit? |

Een relatie tussen team en capability betekent niet dat het team automatisch exclusieve eigenaar is. C5 kan door meerdere organisatieonderdelen worden gerealiseerd. Kies bijdrage, besluitbevoegdheid en resultaatverantwoordelijkheid daarom afzonderlijk.

Een RACI of andere verantwoordelijkhedenmatrix kan helpen, maar is geen universele verplichte oplossing.

## 7. Eén overdrachtsprobleem met twee mappings analyseren

**Fictief knelpunt.** Team Schade noemt een dossier intern gereed wanneer het besluit is opgeslagen. Klantondersteuning krijgt niet in alle onderzochte gevallen de gebruikte grondslag of voldoende toelichting mee. Beide teams kunnen hun eigen taakstatus halen terwijl de verzekerde S2 nog niet bereikt.

Leg nu information map en organization map over elkaar:

- welk concept moet bij de overdracht behouden blijven?
- wie is verantwoordelijk voor de inhoud van het besluit?
- wie is verantwoordelijk voor begrijpelijke aflevering?
- wanneer gaat een inhoudelijke vraag terug naar Team Schade?
- welk bewijs laat zien dat de overdracht werkelijk werkt?

Een sterke verbeterafspraak kan zijn dat de overdracht naar Klantondersteuning een gemotiveerd besluit met herleidbare grondslag en vervolgstap bevat. Dit is een voorstel om te toetsen; zonder kennis van bestaande mandaten mag het niet als feitelijke huidige inrichting worden gepresenteerd.

**Foutvoorbeeld.** `Iedere afdeling krijgt een eigen klantbegrip en claimnummer, dan zijn modellen netjes gescheiden.` Verschillende identificaties kunnen bestaan, maar zonder expliciete semantische relaties neemt het risico op misverstanden toe.

## 8. Begrip, data, organisatie en verantwoordelijkheid uit elkaar houden

Veel architectuurfouten ontstaan doordat vier dingen door elkaar lopen:

1. **businessbetekenis** — wat betekent Claim of Polis?
2. **datarepresentatie** — hoe wordt die betekenis vastgelegd?
3. **organisatiebijdrage** — wie gebruikt of creëert informatie?
4. **verantwoordelijkheid** — wie beslist of borgt het resultaat?

Een applicatieveld kan correct gevuld zijn terwijl de businessdefinitie onduidelijk blijft. Een team kan formeel verantwoordelijk zijn maar de benodigde informatie niet ontvangen. Daarom moet de architect de lagen kunnen verbinden zonder ze gelijk te stellen.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Waarom is een information map niet hetzelfde als een fysiek data model?
2. Welke relatie kan een information concept hebben met een capability en value stage?
3. Wat toont een organization chart meestal wél, maar waarom is dat niet de volledige bedoeling van organization mapping?
4. Waarom kan dezelfde organisatie-eenheid aan meerdere capabilities of stages bijdragen?
5. Hoe kunnen Information Mapping en Organization Mapping samen een overdrachtsprobleem verklaren?
6. Wat is het verschil tussen bijdrage, besluitbevoegdheid en resultaatverantwoordelijkheid?

## Zelfstandige opdracht — Nova

Maak voor Nova:

### Information map

Gebruik minimaal:

- Deelnemer;
- Aanvraag;
- Reservering;
- Apparaat;
- Toegangsrecht;
- Uitgifte.

Definieer begrippen en relaties die nodig zijn om **bruikbare uitgifte** vast te stellen. Markeer aanvullende cardinaliteiten als casusafspraak wanneer ze niet gegeven zijn.

### Organization map

Neem minimaal op:

- Opleidingsadministratie;
- Middelenbeheer;
- IT-ondersteuning;
- eventueel externe uitgiftepartner.

Leg bijdragen, verantwoordelijkheden en overdrachten vast.

### Gecombineerde analyse

Onderzoek het geval waarin een apparaat correct is gereserveerd en fysiek aanwezig is, maar toegang ontbreekt. Toon minimaal één inconsistentie die zichtbaar wordt wanneer information- en organization-map naast elkaar worden gelegd. Label die als feit, hypothese of te valideren aanname.

### Beoordelingscriteria

- Businessconcepten zijn onderscheiden van documenten, velden en technische identifiers.
- Relaties zijn uitgelegd en aanvullende aannames herkenbaar.
- Informatiebehoeften sluiten aan op het waardemoment.
- Organisatiebijdrage en besluit-/resultaatverantwoordelijkheid zijn onderscheiden.
- De verbetering verbindt betekenis, overdracht en stakeholderresultaat.
- Feiten, hypotheses en aannames zijn expliciet gelabeld.

### Vrijgegeven voorbeeldredenering

Een `Reservering` koppelt in een mogelijke uitwerking deelnemer, studiedag en gereserveerd hulpmiddel; `Uitgifte` legt de daadwerkelijke overdracht vast. `Toegangsrecht` is niet hetzelfde als een gereserveerd apparaat. Middelenbeheer kan apparaatbeschikbaarheid verzorgen, IT ondersteunt werkende toegang en de administratie verifieert deelname. Zonder expliciete gezamenlijke controle kan ieder team afzonderlijk klaar zijn terwijl de deelnemer niet kan beginnen.

## Zelftoets — 6 formatieve vragen

### Vraag 1 — Information Mapping

Welke beschrijving past het beste bij een businessinformation concept?

- A. Het bestand polis-2026.pdf.
- B. Een SQL-index op polisnummer.
- C. Polis als zakelijke afspraak met afgesproken betekenis en relaties.
- D. De kleur van een polisvenster.

### Vraag 2 — Information Mapping

Waarom legt Aurora de gebruikte polisversie bij een besluit vast?

- A. Om de grondslag van dat besluit later te kunnen herleiden.
- B. Om iedere toekomstige poliswijziging te verbieden.
- C. Omdat een pdf altijd de enige betrouwbare bron is.
- D. Om geen besluitreden meer te hoeven vastleggen.

### Vraag 3 — Information Mapping

Wat is het beste onderscheid tussen information map en logisch data model?

- A. Een information map focust op businessbetekenis en relevante relaties; een logisch data model structureert data preciezer voor verdere informatiearchitectuur.
- B. Ze zijn per definitie exact hetzelfde.
- C. Een information map bevat alleen applicaties.
- D. Een logisch data model bevat alleen organisatiestructuur.

### Vraag 4 — Organization Mapping

Wat voegt Organization Mapping toe aan een traditioneel organogram?

- A. Alleen andere namen voor dezelfde vakken.
- B. Inzicht in architectuurrelevante bijdragen, verantwoordelijkheden en relaties.
- C. Een garantie dat alle teams voldoende capaciteit hebben.
- D. Een automatisch reorganisatiebesluit.

### Vraag 5 — Organization Mapping

Schade beslist; Klantondersteuning verzorgt uitleg. Wat moet expliciet worden gemaakt?

- A. Dat maar één team mag bestaan.
- B. Welke informatie wordt overgedragen en wie inhoud, aflevering en vervolgvragen borgt.
- C. Dat de applicatie automatisch alle verantwoordelijkheid overneemt.
- D. Alleen wie hiërarchisch hoger staat.

### Vraag 6 — Organization Mapping

Waarom kan een organization map in Phase A anders worden gebruikt dan in Phase B?

- A. Phase A gebruikt haar vooral voor high-level scope/stakeholders/context; Phase B kan verantwoordelijkheden en baseline/targetrelaties verder verdiepen.
- B. Organization Mapping mag alleen in Phase A worden gebruikt.
- C. Phase B gebruikt geen businessorganisaties.
- D. De ADM verbiedt hergebruik van modellen tussen fasen.

## Naar module 7

Module 7 gebruikt dezelfde informatie- en organisatiecontext om een concreet business scenario te formuleren. Neem vooral mee dat een scenario geen oplossing begint, maar probleem, actoren, omgeving en requirements expliciet maakt.

## Bronbasis

- The Open Group, TOGAF Series Guide: Information Mapping.
- The Open Group, TOGAF Series Guide: Organization Mapping.
- X2202 learning units Information Mapping en Organization Mapping.
- EAW e-learningontwerpmethode v4.
