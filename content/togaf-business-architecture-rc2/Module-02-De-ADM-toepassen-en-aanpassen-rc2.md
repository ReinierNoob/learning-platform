# Module 2 — De ADM toepassen en aanpassen

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. De examenkern is afgestemd op syllabusidentiteit X2202; de praktijkuitwerking is didactische toepassing en geen letterlijk TOGAF-voorschrift.

## Leerprestatie

Na deze module kun je de ADM-fasen herkennen aan hun doel, requirements door het traject volgen, iteratie en tailoring onderbouwen en uitleggen hoe governance, scope en alternatieven de toepassing beïnvloeden. Je gebruikt de Aurora-casus om van visie naar verandering te redeneren en past dezelfde logica zelfstandig toe op Nova.

## 1. De ADM gebruiken voor een veranderingsvraag

De Architecture Development Method helpt architectuur doelgericht te ontwikkelen en te onderhouden. De fasen ondersteunen samenhang tussen aanleiding, gewenste architectuur, veranderopties, implementatie en beheer. Het bekende ronde model is geen verplicht eenmalig watervalproject. Scope, diepgang, iteratie en hergebruik worden afgestemd op de vraag en op bruikbaar bestaand materiaal.

Voor Aurora blijft de aanleiding: betere duidelijkheid over schadeclaims. We kennen nog geen bewezen technische oorzaak. De ADM helpt het onderzoek en de besluiten ordenen. Zij schrijft niet voor dat eerst een nieuw portaal moet worden gekozen of dat elk model vanaf nul moet worden gemaakt.

**Instapvraag.** De directie vraagt onmiddellijk een leverancier te kiezen. Welk architectuurbesluit ontbreekt mogelijk nog? Bijvoorbeeld: welk klantresultaat moet verbeteren, welke requirements gelden, wat is de scope en welke oorzaken zijn wel of niet bewezen.

## 2. Exam core — governance, scope en status van architectuurwerk

### Draft en approved deliverables

Een **draft deliverable** is nog onderwerp van review en besluitvorming. Een **approved deliverable** heeft de afgesproken governance- en goedkeuringsstappen doorlopen. Het verschil gaat niet alleen over documentversie of opmaak. Een document kan er technisch voltooid uitzien en toch nog draft zijn.

### Governance

Enterprise Architecture moet niet alleen ontwikkeld maar ook bestuurd en onderhouden worden. Governance maakt duidelijk wie beslissingen neemt, welke controles gelden, hoe afwijkingen worden behandeld en hoe architectuur actueel blijft. Zonder governance kunnen dezelfde afspraken later verschillend worden geïnterpreteerd of stilzwijgend worden verlaten.

### Scope

Scoping bepaalt welk deel van de enterprise, welke architectuurdomeinen, welk detailniveau en welke tijdshorizon relevant zijn. Een smalle scope kan verantwoord zijn wanneer zij de beslisvraag afdekt; een te smalle scope kan cruciale afhankelijkheden verbergen. ‘Alles modelleren’ is daarom geen betere standaardkeuze.

### Alternatieven, concerns en trade-offs

Architectuurwerk hoort relevante alternatieven tegen stakeholderconcerns, requirements, risico’s en andere criteria te vergelijken. Een trade-off betekent dat verbetering op één aspect een beperking op een ander aspect kan geven. De architect maakt dat zichtbaar; een voorkeursoptie wordt niet gepresenteerd alsof alternatieven nooit bestonden.

## 3. Compacte fasekaart — herken de bedoeling

