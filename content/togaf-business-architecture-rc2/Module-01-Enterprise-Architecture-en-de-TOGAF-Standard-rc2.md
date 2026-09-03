# Module 1 — Enterprise Architecture en de TOGAF Standard

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. De examenkern is afgestemd op syllabusidentiteit X2202 zoals door The Open Group Helpdesk aangewezen; dit bestand is geen officiële syllabus of examenvraagbank.

## Leerprestatie

Na deze module kun je een organisatievraag vertalen naar samenhangende architectuurvragen, relevante stakeholders en bruikbare weergaven. Je kunt de belangrijkste TOGAF-basisconcepten uitleggen en van elkaar onderscheiden. De examenkern ondersteunt Foundation-kennis; de Aurora- en Nova-opdrachten vragen aanvullend professionele toepassing.

## 1. Waarom architectuur bij een businessvraag begint

Aurora wil schadeclaims sneller afhandelen. Een mogelijke reactie is een nieuw portaal. Maar een digitaal formulier helpt weinig als een besluit intern blijft wachten, informatie niet herleidbaar is of de betaling mislukt. De architectuurvraag is daarom breder: welke samenhang tussen organisatie, informatie en techniek is nodig om de afgesproken dienstverlening betrouwbaar te realiseren?

Enterprise Architecture helpt zulke samenhang expliciet maken, alternatieven beoordelen en besluiten onderbouwen. TOGAF biedt daarvoor begrippen, de Architecture Development Method (ADM) en ondersteunende richtlijnen. Het framework neemt de inhoudelijke keuze niet over. De architect moet nog steeds bepalen welke scope, stakeholders, modellen, evidence en beslissingen voor de concrete vraag relevant zijn.

Een enterprise is de organisatorische scope waarvoor doelen en samenhang worden beschouwd. Dat kan de hele onderneming zijn, maar ook een relevante combinatie van onderdelen en partners. De gekozen grens moet passen bij de vraag: voor een beperkte overdrachtsfout is een compleet model van alle bedrijfsactiviteiten niet automatisch nodig; bij dienstverlening over meerdere partners heen kan één afdeling juist te smal zijn.

**Instapdiagnose.** Stel dat een klantportaal traag voelt. Is daarmee bewezen dat de infrastructuur onvoldoende is? Nee. Een wachtrij in besluitvorming, een foutieve koppeling of onduidelijke statusinformatie kan hetzelfde zichtbare symptoom geven. De zichtbare ervaring bepaalt dus niet automatisch het architectuurdomein van de oorzaak.

## 2. Exam core — TOGAF-basisbegrippen

### Doel en waarde van Enterprise Architecture

Enterprise Architecture ondersteunt besluitvorming over verandering door doelen, concerns, huidige inrichting, gewenste inrichting en belangrijke afhankelijkheden samenhangend te maken. De waarde zit niet in zoveel mogelijk modellen produceren, maar in betere keuzes, expliciete impact en bestuurbare verandering.

### Abstractie

Architectuur gebruikt abstractie: je laat alleen die kenmerken zien die voor een gekozen vraag relevant zijn. Een capabilitymap abstraheert anders dan een procesmodel. Meer detail is daarom niet automatisch beter. Detail is nuttig wanneer het onzekerheid voor een besluit vermindert.

### Architecture Principles

Een architecture principle is een richtinggevend uitgangspunt voor besluitvorming, met een reden en consequenties. In de Aurora-casus gebruiken we bijvoorbeeld: besluiten blijven herleidbaar tot de gebruikte grondslag. Dat betekent onder meer dat een latere wijziging de oorspronkelijke beslisbasis niet stilzwijgend mag overschrijven. Dit is een fictief casusprincipe, geen letterlijk TOGAF-voorschrift.

### Enterprise Continuum en Architecture Repository

De **Enterprise Continuum** helpt architectuurassets te classificeren en in context te plaatsen, van generieker naar specifieker bruikbaar materiaal. De **Architecture Repository** is de logische omgeving waarin architectuurcontent en gerelateerde assets worden beheerd en teruggevonden. Ze ondersteunen elkaar, maar zijn niet hetzelfde: het ene helpt ordenen en contextualiseren, het andere beheren en beschikbaar stellen.

