# Module 5 — Value Streams

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. De value-streamindeling in deze module is een didactisch ontwerpvoorstel en geen voorgeschreven TOGAF-referentiemodel.

## Leerprestatie

Na deze module kun je een value stream afbakenen vanuit stakeholderwaarde, value stages ontwerpen met expliciete entry- en exitcriteria, value items benoemen, afwijkende routes behandelen en capabilities aan stages koppelen. Je kunt value stream, process, customer journey, value chain, value network en lean value stream onderscheiden en een stage-capability heat map interpreteren zonder de kleur als bewijs te behandelen.

De professionele opdracht gaat verder dan Foundation-herkenning: je moet de modelkeuzes onderbouwen, fouten herkennen en een transfercasus zelfstandig modelleren.

## 1. Van capability naar aantoonbare stakeholderwaarde

Je kunt weten dat Aurora schade kan beoordelen en uitkeren terwijl een verzekerde nog steeds niet weet waar hij aan toe is. Een capabilitycatalogus verklaart niet vanzelf hoe een stakeholder door de dienstverlening heen waarde ontvangt. Daarvoor gebruiken we een value stream.

Een value stream kijkt end-to-end naar het ontstaan van waarde voor een stakeholder. Zij helpt voorkomen dat intern gereed werk automatisch als gerealiseerde waarde wordt beschouwd.

**Instapdiagnose.** Beantwoord zonder terug te kijken:

1. Wat is het verschil tussen het vermogen `Schade beoordelen` en de manier waarop een medewerker dat vandaag uitvoert?
2. Is een betaalopdracht versturen hetzelfde als een vergoeding ontvangen?
3. Welke informatie ontbreekt wanneer iemand alleen zegt: `de beoordeling is afgerond`?

Wanneer je de eerste twee verschillen goed kunt uitleggen, kun je direct naar het Aurora-model. Bij twijfel lees eerst de begrippen in hoofdstuk 2.

## 2. Exam core — begrippen en modelgrenzen

### Value, value stream, stage en value item

**Value** gaat over de waarde die voor een stakeholder ontstaat. **Value stream** beschrijft hoe die waarde end-to-end wordt gerealiseerd. Een **value stage** is een betekenisvolle fase in die waarderealisatie. Een **value item** benoemt de specifieke waarde die in of door een stage wordt toegevoegd of zichtbaar wordt.

De stagegrens moet dus niet primair volgen uit het organogram of een technische status. Vraag: **wat is voor de stakeholder aantoonbaar veranderd?**

### Value stream versus process

Een process beschrijft hoe werk wordt uitgevoerd: activiteiten, volgorde, beslissingen, overdrachten en uitzonderingen. Een value stream beschrijft niet dezelfde werkelijkheid op een grover procesniveau; zij beantwoordt een andere vraag: hoe ontstaat stakeholderwaarde?

Een process kan meerdere value stages ondersteunen en één stage kan door meerdere processen worden gerealiseerd. Eén-op-één is geen standaardregel.

### Value stream versus customer journey

Een customer journey beschrijft de ervaring en interacties van een klant door een dienstverlening heen. Een value stream focust op de waarderealisatie. De modellen kunnen elkaar aanvullen. Een journey kan onzekerheid, emoties en contactmomenten zichtbaar maken; de value stream vraagt welke waarde op een stage daadwerkelijk moet ontstaan.

### Activiteit, resultaat en waarde

`Een e-mail versturen` is een activiteit. `Een besluitbericht is afgeleverd` is een resultaat. `De verzekerde kan begrijpen wat is besloten en welke vervolgstap mogelijk is` beschrijft de beoogde waarde.

Een technisch verzendbewijs bewijst dus niet automatisch begrijpelijkheid. Houd activiteit, interne output, extern resultaat en stakeholderwaarde uit elkaar.

## 3. Exam core — vier lenzen op value analysis

De TOGAF Series Guide Value Streams behandelt verschillende benaderingen met een ander zwaartepunt.

| Benadering | Primair perspectief | Kernvraag |
|---|---|---|
| **Business Architecture value stream** | End-to-end stakeholderwaarde | Welke value stages creëren uiteindelijk waarde voor de stakeholder? |
| **Value chain** | Economische waarde | Hoe dragen activiteiten bij aan kosten, marge en differentiatie? |
| **Value network** | Deelnemers en relaties | Welke partijen creëren en leveren samen waarde? |
| **Lean value stream** | Procesoptimalisatie | Hoe stroomt werk en waar zitten verspilling, wachttijd of andere verbeterkansen? |

