# Module 7 — TOGAF Business Scenarios

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. De Business Scenario-uitwerking is didactisch en gebruikt de TOGAF Series Guide als inhoudelijke basis.

## Leerprestatie

Na deze module kun je een Business Scenario opbouwen uit probleem, business- en technische omgeving, doelen, actoren, rollen, gewenste uitkomsten en requirements. Je kunt een scenario gebruiken om requirements af te leiden zonder oorzaken of oplossingen te verzinnen en uitleggen hoe Business Scenarios in Phase A, Phase B en Requirements Management kunnen worden ingezet.

## 1. Een scenario gebruiken om requirements te vinden

Een Business Scenario beschrijft een betekenisvolle businesssituatie in haar omgeving, met betrokken actoren, hun rollen en gewenste uitkomsten. Het helpt businessbehoeften vertalen naar architectuurrequirements.

Het is meer dan een kort verhaaltje en niet hetzelfde als één scherminteractie. De techniek dwingt context af: welk probleem speelt, voor wie, in welke omgeving, welke uitkomst wordt gezocht en welke requirements volgen daaruit?

**Instapvraag.** `Aurora moet een nieuw klantportaal bouwen` is geen neutrale probleemomschrijving. Zij bevat al een oplossingskeuze. Begin bij wat de verzekerde of medewerker niet kan en welk bewijs daarvoor bestaat.

## 2. Exam core — waarom en waar Business Scenarios worden gebruikt

### Meerwaarde

Business Scenarios helpen requirements concreter maken door situatie, actoren en gewenste uitkomsten met elkaar te verbinden. Een requirement als `de klant moet tijdig geïnformeerd worden` wordt sterker wanneer duidelijk is in welke situatie, voor welke actor, met welk resultaat en onder welke omstandigheden dat geldt.

### Phase A — prominent gebruik

De TOGAF Series Guide Business Scenarios positioneert de techniek prominent in **Phase A — Architecture Vision**. Daar kan zij helpen businessrequirements te ontdekken en documenteren en consensus met management en stakeholders over de veranderingsopgave te ondersteunen.

### Phase B — iteratieve verdieping

De techniek kan ook in **Phase B — Business Architecture** worden gebruikt wanneer een situatie op meer detailniveau moet worden uitgewerkt en aanvullende requirements ontstaan.

### Requirements Management en andere fasen

Omdat requirements door de hele ADM relevant blijven, kan een Business Scenario ook binnen Requirements Management of andere fasen worden gebruikt wanneer requirements moeten worden afgeleid, verfijnd of opnieuw gevalideerd.

Onthoud dus niet `Business Scenario = alleen Phase A`. Onthoud: **Phase A is de prominentste inzet; de techniek kan iteratief breder worden gebruikt.**

## 3. Relatie met eerdere Business Architecture-technieken

Een Business Scenario staat niet los van capabilities, value streams, information en organization mapping.

**Value streams** helpen bepalen welk stakeholderresultaat relevant is en op welk waardemoment een probleem zichtbaar wordt.

**Capabilities** helpen benoemen welke vermogens nodig zijn om de situatie succesvol te ondersteunen.

**Information Mapping** helpt bepalen welke betekenisvolle informatie nodig is.

**Organization Mapping** helpt actoren, bijdragen, mandaten en overdrachten expliciet maken.

Het scenario verbindt die perspectieven rond één concrete probleemsituatie.

## 4. Aurora — probleem, scope en omgeving

We gebruiken de fictieve dossierselectie uit de value-streammodule. In een geselecteerde set dossiers is vastgesteld dat in meerdere gevallen tijd zat tussen een intern gereed besluit en aflevering van begrijpelijke uitleg. De selectie is niet willekeurig. Oorzaak en organisatiebrede omvang zijn dus niet vastgesteld.

### Probleemomschrijving

In de onderzochte gevallen levert een intern gereed besluit nog niet tijdig de bedoelde duidelijkheid voor de verzekerde. We onderzoeken de overgang van besluit naar uitleg.

De formulering is bewust beperkt. Zij claimt niet dat de oorzaak een applicatiekoppeling, capaciteitstekort of fout proces is.

### Scope

Eenvoudige geldelijke claimafhandeling, vanaf een intern gereed besluit tot relevante uitleg. Reparatie en bezwaar vallen buiten deze eerste scenarioanalyse. Betalingsproblemen bij S3 zijn verwant maar worden niet zonder bewijs aan dezelfde oorzaak gekoppeld.

### Businessomgeving

Team Schade neemt een besluit. Klantondersteuning helpt bij uitleg. Een expertisebureau kan feiten aanleveren. Definitieve mandaten en huidige overdrachtsafspraken zijn nog niet volledig bekend en blijven onderzoekspunten.