### Content Framework en Enterprise Metamodel

Het **TOGAF Content Framework** biedt structuur voor architectuurcontent zoals deliverables, artifacts en building blocks. Het **Enterprise Metamodel** beschrijft welke soorten architectuurcontent en relaties een organisatie in haar eigen architectuurpraktijk hanteert. Een metamodel beschrijft dus de soorten elementen en relaties; een concreet architectuurmodel gebruikt die elementen voor een specifieke situatie.

### Architecture Capability

De **Architecture Capability** is het vermogen van de organisatie om architectuurwerk effectief uit te voeren en te besturen. Dat omvat niet alleen architecten, maar ook governance, rollen, vaardigheden, methoden en ondersteunende voorzieningen. Het is daarom iets anders dan één architectuurdocument of één projectteam.

### TOGAF naast andere frameworks

TOGAF hoeft andere methoden niet te vervangen. Een organisatie kan TOGAF combineren met andere frameworks en deliverywerkwijzen, zolang helder is welk probleem elk onderdeel helpt oplossen, hoe begrippen aansluiten en waar governance of verantwoordelijkheden elkaar raken.

### Risk management en gap analysis

**Risk management** maakt onzekerheden en bedreigingen voor architectuurdoelen expliciet, zodat ze kunnen worden beoordeeld en behandeld. **Gap analysis** vergelijkt relevante kenmerken van baseline en target om vast te stellen wat ontbreekt, verandert of moet verdwijnen. Een risico is dus niet hetzelfde als een gap.

## 3. Vier architectuurdomeinen als samenhangende perspectieven

Business Architecture beschrijft onder meer strategie, organisatie en de inrichting van de bedrijfsvoering. Data Architecture richt zich op betekenis, structuur en beheer van gegevens. Application Architecture beschrijft applicaties, verantwoordelijkheden en samenhang. Technology Architecture richt zich op de technische voorzieningen waarop dit draait. Deze afbakening is een didactische parafrase; de domeinen zijn perspectieven, geen verplichte organisatiesilo's.

| Perspectief | Vraag bij Aurora | Mogelijk resultaat |
|---|---|---|
| Business | Welke waarde en dienstverlening moet de verzekerde ontvangen en wie is waarvoor verantwoordelijk? | Waardefasen, capabilities en verantwoordelijkheden. |
| Data | Welke betekenis hebben polis, claim, besluit en betaling en welke kwaliteit is nodig? | Begrippen en kwaliteitsafspraken. |
| Applicatie | Welke systemen ondersteunen besluitvorming en communicatie en wie is waarvoor verantwoordelijk? | Applicatieverantwoordelijkheden en uitwisselingen. |
| Technologie | Welke beschikbaarheid, beveiliging en capaciteit zijn nodig? | Technische eisen en voorzieningen. |

Een businesskeuze kan gevolgen hebben in alle vier de domeinen. De vuistregel ‘business is wat en waarom, technologie is hoe’ is te grof: Business Architecture bevat ook keuzes over organisatie en bedrijfsvoering.

**Oefen.** Een klant ziet een verkeerd bedrag. Formuleer twee mogelijke verklaringen vanuit verschillende perspectieven. Bijvoorbeeld: een businessregel is verkeerd toegepast, of het juiste besluit is verkeerd naar het portaal overgenomen. Beide hypotheses vragen ander bewijs.

## 4. Stakeholders, concerns, viewpoints en views

Niet iedereen heeft hetzelfde model nodig. Een directielid wil weten welke verandering bijdraagt aan dienstverlening; een behandelaar wil weten wanneer een dossier verder kan; een informatie-eigenaar wil weten welk begrip leidend is.

Een stakeholder heeft concerns. Een viewpoint beschrijft hoe je een bepaald soort concern in beeld brengt; een view is een concrete weergave voor de onderzochte situatie. Een afgesproken manier om waardefasen en capabilities samen te tonen is een viewpoint; de ingevulde Aurora-matrix is een view.