De fout is niet dat één lens verkeerd is; de fout ontstaat wanneer je conclusies van de ene lens presenteert alsof je een andere analyse hebt uitgevoerd.

Voor Aurora:

- interne behandelkosten en economische bijdrage kunnen een value-chainlens vragen;
- relaties tussen verzekerde, expertisebureau en betalingsdienstverlener kunnen met een value-networklens worden onderzocht;
- wachttijden en verspilling kunnen een lean value-streamanalyse vragen;
- de vraag wanneer de verzekerde zekerheid, duidelijkheid en uiteindelijk een ontvangen vergoeding krijgt, past bij de Business Architecture value stream.

## 4. Casus en scope

Aurora Verzekeringen N.V. is fictief. We beperken ons tot eenvoudige geldelijke schadeclaims waarvoor Aurora een gemotiveerd dekkingsbesluit geeft en bij dekking een bedrag betaalt.

Buiten scope van dit eerste model:

- reparatie in natura;
- bezwaar;
- terugvordering.

Wanneer zo'n route nodig is, registreert het model een vervolg of beëindiging zonder te doen alsof de oorspronkelijke value stream volledig is gerealiseerd.

We gebruiken de capabilities uit module 4:

- C1 Schade beoordelen;
- C2 Schade uitkeren;
- C3 Fraude detecteren;
- C4 Schadeverzoeken innemen;
- C5 Klantcommunicatie verzorgen.

## 5. Aurora — de volledige value stream

### Overzicht

| Onderdeel | Oefenkeuze |
|---|---|
| Naam | Schadeclaim afhandelen |
| Primaire stakeholder | De verzekerde die de claim indient |
| Trigger | Aurora ontvangt een herkenbaar verzoek om een schadeclaim te behandelen |
| Beoogde waarde | Duidelijkheid over aanspraak en vervolgstap; bij dekking een correct gerealiseerde vergoeding |
| Scope | Eenvoudige geldelijke claimafhandeling |
| Belangrijk principe | Intern gereed is niet automatisch stakeholderwaarde |

### S1 — Verzoek in behandeling genomen

**Beschrijving.** Aurora maakt duidelijk welk verzoek is ontvangen, dat het wordt behandeld en wat nodig is voor de volgende stap.

**Entry.** Een herkenbaar claimverzoek is ontvangen. Het dossier hoeft nog niet volledig inhoudelijk beoordeelbaar te zijn.

**Exit.** Het verzoek is herleidbaar vastgelegd, een behandelverantwoordelijkheid is herkenbaar en de verzekerde heeft ontvangstbevestiging plus concrete vervolgstap ontvangen. Ontbrekende informatie is benoemd.

**Value item.** Zekerheid dat het verzoek wordt opgepakt en handelingsperspectief voor het vervolg.

**Waarom deze grens?** Wanneer S1 pas eindigt bij een volledig beoordeelbaar dossier verberg je het eerdere moment waarop Aurora al onzekerheid kan wegnemen. S2 mag nog wachten op gegevens; S1 kan toch al waarde leveren.

### S2 — Aanspraak verduidelijkt

**Beschrijving.** Aurora beoordeelt de claim, maakt relevante afwegingen en legt dekking, bedrag of afwijzing met reden en vervolgstap uit.

**Entry.** S1 is afgerond en er is voldoende betrouwbare informatie voor een verantwoord besluit. Zolang informatie ontbreekt, blijft zichtbaar wat nodig is en wie daarover communiceert.

**Exit.** Een gemotiveerd besluit is vastgelegd en aan de verzekerde afgeleverd, inclusief relevante vervolgstap. Bij dekking zijn bedrag en betalingsafspraken bepaald.

**Value item.** Bruikbare duidelijkheid over de uitkomst en de reden, zodat de verzekerde weet wat hij kan verwachten of doen.

**Waarom deze grens?** Een intern besluitvinkje is onvoldoende. `Besluit gereed` en `stakeholder begrijpt wat is besloten` zijn verschillende toestanden. Aflevering is bovendien nog niet hetzelfde als aantoonbaar begrip; dat effect kan apart worden onderzocht.