| Onderdeel | Centrale vraag |
|---|---|
| Preliminary | Hoe richten we de architectuurcapability, principes en randvoorwaarden voor architectuurwerk in? |
| Phase A — Architecture Vision | Waarom is de verandering nodig, wat is de scope, wie zijn de stakeholders en welke high-level richting wordt nagestreefd? |
| Phase B — Business Architecture | Welke businessinrichting is relevant in baseline en target en welke gaps volgen daaruit? |
| Phase C — Information Systems Architectures | Welke Data- en Application Architecture zijn nodig? |
| Phase D — Technology Architecture | Welke technische voorzieningen ondersteunen de beoogde informatievoorziening? |
| Phase E — Opportunities & Solutions | Welke oplossingsrichtingen, work packages en transities kunnen de architectuur realiseren? |
| Phase F — Migration Planning | Hoe prioriteren en plannen we de overgang? |
| Phase G — Implementation Governance | Hoe borgen we realisatie conform afspraken en behandelen we afwijkingen? |
| Phase H — Architecture Change Management | Hoe bewaken we veranderingen en bepalen we wanneer architectuur moet worden aangepast? |
| Requirements Management | Hoe worden requirements door de ADM heen geïdentificeerd, beheerd en afgestemd? |

Deze tabel is een beknopte didactische parafrase. Gebruik haar om de bedoeling van een fase te herkennen, niet als vervanging van de officiële standaard.

E en F raken beide planning, maar het accent verschilt. In E worden samenhangende oplossings- en transitiemogelijkheden onderzocht; in F wordt de migratie verder geprioriteerd en gepland. G is geen eenmalige eindtest. H betekent niet dat ieder klein wijzigingssignaal automatisch een volledig nieuw traject vanaf Preliminary vereist.

## 4. Aurora van visie naar architectuur

### Phase A — de opdracht scherp maken

De opdrachtgever wil dat de verzekerde weet of een claim is opgepakt, wat het besluit inhoudt en wanneer een eventuele vergoeding werkelijk is gerealiseerd. De eerste scope beperkt zich tot eenvoudige geldelijke afhandeling. Reparatie en bezwaar worden als vervolggrenzen benoemd. Daarmee voorkomt Aurora dat een eerste model stilzwijgend de hele verzekeringsorganisatie pretendeert te dekken.

Phase A gaat hier om richting, scope, stakeholders, concerns en mandaat. De volledige Business Architecture wordt nog niet uitgewerkt; die verdieping hoort bij Phase B.

### Phase B — gewenste bedrijfswerking

Aurora werkt value stages, capabilities, rollen, businessinformatie en relevante baseline/targetverschillen uit. Als het probleem vooral een onduidelijke verantwoordelijkheid of onvolledig gereedcriterium is, kan dat al een wezenlijke architectuurbevinding zijn zonder nieuwe technologie.

### Phase C — informatie- en applicatiegevolgen

Een besluit moet herleidbaar zijn naar de gebruikte polisgrondslag. Aurora bepaalt welke businessbegrippen en versies nodig zijn en welke applicaties verantwoordelijk zijn voor vastlegging en presentatie. Het businessbegrip `Polis` is niet automatisch hetzelfde als één databasebestand.

### Phase D — technische randvoorwaarden

Betrouwbare toegang en beschikbaarheid vragen passende technische ondersteuning. Bestaande infrastructuur wordt hergebruikt wanneer relevant bewijs laat zien dat zij de targetrequirements ondersteunt. Een fase ‘leeg afvinken’ is geen tailoring; aantonen dat geen relevante wijziging nodig is, kan dat wel zijn.

Nieuwe inzichten kunnen eerdere keuzes raken. Als bijvoorbeeld de gebruikte polisversie niet beschikbaar blijkt, moet Aurora mogelijk een businesswerkwijze, informatie-eis of scope herzien. Iteratie is gericht leren, niet alle eerdere besluiten vergeten.

## 5. Requirements volgen door de ADM

Een requirement is bruikbaar wanneer duidelijk is welke behoefte zij dient, wat zij verlangt en hoe naleving kan worden onderzocht.

Voor de oefening gebruiken we **R-01**: bij een uitgelegd claimbesluit kan de behandelaar terugvinden welke polisgrondslag is gebruikt. Dit is een casusrequirement, geen letterlijk TOGAF-voorschrift.