### Technische omgeving

Er zijn voorzieningen voor claimvastlegging en communicatie. De precieze integratie, versieherkomst en foutafhandeling zijn in deze casus niet vastgesteld. Benoem daarom benodigde functies en informatie zonder een niet-onderzochte applicatiearchitectuur als feit te presenteren.

## 5. Doelen en actoren concreet maken

Een doel moet helpen bepalen of de verandering werkt. Alleen labels als `SMART` toevoegen maakt een doel niet automatisch goed.

### Fictieve pilotafspraak

Voor deze oefening spreken we af dat gedurende een pilot wordt vastgelegd wanneer een besluit intern gereed is en wanneer relevante uitleg is afgeleverd. Verschillen zonder bekende vervolgactie krijgen een toegewezen onderzoekseigenaar. Dit is een gekozen pilotafspraak, geen gemeten huidige norm.

De pilot kan aflevering meetbaar maken, maar bewijst nog geen begrijpelijkheid. Dat vraagt een aanvullende proef, bijvoorbeeld of betrokken verzekerden na ontvangst kunnen uitleggen wat is besloten en welke vervolgstap mogelijk is.

| Actor | Rol | Informatie of resultaat |
|---|---|---|
| Verzekerde | Ontvangt uitleg en stelt zo nodig vragen. | Besluit, reden en vervolgstap. |
| Schadebehandelaar | Onderbouwt besluit en beantwoordt inhoudelijke vragen. | Herleidbaar oordeel en grondslag. |
| Klantondersteuner | Verzorgt uitleg en signaleert ontbrekende informatie. | Bruikbare toelichting en vervolgactie. |
| Communicatievoorziening | Ondersteunt aflevering en registratie. | Afleverstatus; dit bewijst geen begrip. |
| Dossiervoorziening | Ondersteunt vastlegging en raadplegen. | Besluit met gebruikte informatie. |

Menselijke en systeemactoren hebben verschillende rollen. Een systeemstatus is geen zelfstandig bewijs dat een menselijke ontvanger de inhoud heeft begrepen.

## 6. Requirements afleiden met herkomst en verificatie

We behouden dezelfde casusrequirements door de leerlijn heen.

| ID | Requirement | Herkomst | Verificatie in de oefening |
|---|---|---|---|
| R-01 | Een besluit is herleidbaar tot de gebruikte polisgrondslag. | Betrouwbare en uitlegbare besluitvorming. | Bij geselecteerde besluiten de gebruikte grondslag terugvinden en vergelijken. |
| R-02 | De overdracht naar Klantondersteuning bevat besluit, motivering en toepasselijke vervolgstap. | Kloof tussen intern gereed en bruikbare uitleg. | Concrete overdrachten volgen en ontbrekende onderdelen registreren. |
| R-03 | Een niet-afgeleverde uitleg blijft herkenbaar open met toegewezen vervolgactie. | Voorkomen dat intern gereed het klantresultaat verbergt. | Afleverfout simuleren en herstel/eigenaarschap controleren. |
| R-04 | Begrijpelijkheid wordt afzonderlijk onderzocht van technische aflevering. | Afleveren is niet gelijk aan begrijpen. | Gebruikersproef met vooraf afgesproken methode. |

De requirements schrijven nog geen portaal voor. Een gewijzigde werkwijze kan een deel realiseren; een applicatieaanpassing kan nodig blijken. Eerst requirements en bewijs, daarna oplossingskeuze.

**Aanvultaak.** Verbeter `het systeem moet gebruiksvriendelijk zijn`. Benoem welke actor welke taak moet kunnen uitvoeren, in welke context en welk bewijs voldoende is. Bijvoorbeeld: een behandelaar kan tijdens een klantvraag het besluit en de gebruikte grondslag samen terugvinden. Daarna moet nog een passende acceptatiemethode worden afgesproken.

## 7. Uitzonderingen en validatie

Een scenario wordt sterker wanneer afwijkende situaties worden behandeld.

Bij Aurora kan:

- uitleg niet worden afgeleverd;
- de verzekerde een inhoudelijke vraag stellen;
- informatie ontbreken;
- een besluit later worden herzien;
- de route buiten scope naar bezwaar gaan.

Benoem per situatie welke actor handelt en hoe eerdere besluiten herleidbaar blijven.

Scenario-validatie vraagt betrokkenen of zij probleem, omgeving, rollen en gewenste uitkomsten herkennen. Een door één auteur goedgekeurde tekst is geen bewijs van stakeholderconsensus. Daarom blijft een didactisch scenario een ontwerpvoorstel totdat echte betrokkenen het valideren.

