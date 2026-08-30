# Adaptive Solution Architecture — Module 6 pilot review

**Datum:** 2026-08-31  
**Status:** preview-only / draft PR  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Module:** Solution Architecture — Module 6, Ontwerpkeuzes en trade-offs

## 1. Doel van de pilot

Valideren dat de EAW Adaptive Learning v2-architectuur daadwerkelijk een leerroute kan aanpassen op aangetoond bewijs en misconcepties, zonder de bestaande productieflow te wijzigen en zonder antwoordkeys of beoordelingsregels naar de client te lekken.

De inhoudelijke basis is de bestaande EAW Module 6 over ontwerpkeuzes, trade-offs en ADR's. De fictieve casus Gemeente Middelveen blijft de doorlopende oefencasus.

## 2. Gerealiseerde runtime

De pilot realiseert de volgende keten:

`Eva intake → server-side evidence-analyse → learner model → route A/B/C → Eva/Alexander interventies → eindcheck → mastery-update → gerichte remediation → eindcheck`

Gerealiseerd:

- vier diagnostische vragen, één per beurt;
- server-side evidence-classificatie;
- server-side misconceptiedetectie;
- drie routes met reason code en evidence ids;
- session-only learner model;
- cursist kan vanuit een verkorte route de volledige basisroute kiezen;
- inhoudelijke interventies zijn gekoppeld aan expliciete objective ids;
- native afwegingsbord en ADR-kaart reageren op de interventie;
- antwoordkey van de eindcheck staat uitsluitend server-side;
- fouten in de eindcheck genereren een gerichte remediation sequence;
- na remediation volgt opnieuw de verplichte eindcheck;
- labpagina en lab-API's geven in productie 404;
- geen databasewijzigingen;
- geen nieuwe avatarvideo's geproduceerd.

## 3. Routecontract

### Route A — volledige basisroute

Trigger: weinig of conflicterend diagnostisch bewijs.

Doel: volledige opbouw van trade-offs, alternatieven, ADR-anatomie en consequenties, inclusief expliciete reparatie van de kernmisconceptie rond trade-offs.

### Route B — verkorte route met verificatie

Trigger: minimaal drie van de vier diagnostische bewijsitems aangetoond en geen actieve misconceptie.

Doel: bekende basis verkorten, maar verificatie, consequenties, transfer en eindcheck behouden.

### Route C — gerichte herstelroute

Trigger: relevante voorkennis plus ten minste één actieve misconceptie.

Doel: niet terugvallen op de volledige beginnersroute; alleen de relevante misconcepties repareren en daarna transfer + eindcheck uitvoeren.

## 4. Scenario-QA routekeuze

De volgende zeven scenario's zijn gecontroleerd tegen de actuele classificatieregels:

| # | Scenario | Verwacht | Resultaat |
|---|---|---|---|
| 1 | Nauwelijks relevante voorkennis | A | PASS |
| 2 | Alle vier concepten overtuigend aangetoond | B | PASS |
| 3 | Drie van vier concepten aangetoond, geen misconceptie | B | PASS |
| 4 | Ervaring aanwezig + ADR-achteraf-misconceptie | C | PASS |
| 5 | Ervaring aanwezig + 'alleen positieve consequenties zijn voldoende' | C | PASS |
| 6 | Correcte negatie: 'een trade-off is géén fout' | B | PASS |
| 7 | Correcte negatie: 'niet achteraf, maar vooraf' | B | PASS |

### Bevinding tijdens QA

De eerste classifier-versie gebruikte te brede tekstpatronen en kon correcte ontkenningen als misconceptie markeren. De regels zijn aangescherpt zodat expliciete negaties niet langer automatisch een herstelroute veroorzaken.

**Generieke les:** adaptieve classificatie mag nooit alleen op los keyword presence sturen. Negatie, bewijssterkte en onzekerheid moeten expliciet onderdeel zijn van het learner-interviewer contract.

## 5. UX/UI-review

### Overgenomen verbeteringen

1. **Eén interviewvraag per beurt.**  
   De eerste versie toonde vier tekstvelden tegelijk. Dat voelde als een formulier in plaats van een interviewer. De huidige versie laat Eva één vraag per beurt stellen, met voortgang en terugnavigatie.

2. **Uitlegbare routekeuze.**  
   De cursist ziet welke route actief is en een reason code. De interne antwoordregels blijven server-side.

3. **Learner agency.**  
   Een cursist op B of C kan altijd de volledige basisroute openen en daarna terugkeren naar de geadviseerde route.

4. **Gerichte remediation.**  
   Een onvoldoende eindcheck leidt niet alleen tot een statusveld `needs_remediation`; de runtime maakt nu een kleine herstelroute op basis van de fout beantwoorde concepten.

5. **Geen verzonnen visualisatie-inhoud.**  
   De bron ondersteunt de te vergelijken alternatieven en kwaliteitsattributen, maar niet een gevalideerde win/verlieswaarde voor iedere matrixcel. De UI toont daarom `te beoordelen` en vermeldt expliciet dat celwaardering nog inhoudelijk gevalideerd moet worden.

### Nog te valideren

- echte browser-/responsive review op desktop en mobiel;
- leesbaarheid van decision log en learner model voor gewone cursisten: mogelijk later verplaatsen naar een debug-/uitlegmodus;
- gewenste balans tussen transparantie van adaptatie en cognitieve belasting;
- toegankelijkheid met toetsenbord en screenreader in een volledige browsertest.