| Moment | Verduidelijking | Bewijs of besluit |
|---|---|---|
| A | Herleidbaarheid blijkt een stakeholderconcern. | Herkomst en beoogd gebruik vastleggen. |
| B | Bepalen welke rol grondslag vastlegt en gebruikt. | Verantwoordelijkheid en werkafspraak. |
| C | Relatie tussen besluit en gebruikte polisversie uitwerken. | Informatiemodel en applicatieverantwoordelijkheid. |
| D | Betrouwbare opslag en toegang uitwerken. | Technische randvoorwaarden binnen scope. |
| G | Implementatie toont alleen de actuele polis. | Afwijking vaststellen; impact beoordelen; herstel of expliciete wijziging beslissen. |

Een team mag R-01 niet stilzwijgend reduceren tot `er staat ergens een polisnummer`. Daarmee kan de betekenis verloren gaan. Requirements mogen wel veranderen wanneer stakeholderbehoeften of evidence wijzigen, maar dan worden reden, impact en besluit expliciet vastgelegd.

**Aanvultaak.** De conceptrequirement `de klant moet sneller geholpen worden` is onvoldoende. Verbeter haar zonder een fictieve norm als feit te presenteren. Benoem welk waardemoment moet verbeteren, hoe begin en einde gemeten worden en welke norm nog als besluit openstaat.

## 6. Van architectuur naar verandering

Stel dat Aurora twee opties ziet.

**Optie A:** eerst werkwijze, verantwoordelijkheden en herleidbare vastlegging verbeteren met bestaande middelen.

**Optie B:** tegelijk een applicatie vervangen.

In Phase E onderzoek je welke work packages en overgangstoestanden nodig zijn en of tussenstappen samenhangend kunnen functioneren. In Phase F worden afhankelijkheden, prioriteiten, risico’s en planning verder uitgewerkt. Geen van beide opties is automatisch de winnaar.

Tijdens Phase G beoordeel je of het afgesproken gedrag werkelijk wordt gerealiseerd. Een technisch werkende demo is onvoldoende wanneer behandelaars de grondslag nog steeds niet kunnen terugvinden. Omgekeerd hoeft niet elk implementatiedetail een nieuw architectuurbesluit te zijn: materialiteit en impact worden beoordeeld.

In Phase H worden nieuwe signalen beoordeeld op architectuurimpact. Een nieuwe productvorm kan veel impact hebben; een tekstcorrectie mogelijk weinig. Preliminary wordt heropend wanneer de architectuurcapability of haar fundamentele uitgangspunten moeten worden aangepast, niet automatisch bij elk wijzigingsverzoek.

## 7. Tailoring en hergebruik met bewijs

Tailoring betekent niet: moeilijke fasen overslaan. Leg vast wat je hergebruikt, welke vragen al afdoende zijn beantwoord, welke onzekerheden openstaan en welke besluitvorming nog nodig is.

**Voorbeeld.** Aurora heeft een recent beoordeeld technologieplatform dat de gevraagde opslag en toegang aantoonbaar ondersteunt. Phase D kan dan lichter worden uitgewerkt door gericht de verschillen te onderzoeken. Vraagt een nieuwe requirement internationale beschikbaarheid, dan kan de eerdere onderbouwing onvoldoende worden.

**Foutvoorbeeld.** `We doen alleen Phase C, want het probleem zit in software.` Zolang die oorzaak niet is aangetoond en het businessresultaat niet scherp is, is dit een onbewezen scopekeuze.

Een goede tailoringzin bevat daarom minimaal: welk bestaand bewijs wordt hergebruikt, welke vraag daarmee al voldoende is beantwoord, welke afwijkingen nog moeten worden onderzocht en wie het besluit over voldoende dekking neemt.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Waarom kan een volledig geschreven document nog draft zijn?
2. Welke soorten scopebeslissingen moet je minimaal kunnen onderscheiden?
3. Waarom hoort een trade-off expliciet te worden gemaakt?
4. Welke fase ontwikkelt de Business Architecture verder?
5. Waarom staat Requirements Management niet simpelweg als één lineaire stap tussen twee fasen?

## Zelfstandige opdracht — Nova