| Stakeholder | Concern | Bruikbare view | Wat die view niet bewijst |
|---|---|---|---|
| Verzekerde | Weet ik wat besloten is en wat volgt? | Waardemomenten met uitlegcriteria. | Werkelijk begrip of tevredenheid. |
| Manager Schade | Waar stokt de dienstverlening? | Fasen met prestatiebewijs en capabilitybijdragen. | De technische oorzaak van elke vertraging. |
| Informatie-eigenaar | Is besluit en grondslag herleidbaar? | Begrippenrelaties en vastleggingsafspraken. | Dat ieder huidig dossier al voldoet. |

Vraag bij iedere weergave: welk besluit moet ermee worden ondersteund, welke informatie is opgenomen en wat is bewust weggelaten?

## 5. De modellen van de leerlijn verbinden

De training bouwt geen verzameling losse plaatjes. De modellen beantwoorden samen één veranderingsvraag.

Het businessmodel maakt zichtbaar aan wie Aurora iets belooft en hoe de organisatie dat economisch mogelijk maakt. Capabilities benoemen benodigde vermogens. Value streams tonen waardemomenten voor stakeholders. Information Mapping maakt businessbegrippen en relaties expliciet. Organization Mapping laat zien welke organisatieonderdelen bijdragen en waar verantwoordelijkheid moet worden afgesproken. Business Scenarios verbinden een concreet probleem met omgeving, actoren, gewenste uitkomsten en requirements. De ADM ordent het architectuurwerk en de overgang naar verandering.

**Uitgewerkt verband.** Aurora wil begrijpelijke duidelijkheid over claims bieden. Die belofte komt terug in de value stream als het moment waarop de aanspraak is verduidelijkt. Daarvoor zijn onder meer beoordelen en klantcommunicatie nodig. Die capabilities gebruiken claim, polisversie, besluit en toelichting. De organisatie moet inhoud en aflevering beleggen. Een business scenario onderzoekt vervolgens waarom klanten ondanks een intern gereed besluit nog geen bruikbare uitleg ontvangen.

Een modelrelatie is een bewering die je moet kunnen onderbouwen. Een gelijk klinkend label is onvoldoende bewijs. `Besluitbeheer` als capability en `besluit uitgelegd` als stakeholderresultaat zijn bijvoorbeeld niet hetzelfde.

## 6. Van probleem naar eerste architectuurnotitie

Maak voor Aurora een korte notitie met probleem, scope, stakeholders, twee samenhangende perspectieven en eerste onderzoeksvragen. Gebruik alleen de fictieve casusfeiten; verzin geen doorlooptijden of oorzaken.

Een zwakke notitie bevat alleen ‘we hebben betere IT nodig’. Dat kiest een oplossing voordat probleem en oorzaak zijn onderzocht. Een andere zwakke notitie wil alle enterprise-modellen volledig uitwerken voordat één gerichte vraag mag worden onderzocht. Beide missen proportionaliteit.

**Feedbackregel.** Staat een storing of meting niet in de casus, presenteer haar dan als hypothese of open onderzoeksvraag. Schrijf bijvoorbeeld `te onderzoeken: wachttijd tussen besluit en uitleg`, niet `de backoffice veroorzaakt de vertraging`.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Waarom is de Enterprise Continuum niet hetzelfde als de Architecture Repository?
2. Wat is het verschil tussen een Enterprise Metamodel en een concrete architecture view?
3. Waarom kan meer detail een architectuurbesluit juist slechter ondersteunen?
4. Wat maakt Architecture Capability iets anders dan één architectuurdocument?
5. Wat is het verschil tussen een gap en een risico?
6. Wat is het verschil tussen viewpoint en view?

Als je vooral labels kunt reproduceren, ga terug naar de functie van het concept: welke architectuurvraag helpt het beantwoorden?

## Zelfstandige opdracht — Nova

Nova meldt dat deelnemers soms niet met hun leenlaptop kunnen starten. Maak een architectuurnotitie:

- baken het probleem af;
- benoem twee stakeholders met verschillende concerns;
- formuleer vragen vanuit alle vier architectuurdomeinen;
- kies twee eerste views en leg uit welk besluit ze ondersteunen;
- benoem ontbrekend bewijs voordat Nova een nieuwe reserveringswebsite kiest;
- noem één relevant risico en één mogelijke gap zonder die als bewezen feit te presenteren.

### Beoordelingscriteria

- Probleem en voorgestelde oplossing zijn onderscheiden.
- Stakeholders en concerns zijn concreet.
- Domeinvragen sluiten aan op hetzelfde probleem.
- Gekozen views helpen een benoemd besluit.
- Aannames en ontbrekend bewijs zijn zichtbaar.
- Risico en gap worden niet door elkaar gehaald.

### Vrijgegeven voorbeeldredenering

Een bruikbare notitie onderscheidt reservering, apparaatwerking en toegang. Voor de deelnemer gaat het om kunnen starten; voor middelenbeheer om betrouwbare beschikbaarheid. Een waardeperspectief kan tonen wanneer bruikbaarheid bereikt moet zijn; een informatie-/applicatieview kan helpen verklaren of een correcte reservering verkeerd wordt uitgevoerd. Eerst voorbeelden van mislukte starts onderzoeken; een nieuwe website is nog geen bewezen oplossing.

## Zelftoets — 6 formatieve vragen

Deze vragen zijn formatief. Antwoordsleutels en beoordelingslogica horen in de afgeschermde assessmentlaag.

### Vraag 1

Aurora kiest meteen een nieuw portaal om onduidelijke claimafhandeling op te lossen. Welke eerste architectuurvraag helpt het meest?

- A. Hoe vervangen we alle bestaande modellen?
- B. Welke kleur krijgt het portaal?
- C. Welke stakeholderuitkomst ontbreekt en welke samenhang kan dat verklaren?
- D. Welke database heeft de hoogste capaciteit?

### Vraag 2

Wanneer is een enterprisegrens bruikbaar?

- A. Als zij uitsluitend juridische eigendom volgt.
- B. Als leveranciers altijd buiten beeld blijven.
- C. Als zij de samenhang omvat die nodig is om de onderzochte vraag te beantwoorden.
- D. Als zij altijd samenvalt met één afdeling.

### Vraag 3

Wat is een view?

- A. Iedere mening van een stakeholder.
- B. De verzameling toegangsrechten op architectuurmodellen.
- C. De concrete ingevulde weergave voor een onderzochte situatie.
- D. De algemene afspraak hoe een type weergave wordt opgebouwd.

### Vraag 4

Welke uitspraak onderscheidt Enterprise Continuum en Architecture Repository het beste?

- A. Het Continuum helpt assets ordenen/contextualiseren; de Repository helpt content beheren en beschikbaar stellen.
- B. Het zijn twee namen voor exact hetzelfde concept.
- C. De Repository bevat uitsluitend technische code; het Continuum uitsluitend processen.
- D. Het Continuum vervangt governance; de Repository vervangt de ADM.

### Vraag 5

Wat beschrijft een Enterprise Metamodel?

- A. Alleen de database-opslag van architectuurdocumenten.
- B. Alleen de huidige organisatiestructuur.
- C. De soorten architectuurelementen en relaties die de architectuurpraktijk hanteert.
- D. Eén concrete targetarchitectuur.

### Vraag 6

Wat is het beste onderscheid tussen gap en risico?

- A. Een gap is altijd technisch; een risico altijd financieel.
- B. Beide betekenen per definitie hetzelfde.
- C. Een risico wordt pas relevant na implementatie.
- D. Een gap is een verschil tussen baseline en target; een risico is onzekerheid of bedreiging die doelrealisatie kan beïnvloeden.

## Naar module 2

Neem je architectuurnotitie mee. In module 2 gebruik je dezelfde veranderingsvraag om scope, requirements, iteratie en fasekeuzes binnen de ADM te onderbouwen.

## Bronbasis

- The Open Group Helpdesk, syllabusverwijzing X2202 voor TOGAF Standard, 10th Edition-certificeringen.
- The Open Group, TOGAF Standard, 10th Edition-body of knowledge.
- EAW e-learningontwerpmethode v4, 2 september 2026.
