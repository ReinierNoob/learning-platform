# Module 8 — Integratie van baseline naar target

Geconsolideerde rc2 • 3 september 2026

Onafhankelijke EAW-zelfstudie. Niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group. Casussen en oefengegevens zijn fictief. De module verbindt de technieken uit de leerlijn; een geïntegreerd oefendossier is geen bewijs van accreditatie, organisatiebrede geldigheid of gegarandeerd examensucces.

## Leerprestatie

Na deze module kun je Business Architecture-technieken in Phase A en Phase B positioneren, baseline en target op vergelijkbare kenmerken beschrijven, gaps afleiden, alternatieven en transities beoordelen en één requirement herleidbaar verbinden van stakeholderbehoefte tot verificatie. Je levert een samenhangend architectuurdossier op waarin aannames, evidence en resterende onzekerheden zichtbaar blijven.

## 1. Eén architectuurdossier rond één veranderingsvraag

Een businessmodel, capability map en value stream naast elkaar leggen is nog geen integratie. De modellen moeten dezelfde scope, begrippen en relevante relaties gebruiken en samen een besluit ondersteunen.

Voor Aurora blijft de centrale vraag: hoe krijgt de verzekerde bij eenvoudige claims bruikbare duidelijkheid en hoe wordt een toegezegde geldelijke vergoeding aantoonbaar gerealiseerd?

Door de leerlijn heen zijn dezelfde codes gebruikt:

- capabilities C1–C5;
- value stages S1–S3;
- information concepts Claim, Polis, Polisversie, Besluit, Toelichting en Betaling;
- requirements R-01 t/m R-04.

Deze codes zijn lescodes en geen bewijs van een complete enterprise repository.

## 2. Exam core — Business Architecture in Phase A en Phase B

De syllabus vraagt expliciet dat je kunt uitleggen hoe Business Architecture-technieken in Phase A en Phase B worden toegepast.

| Techniek/concept | Phase A — Architecture Vision | Phase B — Business Architecture |
|---|---|---|
| Business capabilities | High-level scope, benodigde vermogens en belangrijke verandergebieden zichtbaar maken. | Capabilities verder analyseren, baseline/target vergelijken en gaps/prioriteiten begrijpen. |
| Value streams | Stakeholderwaarde en relevante high-level waardestroom voor de visie zichtbaar maken. | Value stages verder modelleren en aan capabilities koppelen. |
| Organization maps | Relevante organisatiecontext en stakeholders helpen afbakenen. | Verantwoordelijkheden, bijdragen en baseline/targetrelaties verdiepen. |
| Information maps | Informatiecontext en belangrijke businessbegrippen kunnen helpen verduidelijken. | Businessinformatie en relaties verder analyseren en aansluiting naar Data Architecture ondersteunen. |
| Business modeling | Strategische/businessmodelcontext voor de visie zichtbaar maken. | Implicaties voor capabilities, value streams, organisatie en informatie verder uitwerken. |

Niet iedere opdracht gebruikt ieder model op dezelfde diepte. Tailoring blijft nodig.

### Phase A — visie en scope op hoofdlijnen

Phase A helpt de veranderingsopgave kaderen: waarom verandering nodig is, welke stakeholders en concerns relevant zijn, wat de scope is en welke richting de Architecture Vision heeft. Business Architecture-concepten ondersteunen die visie zonder dat de volledige Phase B-analyse al af hoeft te zijn.

### Phase B — Business Architecture ontwikkelen

In Phase B worden relevante baseline- en targetkenmerken verder uitgewerkt, Business Architecture-technieken toegepast en gaps vastgesteld. De modellen worden niet gemaakt om een methodische checklist af te vinken, maar om samenhang en besluitvorming te ondersteunen.

## 3. Baseline en target vergelijkbaar maken

Een zuivere gap vraagt dat baseline en target dezelfde soort kenmerken beschrijven. `Baseline: medewerkers werken handmatig` en `Target: klant krijgt binnen een afgesproken tijd uitleg` zijn niet direct vergelijkbaar: de eerste uitspraak gaat over uitvoering, de tweede over een resultaat.