### S3 — Vergoeding gerealiseerd

**Beschrijving.** Aurora voert de toegezegde geldelijke afhandeling uit en controleert of de vergoeding werkelijk is gerealiseerd.

**Entry.** Er is een besluit tot vergoeding, de betalingsafspraak is duidelijk en gecontroleerde betaalgegevens zijn beschikbaar.

**Exit.** Het correcte bedrag is volgens de gekozen bevestigingswijze bij de bedoelde ontvanger aangekomen; een mislukte betaling is opgelost. De verzekerde ontvangt afsluitinformatie. In een echte implementatie moeten financiële experts bepalen welk bewijs voldoende is voor ontvangst.

**Value item.** De toegezegde financiële tegemoetkoming is beschikbaar, met duidelijkheid over afronding.

**Waarom deze grens?** `Betaalbestand aangemaakt` meet intern werk. Het bewijst niet dat de stakeholder geld heeft ontvangen.

## 6. Afwijkende routes en negatieve uitkomsten

Een value stream mag uitzonderingen niet verbergen om het model netjes te houden.

| Situatie | Route | Betekenis van het einde |
|---|---|---|
| Claim met dekking | S1 → S2 → S3 | Eindwaarde gerealiseerd wanneer S3-exit is aangetoond. |
| Geen dekking | S1 → S2 | Besluit en vervolgstap uitgelegd; S3 is niet van toepassing. |
| Verzekerde trekt claim in | Stop bij bereikte stage | Afhandeling beëindigd; beoogde eindwaarde mogelijk niet gerealiseerd. |
| Betaling mislukt | S1 → S2 → S3 blijft open | Interne betaalopdracht is geen gerealiseerde vergoeding. |
| Fraudesignaal | Route binnen/naar verdieping van beoordeling | C3 kan bijdragen zonder automatisch een aparte value stage te zijn. |
| Vervolg naar bezwaar | Einde van deze scope met expliciete vervolgverwijzing | Geen stilzwijgende claim dat de hele klantbehoefte is afgerond. |

Negatieve uitkomsten kunnen nog steeds waarde bevatten. Een gemotiveerde afwijzing kan bijvoorbeeld duidelijkheid geven. Dat betekent niet dat de stakeholder tevreden is of een positief financieel resultaat ontvangt.

## 7. Foutanalyse — slechte stagegrenzen herkennen

### Organogram als value stream

`Contactcentrum → Backoffice → Finance` vertelt wie betrokken is, niet welke waarde de stakeholder na elke overgang ontvangt.

### Processtatus als waarde

`Gemeld → Beoordeeld → Uitgekeerd` kan bruikbaar lijken maar is zonder criteria dubbelzinnig. `Gemeld` kan betekenen dat de klant op verzenden heeft geklikt, dat Aurora de claim technisch heeft ontvangen of dat het verzoek voldoende herkenbaar is om te behandelen.

### Activiteit als zelfstandige stage

`Documenten opslaan` is in deze casus waarschijnlijk een ondersteunende activiteit. Het wordt alleen een zinvolle value stage wanneer in de gekozen enterprisecontext juist een betrouwbaar, vindbaar dossier de stakeholderwaarde vormt.

### Te vaag eindcriterium

`De klant is tevreden` is geen goed enig exitcriterium. Tevredenheid kan door veel factoren worden beïnvloed en is niet hetzelfde als het concrete waarderesultaat dat de stage beoogt te leveren.

## 8. Capability mapping naar value stages

Capabilities verklaren welk vermogen nodig is om stages te realiseren. Dezelfde capability kan aan meerdere stages bijdragen.

| Capability | S1 | S2 | S3 | Redenering |
|---|---|---|---|---|
| C4 Schadeverzoeken innemen | sterk | ondersteunend | — | Verzoek herkennen, vastleggen en naar behandeling leiden. |
| C1 Schade beoordelen | beperkt | sterk | — | Feiten en aanspraak vaststellen en besluit onderbouwen. |
| C3 Fraude detecteren | situationeel | situationeel | — | Alleen wanneer signalen nader onderzoek vragen. |
| C5 Klantcommunicatie verzorgen | sterk | sterk | relevant | Ontvangst, uitleg, vervolg en afsluiting ondersteunen. |
| C2 Schade uitkeren | — | voorbereidende relatie | sterk | Vastgestelde vergoeding uitvoeren en afwikkelen. |