Nova wil een externe partner laptops laten uitgeven. De bestaande inschrijvingsregistratie blijft. Werk uit:

- welke vragen je in Phase A stelt;
- welke Business Architecture-vragen in Phase B relevant zijn;
- welke informatie- en applicatievragen in Phase C ontstaan;
- welke migratievragen in E/F relevant zijn;
- hoe je de requirement volgt dat alleen de bedoelde deelnemer een bruikbaar apparaat met werkende toegang ontvangt;
- welke architectuur je onderbouwd kunt hergebruiken;
- hoe je een afwijking tijdens realisatie behandelt.

### Beoordelingscriteria

- Fasekeuzes zijn gemotiveerd door vragen en resultaten.
- Business-, informatie- en uitvoeringsgevolgen zijn verbonden.
- Een requirement heeft herkomst, betekenis, impact en verificatie.
- Tailoring berust op expliciet bewijs.
- Afwijkingen worden beoordeeld in plaats van stilzwijgend geaccepteerd.
- Alternatieven en trade-offs zijn zichtbaar wanneer ze beslisrelevant zijn.

### Vrijgegeven voorbeeldredenering

Phase A begrenst de partnerdienst, stakeholders, concerns en mandaat. Phase B bepaalt welke bijdrage en verantwoordelijkheid bij uitgifte nodig is. Phase C onderzoekt reservering, identiteit en toegangsgegevens. De bestaande inschrijvingsregistratie kan worden hergebruikt als betekenis en kwaliteit passen. De migratie moet ook overdracht en storingsafhandeling regelen. Een partnerdemo die een apparaat afgeeft zonder toegang te verifiëren bewijst de requirement nog niet.

## Zelftoets — 5 formatieve vragen

### Vraag 1

Welke toepassing van de ADM past het beste bij een gerichte wijziging?

- A. Scope en iteraties afstemmen op de vraag, met expliciete besluiten en requirements.
- B. Altijd alle fasen exact eenmaal en even diep uitvoeren.
- C. Architectuur overslaan zodra een team agile werkt.
- D. Requirements pas na implementatie vastleggen.

### Vraag 2

Waar draait Requirements Management om?

- A. De planning uit Phase F vervangen.
- B. Alleen de opdracht van Phase A opslaan.
- C. Technische eisen na Phase D permanent bevriezen.
- D. Requirements, wijzigingen en gevolgen door de architectuurontwikkeling heen beheren.

### Vraag 3

Wat onderscheidt Phase E en Phase F het beste?

- A. E maakt de Business Architecture; F de Data Architecture.
- B. F vervangt zonder onderbouwing alle besluiten uit E.
- C. E onderzoekt oplossings- en transitiemogelijkheden; F werkt migratieprioriteit en planning verder uit.
- D. E is uitsluitend programmeren; F uitsluitend testen.

### Vraag 4

Een implementatie wijkt af van afgesproken herleidbaarheid. Welke fase heeft hier een directe governancefunctie?

- A. Alleen Phase H, want afwijkingen worden pas na livegang bekeken.
- B. Geen enkele fase.
- C. Preliminary.
- D. Phase G — Implementation Governance.

### Vraag 5

Waarom is `we slaan Phase D over, want bestaande infrastructuur is goed` onvoldoende tailoring?

- A. Omdat `goed` zonder relevant bewijs en verschilonderzoek geen onderbouwing is.
- B. Omdat Technology Architecture altijd de belangrijkste fase is.
- C. Omdat alleen leveranciers tailoring mogen beslissen.
- D. Omdat een fase nooit lichter mag worden uitgevoerd.

## Naar module 3

Module 3 onderzoekt de businessmodellogica achter de dienstverlening. Neem mee dat Phase A richting en scope geeft en Phase B de Business Architecture verder uitwerkt: een businessmodel kan daarbij context en strategische aannames leveren, maar vervangt de Business Architecture niet.

## Bronbasis

- The Open Group, TOGAF Standard, 10th Edition-body of knowledge.
- X2202 learning unit Introduction to the ADM.
- EAW e-learningontwerpmethode v4.