**Interne inconsistentie.** Wanneer het scenario zegt dat Klantondersteuning inhoudelijke besluiten mag wijzigen terwijl elders alleen Team Schade die bevoegdheid heeft, moeten die afspraken expliciet worden opgelost. Laat tegenstrijdige rolafspraken niet naast elkaar bestaan.

## 8. Scenario, requirements en versiebeheer

Wanneer scenario, scope of actoren veranderen, moeten afgeleide requirements worden gecontroleerd. Anders kan een requirement achterblijven bij een gewijzigde context.

Traceer daarom minimaal:

**observatie → scenario-element → stakeholderuitkomst → requirement → verificatie**

Voor professionele architectuur kun je daar capabilities, value stages, informatieconcepten en organisatieverantwoordelijkheid aan toevoegen.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Waarom is een Business Scenario meer dan een user story van één actor?
2. In welke ADM-fase wordt de techniek prominent gebruikt?
3. Waarom kan zij ook in Phase B of Requirements Management terugkomen?
4. Hoe helpt een value stream bij het afbakenen van een scenario?
5. Hoe helpen capabilities bij scenarioanalyse zonder direct een oplossing te kiezen?

## Zelfstandige opdracht — Nova

Schrijf een Business Scenario voor het geval waarin een deelnemer een gereserveerde laptop ophaalt maar geen werkende toegang heeft.

Werk uit:

- probleemomschrijving;
- scope;
- business- en technische omgeving;
- menselijke en systeemactoren;
- rollen;
- een expliciet als ontwerpaanname gemarkeerd pilotdoel;
- requirements met herkomst en verificatie;
- uitzonderingen;
- validatievragen.

Kies nog geen leverancier of nieuwe website als verplichte oplossing.

Voeg één trace toe:

**scenario-observatie → business requirement → betrokken capability/value stage → nog te nemen architectuurbesluit**

Label per schakel of zij feitelijk onderbouwd, afgeleid of nog te valideren is.

### Beoordelingscriteria

- Probleem, oorzaakshypothese en oplossing zijn onderscheiden.
- Omgeving en actoren zijn concreet; onbekende feiten zijn gemarkeerd.
- Doelen kunnen worden onderzocht en numerieke afspraken zijn als gekozen doel herkenbaar.
- Requirements hebben herkomst en verificatiewijze.
- Uitzonderingen en rolconflicten zijn behandeld.
- Traceability naar eerdere Business Architecture-elementen is zichtbaar.

### Vrijgegeven voorbeeldredenering

De positieve uitkomst is bruikbare deelname, niet alleen fysieke uitgifte. Middelenbeheer draagt het apparaat over; IT ondersteunt toegang; de deelnemer probeert de vereiste leeromgeving. Een pilot kan als ontwerpafspraak toegang bij proefuitgifte controleren en mislukkingen met eigenaar registreren. Requirements betreffen herleidbare reservering, werkend toegangsrecht en herstelroute. Onderzoek eerst bestaande voorzieningen en overdrachten voordat nieuwe software wordt voorgeschreven.

## Zelftoets — 3 formatieve vragen

### Vraag 1

Wat ontbreekt in het scenario `we bouwen een portaal met drie schermen`?

- A. Een verbod op uitzonderingen.
- B. Alleen het lettertype.
- C. Een onderbouwd probleem, omgeving, actoren en gewenste uitkomsten.
- D. Een vast aantal architecten.

### Vraag 2

Waar worden Business Scenarios volgens de Series Guide prominent ingezet?

- A. Uitsluitend buiten de ADM.
- B. Phase A — Architecture Vision.
- C. Alleen Phase D.
- D. Alleen na implementatie.

### Vraag 3

Waarom is een afleverstatus onvoldoende als bewijs dat R-04 is gerealiseerd?

- A. Omdat alleen handmatige communicatie geldig is.
- B. Omdat Business Scenarios geen requirements mogen bevatten.
- C. Omdat technische aflevering niet automatisch begrip door de verzekerde bewijst.
- D. Omdat systemen nooit informatie mogen afleveren.

## Naar module 8

Module 8 gebruikt de requirements, capabilities, value stages, informatie- en organisatieverbanden om baseline en target vergelijkbaar te maken, gaps af te leiden en alternatieven te beoordelen. De vraag verschuift van `wat is het probleem?` naar `welke samenhang moet aantoonbaar veranderen?`.

## Bronbasis

- The Open Group, TOGAF Series Guide: Business Scenarios (G176).
- X2202 Business Scenarios learning unit.
- EAW e-learningontwerpmethode v4.