De mapping maakt geen keuze over teams, processen of systemen. Zij zegt alleen dat het vermogen aantoonbaar nodig is voor het waardemoment.

## 9. Stage-capability heat mapping

Na de mapping kun je één beoordelingslens toevoegen. Bijvoorbeeld: **veranderbehoefte**.

Gebruik dan niet simpelweg `rood = slechte capability`. De eenheid van analyse is de relatie tussen capability en stage binnen het gekozen criterium.

Voorbeeld:

| Relatie | Fictieve observatie | Voorlopige heat-mapinterpretatie |
|---|---|---|
| C5 × S1 | Ontvangstbevestiging werkt in onderzochte gevallen consistent. | Lage veranderbehoefte binnen dit criterium. |
| C5 × S2 | In geselecteerde dossiers zit tijd tussen intern besluit en uitleg. | Hogere veranderbehoefte, oorzaak nog te onderzoeken. |
| C2 × S3 | Enkele betalingen mislukken en worden handmatig hersteld. | Aandacht nodig; omvang en oorzaak onbekend. |

Een andere lens, bijvoorbeeld `strategische criticality`, kan op dezelfde matrix andere kleuren geven. Daarom moeten criterium, bewijs en onzekerheid altijd zichtbaar blijven.

## 10. Value stream gebruiken voor architectuurbesluiten

Een value stream helpt niet alleen tekenen; zij verandert de vraagstelling.

Wanneer S2 pas als afgerond geldt nadat besluit en vervolgstap zijn afgeleverd, wordt zichtbaar dat `intern besluit gereed` geen volledig businessresultaat is. Dat kan gevolgen hebben voor:

- requirements;
- statusdefinities;
- informatieoverdracht;
- verantwoordelijkheden;
- performance-indicatoren;
- applicatieondersteuning.

Wanneer S3 eindigt bij gerealiseerde ontvangst in plaats van `betaalopdracht verstuurd`, verschuift de architectuuraandacht naar foutafhandeling en bewijs van afronding.

Het model maakt dus expliciet **wat je belangrijk genoeg vindt om als gerealiseerde waarde te tellen**.

## 11. Begeleid oefenen

Een collega stelt de volgende stages voor:

1. Claimformulier ingevuld
2. Medewerker heeft beoordeeld
3. Betaalbestand gemaakt

Verbeter elke stage vanuit stakeholderwaarde.

Een sterke uitwerking vraagt bij stage 1 of de verzekerde weet dat het verzoek in behandeling is. Bij stage 2 moet een gemotiveerd besluit en vervolgstap beschikbaar zijn. Bij stage 3 moet de afgesproken vergoeding werkelijk zijn gerealiseerd in plaats van alleen intern voorbereid.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Welke benadering kiest primair het perspectief van end-to-end stakeholderwaarde?
2. Welke benadering richt zich vooral op deelnemers die samen waarde creëren of leveren?
3. Waarom is een lean value stream niet hetzelfde als een Business Architecture value stream?
4. Wat is het verschil tussen activiteit, resultaat en stakeholderwaarde?
5. Wat laat capabilitymapping zien voordat een heat-mapcriterium wordt toegevoegd?
6. Waarom kan dezelfde stage-capabilitymatrix onder twee criteria andere kleuren krijgen?
7. Waarom kan een claim zonder dekking correct bij S2 eindigen zonder dat S3 `mislukt` is?

## Zelfstandige opdracht — Nova

Modelleer een value stream voor Nova's leenlaptopdienst.

De positieve eindwaarde is **bruikbaar kunnen deelnemen**, niet alleen een gereserveerde of fysiek aanwezige laptop.

Werk minimaal uit:

- primaire stakeholder;
- trigger en scope;
- drie of vier value stages;
- per stage: description, entry, exit en value item;
- minimaal één afwijkende route;
- mapping naar de capabilities uit module 4;
- één stage-capability heat map met expliciet criterium;
- een korte beslisnotitie: welk knelpunt verdient nader onderzoek en welk bewijs ontbreekt?