Voor Aurora gebruiken we de volgende fictieve oefenvergelijking:

| Kenmerk | Baseline in oefencasus | Targetvoorstel | Bewijs/beperking |
|---|---|---|---|
| Gereedcriterium S2 | Intern besluit kan gereed heten vóór uitleg is afgeleverd. | Besluit plus relevante uitleg en vervolgstap horen bij de afgesproken S2-exit. | Dossierselectie laat kloof zien; organisatiebrede omvang onbekend. |
| Grondslag | In onderzochte gevallen niet altijd eenvoudig herleidbaar. | Ieder besluit verwijst herleidbaar naar gebruikte polisgrondslag. | Werkwijze en informatie nog in echte situatie te toetsen. |
| Overdracht | Teams hanteren eigen taakgrenzen. | Overdracht bevat afgesproken inhoud en toegewezen vervolgactie. | Definitieve mandaten nog te valideren. |
| Betaalafronding S3 | Verzonden opdracht kan intern als gereed worden gezien. | Afgesproken bewijs van correcte ontvangst plus afsluitinformatie. | Financiële experts moeten geschikt bewijs bepalen. |
| Meting | Interne taakstatus en stakeholderresultaat niet volledig gescheiden. | Verschillende waardemomenten en afwijkende uitkomsten afzonderlijk zichtbaar. | Meetbaarheid bewijst nog geen verbetering. |

Een baseline hoeft niet perfect volledig te zijn, maar moet voldoende betrouwbaar zijn voor het besluit waarvoor zij wordt gebruikt. Markeer onzekerheid en het risico daarvan.

## 4. Gaps afleiden

Een gap beschrijft een relevant verschil dat voor de targetarchitectuur moet worden overbrugd. Maak duidelijk of iets wordt behouden, gewijzigd, toegevoegd of beëindigd.

| Gap | Geraakte samenhang | Type verandering | Mogelijke maatregel |
|---|---|---|---|
| G1 Intern gereed maskeert ontbrekende uitleg | S2, C1, C5, Besluit, Toelichting, R-02 | Gewijzigde grens, informatie en verantwoordelijkheid | Overdracht en statusdefinitie aanscherpen; uitvoering toetsen. |
| G2 Gebruikte grondslag onvoldoende herleidbaar | C1.2/C1.3, Polisversie, Besluit, R-01 | Verbeterde informatieborging | Versierelatie vastleggen en raadplegen mogelijk maken. |
| G3 Mislukte betaling verdwijnt uit afrondingsbeeld | S3, C2, Betaling | Gewijzigde status en herstelafspraak | Afwijkende uitkomst openhouden en actief opvolgen. |

Niet elk verschil vraagt een nieuwe capability. Een bestaand vermogen kan een andere realisatie, informatievoorziening of performance nodig hebben.

**Aanvultaak.** `C1 ontbreekt in de target, want straks beoordeelt een systeem.` Verbeter deze redenering. Het beoordelingsvermogen blijft nodig; alleen de realisatie kan veranderen. Onderzoek verantwoordelijkheid, kennis, informatie en controles in de target.

## 5. Van gap naar requirements en architectuurbesluit

Neem G1. De trace is:

1. stakeholderconcern: de verzekerde heeft bruikbare duidelijkheid nodig;
2. value stage: S2 Aanspraak verduidelijkt;
3. capabilities: C1 en C5;
4. information concepts: Besluit, Polisversie, Toelichting;
5. organization: Team Schade en Klantondersteuning;
6. scenario: intern gereed besluit levert nog niet altijd bruikbare uitleg;
7. requirement R-02: overdracht bevat besluit, motivering en toepasselijke vervolgstap;
8. gap G1: huidige gereedstatus en overdracht sluiten niet aantoonbaar aan op target;
9. verificatie: concrete cases volgen en controleren of overdracht en uitleg voldoen.

Dat is traceability. Een lijst documentnamen zonder inhoudelijke relaties is dat niet.

## 6. Alternatieven eerlijk beoordelen

We vergelijken twee ontwerpopties zonder fictieve baten of kosten te verzinnen.