## 6. Security- en architectuurreview

### Positief

- answer keys staan niet in de client-safe content graph;
- diagnostische scoring gebeurt server-side;
- geen service-role of andere secrets aan de browser toegevoegd;
- geen productie-DB gewijzigd;
- learner model is tijdelijk en niet persistent;
- preview-lab is expliciet 404 in `VERCEL_ENV=production`;
- preview staat achter Vercel-bescherming;
- standaard `/leren` routes zijn niet aangepast.

### Open voor productie

Voor een echte productieversie zijn minimaal nodig:

1. persistente `learner_profiles`, `learning_evidence` en `adaptive_decisions` met passende RLS;
2. server-side authorization op alle adaptive endpoints op basis van training entitlement;
3. valideerbare evidence-strength in plaats van alleen `pass/uncertain`;
4. auditbare versie van classifier/orchestratorregels;
5. bescherming tegen prompt-/tekstmanipulatie zodra LLM-gebaseerde interpretatie wordt toegevoegd;
6. retentie- en privacykeuzes voor learner evidence;
7. integratie in de bestaande `/leren` renderer zonder parallelle auth- of progressielaag.

## 7. Contentreview

De pilot blijft binnen de broninhoud voor Module 6:

- architectuurbeslissing versus implementatiedetail;
- trade-off als expliciete winst/verliesafweging;
- serieuze alternatieven;
- ADR-anatomie;
- positieve én negatieve consequenties;
- veelgemaakte ADR-fouten.

Niet toegevoegd als inhoudelijk feit:

- een volledige kwaliteitsattribuut-scorematrix voor de drie alternatieven;
- organisatie- of sectorspecifieke ISO/IEC 25010-benamingen;
- werkelijke gemeentelijke regelgeving rond gehandicaptenparkeerkaarten.

## 8. Retrospective

### Wat werkte

- de oude interactieve Value Streams-PoC was bruikbaar als UX- en rendererreferentie, maar niet als adaptieve engine;
- routekeuze via expliciete objective ids maakt de runtime testbaar en uitlegbaar;
- server-side antwoord- en diagnosecontract houdt didactische geheimen uit de browser;
- een preview-only lab maakt snelle validatie mogelijk zonder entitlement-, catalogus- of productierisico;
- eerst runtime valideren en pas daarna HeyGen-video's maken voorkomt verspilling en te vroege contentfixatie.

### Wat moest worden aangepast

- interviewer-UX van formulier naar één vraag per beurt;
- classifier van keyword-matching naar negatiebewuste regels;
- assessment van alleen meten naar meten + gerichte vervolginterventie;
- visualisatie van schijnzekerheid naar expliciete `nog te valideren`-toestand.

### Verbeteringen voor de generieke Adaptive Learning skills

**elearning-learner-interviewer**
- standaard maximaal één diagnostische vraag per beurt;
- onderscheid self-report, demonstrated evidence en misconception evidence;
- negatie en onzekerheid expliciet meenemen;
- nooit op één keyword een harde routebeslissing nemen.

**elearning-learner-model**
- mastery-status minimaal: `uncertain`, `demonstrated`, `misconception`, `needs_remediation`;
- elke statuswijziging koppelen aan evidence ids en classifier version;
- learner override apart loggen van systeemadvies.

**elearning-adaptive-orchestrator**
- verplichte leerdoelen nooit volledig overslaan;
- verkorten alleen bij aantoonbaar bewijs;
- eindcheck kan een nieuwe, kleinere remediation sequence genereren;
- na remediation opnieuw dezelfde of equivalente mastery-check uitvoeren;
- routebeslissing moet uitlegbaar zijn met reason code + evidence.

**elearning-adaptive-tutor**
- interventies krijgen stabiele id + objective id + type;
- content blijft binnen goedgekeurde bron;
- tutor vult ontbrekende modelwaarden niet zelf in;
- media is een presentatie-laag, niet de bron van routinglogica.

## 9. Gate-status

| Gate | Status |
|---|---|
| Bronbasis Module 6 | PASS |
| Route A/B/C contract | PASS |
| 7 scenario's classifier | PASS |
| Negatie-false-positive fix | PASS |
| Eén-vraag-per-beurt UX | PASS in code; browserreview open |
| Server-side antwoordkey | PASS |
| Assessment → remediation loop | PASS in code; browserreview open |
| Productie-isolatie | PASS in code/build |
| Preview build | opnieuw te bevestigen na laatste UX-commit |
| Persistente learner data | NOT IMPLEMENTED |
| Entitlement op adaptive endpoints | NOT IMPLEMENTED |
| HeyGen-media | NOT PRODUCED |
| Integratie standaard `/leren` | NOT IMPLEMENTED |
| Volledige UX/accessibility browsertest | OPEN |
| Productierelease | NO-GO |

## 10. Advies

Behandel deze versie als **Adaptive Learning v2 pilot baseline** zodra de laatste preview-build groen is. Daarna:

1. browser-/persona-review op route A, B, C en een assessment-remediation-cyclus;
2. pas de vier generieke adaptive-learning skills aan met bovenstaande retrospective-lessen;
3. ontwerp daarna de persistente learner/evidence/decision-laag;
4. produceer pas daarna de geselecteerde Eva/Alexander-mediainterventies;
5. integreer pas na die gates in de standaard `/leren` flow.

Niet mergen naar productie vóór deze stappen zijn uitgevoerd.