Fictief gegeven: in drie onderzochte starts was een laptop aanwezig maar werkte de vereiste toegang niet. De selectie is niet representatief.

### Beoordelingscriteria

- Stages zijn gebaseerd op stakeholderwaarde, niet op afdelingen of systeemstatussen.
- Entry- en exitcriteria zijn concreet en onderscheiden intern gereed van stakeholderresultaat.
- Value items zijn herkenbaar en niet gereduceerd tot activiteiten.
- Afwijkende routes worden expliciet behandeld.
- Capabilitymapping is inhoudelijk onderbouwd.
- Heat mapping benoemt criterium, bewijs en onzekerheid.
- De beslisnotitie verzint geen organisatiebrede percentages of oorzaken.

### Vrijgegeven voorbeeldredenering

Een mogelijke route is `Aanvraag herkenbaar → Geschikt apparaat en toegang voorbereid → Uitgifte gecontroleerd → Bruikbare deelname gestart`. Een reservering alleen is geen eindwaarde. Wanneer toegang ontbreekt, kan de fysieke uitgifte intern zijn afgerond terwijl de laatste stage openblijft. De drie onderzochte gevallen geven reden om toegang en overdracht te onderzoeken, niet om een organisatiebrede foutkans te claimen.

## Zelftoets — 7 formatieve vragen

### Vraag 1

Wat is het primaire perspectief van een Business Architecture value stream?

- A. Alleen technische datastromen.
- B. Alleen kosten per activiteit.
- C. Interne afdelingsvolgorde.
- D. End-to-end waarderealisatie voor een stakeholder.

### Vraag 2

Welke uitspraak onderscheidt process en value stream het beste?

- A. Iedere value stage is verplicht één procesactiviteit.
- B. Een process beschrijft uitvoering; een value stream beschrijft waarderealisatie vanuit stakeholderperspectief.
- C. Een value stream is altijd hetzelfde proces met minder stappen.
- D. Processen mogen geen waarde ondersteunen.

### Vraag 3

Welke lens richt zich primair op partijen en relaties die samen waarde creëren en leveren?

- A. Lean value stream.
- B. Technology Architecture.
- C. Gap analysis.
- D. Value network.

### Vraag 4

Aurora heeft een betaalbestand aangemaakt maar de betaling is mislukt. Wat betekent dit voor S3?

- A. De hele value stream moet opnieuw bij S1 beginnen.
- B. S3 is niet van toepassing bij een besluit tot vergoeding.
- C. S3 is afgerond omdat intern werk gereed is.
- D. S3 blijft open omdat de beoogde vergoeding nog niet is gerealiseerd.

### Vraag 5

Een collega stelt `Backoffice` voor als value stage. Welke eerste vraag helpt het meest?

- A. Welke server gebruikt de afdeling?
- B. Welke zelfstandige stakeholderwaarde ontstaat bij het bereiken van die stagegrens?
- C. Hoeveel medewerkers heeft Backoffice?
- D. Welke kleur krijgt de stage?

### Vraag 6

Wat voegt een stage-capability heat map toe aan een gewone capabilitymapping?

- A. Een automatisch procesmodel.
- B. Een bewijs dat alle rode relaties dezelfde oorzaak hebben.
- C. Een gekozen beoordelingslens op de relevante capability-stage relaties.
- D. Een verplichte nieuwe capability per stage.

### Vraag 7

Een claim wordt gemotiveerd afgewezen en de vervolgstap is duidelijk uitgelegd. Hoe rapporteer je dit in het oefenmodel?

- A. S3 moet als mislukt worden gemarkeerd.
- B. De value stream heeft geen waarde geleverd omdat geen geld is betaald.
- C. De afwijzing moet uit het model worden verwijderd.
- D. S1 en S2 kunnen afgerond zijn; S3 is niet van toepassing voor deze route.

## Naar module 6

Module 6 onderzoekt welke informatiebetekenis en organisatieverantwoordelijkheid nodig zijn om vooral S2 en S3 betrouwbaar te realiseren. Neem C1–C5 en S1–S3 mee als vaste lescodes; introduceer geen nieuwe betekenis voor dezelfde codes zonder expliciete wijziging.

## Bronbasis

- The Open Group, TOGAF Series Guide: Value Streams (G178).
- X2202 Value Streams learning unit.
- EAW e-learningontwerpmethode v4.