| Aspect | Optie A — eerst werkwijze en informatie verbeteren | Optie B — tegelijk applicatievervanging |
|---|---|---|
| Beoogde bijdrage | Heldere overdracht, status en grondslag met bestaande middelen beproeven. | Verbeteringen combineren met nieuwe technische ondersteuning. |
| Afhankelijkheden | Beschikbare registratie en passende verantwoordelijkheden. | Daarnaast selectie, migratie, integratie en invoering van nieuwe applicatie. |
| Belangrijk risico | Bestaande middelen ondersteunen de targetafspraken mogelijk onvoldoende. | Grotere verandering combineert meerdere onzekerheden en afhankelijkheden. |
| Benodigd bewijs | Kan proefwerkwijze de targetcriteria realiseren? | Zijn benodigde functies, migratie en uitvoerbaarheid aangetoond? |

Een voorlopige voorkeur voor optie A kan verdedigbaar zijn **als** bestaande voorzieningen de kritieke targetafspraken kunnen ondersteunen. Dat is een conditioneel besluit, geen universele voorkeur voor kleine veranderingen.

Architectuur moet ook ongewenste effecten onderzoeken. Een snellere lokale taak is geen verbetering wanneer fouten of werk naar een andere stage verschuiven.

## 7. Transitiearchitectuur — een tussenstap moet zelfstandig werken

Een transitiearchitectuur is meer dan een datum tussen baseline en target. Een tussenstap moet binnen haar scope zelfstandig bruikbaar zijn.

Voor G1 kan een pilottransitie bijvoorbeeld eisen dat:

- rollen voor besluit en uitleg duidelijk zijn;
- R-02 in de overdracht wordt ondersteund;
- benodigde information concepts beschikbaar zijn;
- een mislukte aflevering herkenbaar open blijft;
- foutafhandeling en terugkoppeling bestaan;
- historie niet wordt verwijderd door nieuwe statusbetekenis.

Een transitie die alleen `nieuwe status invoeren op 1 oktober` zegt, beschrijft geen werkbare architectuur.

## 8. Integriteitscontrole over alle modellen

Voer vóór het eindbesluit vijf controles uit.

### Scopeconsistentie

Hebben businessmodel, capabilities, value stream, mappings en scenario dezelfde relevante claimscope? Wanneer een model bezwaar omvat en een ander niet, is dat expliciet?

### Begripsconsistentie

Betekenen `Besluit`, `Polisversie`, `Toelichting` en `Betaling` overal hetzelfde?

### Identifierconsistentie

Worden C1–C5, S1–S3 en R-01–R-04 hergebruikt zonder nieuwe betekenis aan dezelfde code te geven?

### Bewijsconsistentie

Worden fictieve observaties niet ineens als organisatiebrede feiten gepresenteerd?

### Besluitconsistentie

Volgt de gekozen maatregel werkelijk uit de gaps en requirements, of is een voorkeursoplossing achteraf in de modellen geschreven?

## 9. Executive architectuurnotitie

Een goed einddossier moet niet alleen voor architecten leesbaar zijn. Maak daarom een executive samenvatting van maximaal één pagina met:

- de veranderingsvraag en scope;
- de belangrijkste stakeholderwaarde;
- de kerncapabilities;
- de belangrijkste informatie- en organisatieverandering;
- de aantoonbare gaps;
- de beoordeelde opties;
- het voorlopige besluit;
- onzekerheden en bewijs dat nog ontbreekt.

De detailmodellen blijven beschikbaar als onderbouwing. De samenvatting vervangt die niet.

## Retrieval checkpoint

Beantwoord zonder terug te kijken:

1. Waarom is het onjuist om Phase A te behandelen als volledig uitgewerkte Business Architecture?
2. Welke drie Business Architecture-concepten zijn expliciet relevant voor de Architecture Vision in Phase A?
3. Wat is het doel van verdere Business Architecture-uitwerking in Phase B?
4. Waarom moet baseline en target op vergelijkbare kenmerken worden beschreven?
5. Waarom kan dezelfde capability in Phase A en Phase B voorkomen met ander detailniveau?
6. Welke fout maak je wanneer je van één capabilitygap direct naar `vervang applicatie X` springt?

## Zelfstandige eindopdracht — Nova

Maak een geïntegreerd architectuurdossier voor bruikbare leenlaptops. Hergebruik je eerdere Nova-uitwerkingen.

### Vereist

- veranderingsvraag en scope;
- relevante businessmodelaannames;
- capabilitycatalogus en minimaal één decompositie;
- value stream met stages, criteria en afwijkende route;
- information map;
- organization map inclusief externe uitgiftepartner;
- Business Scenario met requirements;
- vergelijkbare baseline en target;
- minimaal drie gaps;
- twee veranderopties;
- één zelfstandig werkbare transitiearchitectuur;
- één requirement volledig traceren van stakeholderbehoefte tot verificatie;
- executive samenvatting van maximaal één pagina.

### Beoordelingscriteria

- Scope en begrippen blijven consistent tussen modellen.
- Baseline en target vergelijken dezelfde kenmerken.
- Gaps volgen uit aantoonbare verschillen.
- Capabilities en hun realisatie zijn onderscheiden.
- Alternatieven en afhankelijkheden zijn eerlijk beoordeeld.
- De transitie is zelfstandig bruikbaar met rollen, informatie en herstel.
- Het besluit is traceerbaar naar requirements en bewijs.
- Onzekerheden en aannames blijven zichtbaar.
- De executive samenvatting ondersteunt besluitvorming zonder bewijs weg te laten.

### Vrijgegeven voorbeeldredenering

Bij Nova blijft `bruikbaar kunnen deelnemen` het positieve eindresultaat. Een reservering is een noodzakelijke tussenuitkomst, geen eindwaarde. Een gap kan liggen tussen een gereserveerd apparaat en gecontroleerde toegang bij uitgifte. Optie A verbetert de gezamenlijke uitgiftecontrole; optie B vervangt daarnaast reserveringssoftware. Onderzoek eerst welk tekort de mislukte starts verklaart. Een partnerpilot is alleen zelfstandig bruikbaar wanneer reservering, identiteit, toegang en storingsopvolging samen zijn geregeld.

## Zelftoets — 3 formatieve vragen

### Vraag 1

Wat maakt een gap analysis inhoudelijk bruikbaar?

- A. Vergelijkbare baseline- en targetkenmerken met expliciete verschillen en bewijs.
- B. Alleen twee diagrammen met verschillende kleuren.
- C. Iedere targetcapability als volledig nieuw bestempelen.
- D. De baseline overslaan om sneller te plannen.

### Vraag 2

Welke vraag toetst of een transitiearchitectuur werkbaar is?

- A. Heeft het plaatje minder vakken dan de target?
- B. Kunnen rollen, informatie en uitzonderingsafhandeling tijdens de tussenstap de afgesproken dienst leveren?
- C. Staat er een einddatum in de titel?
- D. Worden alle historische gegevens meteen verwijderd?

### Vraag 3

Wat is een kernverschil tussen Phase A en Phase B voor Business Architecture?

- A. Phase A kadert visie, scope en high-level architectuur; Phase B ontwikkelt de Business Architecture verder en analyseert baseline, target en gaps.
- B. Phase A is alleen technologie en Phase B alleen finance.
- C. Phase B mag geen capabilities of value streams gebruiken.
- D. Er is geen betekenisvol verschil.

## Afronding van de leerlijn

Na deze module heb je zowel de Foundation-examenconcepten als een professionele toepassingslaag doorlopen. De formatieve zelftoetsen ondersteunen leren; ze bewijzen geen beroepsbekwaamheid en vormen nog niet de afzonderlijke exam simulation. De volgende kwaliteitsstap is traceability op learning-outcome-niveau en daarna een onafhankelijke 40-vragen mock volgens de officiële onderwerpverdeling.

## Bronbasis

- The Open Group, TOGAF Standard, 10th Edition-body of knowledge.
- X2202 Unit Applying Business Architecture Techniques within the TOGAF ADM.
- De TOGAF Series Guides die in modules 3–7 zijn gebruikt.
- EAW e-learningontwerpmethode v4.
