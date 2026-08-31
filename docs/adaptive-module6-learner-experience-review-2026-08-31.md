# Adaptive Module 6 — learner-experience review

**Datum:** 31 augustus 2026  
**Scope:** wat de cursist daadwerkelijk ziet en doet in de huidige Adaptive Module 6-runtime  
**Productie gewijzigd:** nee

## Bewijsbasis

Deze review is gebaseerd op de actuele featurebranch:

- `components/adaptive/solution-architecture-module-6/AdaptiveModule6Experience.tsx`;
- `components/adaptive/solution-architecture-module-6/experience.module.css`;
- `lib/solution-architecture-module-6.ts`;
- de standaard `/leren` wrapper voor Module 6.

De protected preview en Next.js-route zijn technisch bereikbaar, maar de uitvoeromgeving laat geen volledige visuele browserrender/screenshot toe. Daarom zijn onderstaande bevindingen gebaseerd op de daadwerkelijk gerenderde componentstructuur, tekst, interactieregels en responsive CSS. Live pixel-, touch- en screenreaderbewijs blijft apart OPEN.

## Wat de cursist nu ervaart

### 1. Start / intake

De cursist ziet:

- `Solution Architecture · Module 6`;
- titel `Ontwerpkeuzes en trade-offs`;
- uitleg dat Eva vier korte vragen stelt;
- één open vraag per scherm;
- voortgang `Vraag x van 4`;
- een vrij tekstveld;
- vorige/volgende navigatie;
- na vraag 4: `Bepaal mijn leerroute`.

De vier intakevragen gaan direct over Middelveen, ontwerpkeuzes, ADR's en trade-offs.

### 2. Routebesluit

Na de intake krijgt de cursist één van drie routes:

- Volledige basisroute;
- Verkorte route met verificatie;
- Gerichte herstelroute.

De route staat in de donkere zijbalk met voortgang en een lijst van leerstappen. Toekomstige stappen zijn vergrendeld. Vanuit route B/C kan de cursist bewust kiezen voor de volledige uitleg.

### 3. Leren met Eva en Alexander

Per stap ziet de cursist:

- wie aan het woord is: Eva of Alexander;
- een titel van de leerstap;
- een afwegingsbord voor Gemeente Middelveen;
- een ADR-kaart die tijdens de route wordt opgebouwd;
- uitleg of een opdracht;
- bij een tutorvraag: een veld `Jouw redenering`;
- feedback van Eva/Alexander;
- pas na voldoende redenering wordt `Volgende` beschikbaar.

### 4. Eindcheck

Iedere route eindigt met een verplichte eindcheck. De cursist beantwoordt drie meerkeuzevragen en krijgt daarna:

- score;
- bij succes: melding dat de gecontroleerde concepten zijn aangetoond;
- bij onvoldoende resultaat: alleen de relevante herstelstappen en daarna opnieuw de eindcheck.

## Positieve UX-bevindingen

### PASS — route is foolproof

Toekomstige stappen zijn daadwerkelijk locked. De routekaart kan de eindcheck niet omzeilen.

### PASS — learner agency

Een cursist op route B/C kan altijd kiezen voor volledige uitleg en later terugkeren naar de geadviseerde route.

### PASS — tutorvragen hebben een functie

Een redeneringsvraag is niet meer decoratief. De cursist krijgt feedback en moet zo nodig herschrijven voordat hij verder kan.

### PASS — gerichte remediation

Na een fout in de eindcheck hoeft de cursist niet de volledige module opnieuw te doen.

### PASS — basis toegankelijkheidssemantiek

De component gebruikt onder meer progressbar-semantiek, `aria-current`, alerts/statusmeldingen, `fieldset/legend`, focusmanagement en minimaal 44px hoge controls.

### PASS — aparte mobiele representatie van het afwegingsbord

Onder 760px wordt de brede matrix vervangen door kaarten per alternatief. Dit is beter dan horizontaal slepen door een desktopmatrix.

## Verbeterpunten

### P0 — na een geslaagde eindcheck ontbreekt een duidelijke vervolgstap

Na succes ziet de cursist `Deze modulecheck is afgerond`, maar er verschijnt geen primaire actie zoals:

- `Rond module af`;
- `Terug naar de training`;
- `Ga naar Module 7`.

De normale `Volgende`-knop blijft op de assessmentstap uitgeschakeld omdat de eindcheck het laatste route-item is.

**Effect:** de cursist bereikt inhoudelijk het einde maar krijgt geen duidelijke exit of volgende actie.

**Aanbeveling:** voeg na succesvolle eindcheck een primaire completion-CTA toe die teruggaat naar de training en, zodra voortgangsintegratie definitief is, de module als afgerond toont.

---

### P1 — op mobiel begint iedere leerroute met een lange open zijbalk

De `details` voor `Bekijk leerstappen` staat standaard `open`. Op desktop is dat logisch, maar onder 760px wordt de hele sidebar boven de lesinhoud geplaatst.

**Effect:** een mobiele cursist ziet eerst routebeschrijving + voortgang + alle leerstappen voordat de feitelijke leerstap begint.

**Aanbeveling:** op mobiel standaard inklappen; desktop mag open blijven.

---

### P1 — technische reviewinformatie is zichtbaar voor gewone cursisten

Onderaan de leerervaring staat altijd een inklapbaar blok `Reviewdetails adaptieve leerroute` met termen zoals:

- Routebesluit;
- reason code;
- evidence;
- Misconcepties;
- Learner model;
- persistence.

**Effect:** dit is nuttig voor QA en architectuurreview, maar niet voor een normale cursist. Het maakt de training technischer en minder professioneel afgewerkt.

**Aanbeveling:** alleen tonen in de QA/lab-harness of met een expliciete reviewerflag; nooit standaard in `/leren`.

---

### P1 — de intake dwingt een antwoord af, ook als de cursist het niet weet

Iedere vraag heeft een vrij tekstveld en `Volgende` blijft uitgeschakeld wanneer het veld leeg is.

**Effect:** juist beginners kunnen gaan gokken of tekst verzinnen om verder te mogen. Dat is ongunstig voor een adaptieve intake, omdat onzekerheid zelf waardevol bewijs is.

**Aanbeveling:** voeg `Ik weet dit nog niet` / `Nog niet zeker` toe als expliciet antwoord. Dat moet als onvoldoende bewijs naar route A kunnen leiden, niet als fout worden behandeld.

---

### P1 — de casus begint zonder korte situering

De eerste intakevraag start direct met:

`Je moet kiezen hoe Middelveen de keuringsgegevens uitwisselt...`

Er staat vooraf nog geen korte uitleg van Gemeente Middelveen of wat de cursist in deze casus gaat ontwerpen.

**Effect:** de vraag test deels of de cursist de context kan raden in plaats van alleen het bedoelde architectuurconcept.

**Aanbeveling:** voeg vóór vraag 1 een korte casuskaart toe, bijvoorbeeld: de cursist beoordeelt in Middelveen hoe keurings- en statusinformatie tussen systemen wordt uitgewisseld en welke ontwerpkeuzes daarbij verantwoord zijn.

---

### P2 — routebeschrijvingen klinken als interne classificatietaal

De cursist leest formuleringen als:

- `Weinig of conflicterend bewijs`;
- `misconcepties worden expliciet gerepareerd`;
- `actieve misconceptie`;
- `Gerichte herstelroute`.

**Effect:** correct voor een learner model, maar onnodig beoordelend in de leerervaring.

**Aanbeveling:** houd reason codes en misconceptietermen intern en maak de routebeschrijvingen learner-facing, bijvoorbeeld `We bouwen de kern stap voor stap op` of `We besteden extra aandacht aan een paar onderdelen`.

---

### P2 — op mobiel komt het afwegingsbord vóór de uitleg

In de DOM staat `visualPanel` vóór `lessonPanel`. Onder 1100px wordt de layout één kolom, zonder orderwijziging.

**Effect:** op mobiel ziet de cursist eerst de matrix/ADR-kaart en pas daarna de uitleg of opdracht die betekenis geeft aan dat bord.

**Aanbeveling:** onder tabletbreedte eerst de les/uitleg tonen en daarna het visuele bord, of het bord als inklapbare `Bekijk de afweging`-sectie tonen.

## Cursistperspectief per persona

### Beginnende Solution Architect

Sterk:
- duidelijke één-vraag-per-scherm intake;
- volledige basisroute is beschikbaar;
- toekomstige stappen zijn locked.

Frictie:
- casuscontext ontbreekt vóór vraag 1;
- geen veilige `ik weet het niet`-keuze;
- termen als `misconceptie` en `herstelroute` kunnen voelen als foutlabeling.

### Solution Architect met basiskennis

Sterk:
- verkorte route voorkomt onnodige herhaling;
- learner override naar volledige uitleg is uitstekend;
- transferoefening geeft meerwaarde.

Frictie:
- technische reviewdetails halen de gebruiker uit de leerervaring.

### Ervaren Solution Architect

Sterk:
- gerichte route en transfer zijn relevanter dan lineaire uitleg;
- ADR/trade-off casus is herkenbaar als ontwerppraktijk.

Frictie:
- de matrix bevat bewust nog geen gevalideerde scores en toont veel `te beoordelen`; zonder uitleg kan dit visueel als onaf voelen.

## Gatebesluit stap 1

### PASS
- leerflow is begrijpelijk;
- routekeuze is zichtbaar en uitlegbaar;
- locked progression werkt;
- tutorfeedback beïnvloedt vervolg;
- remediation is gericht;
- mobiele matrix heeft een eigen representatie.

### MOET WORDEN VERBETERD VOOR PUBLICATIE
1. completion-CTA na succesvolle eindcheck;
2. technische reviewdetails uit normale `/leren`-ervaring;
3. mobiele routekaart standaard ingeklapt;
4. `Ik weet dit nog niet` in intake;
5. korte Middelveen-casuscontext vóór de intake;
6. learner-friendly routebeschrijvingen;
7. mobile content order: uitleg vóór visual.

### OPEN BEWIJSGATE
- echte visuele desktopreview;
- fysieke mobile/touch review;
- keyboard/screenreader review.

## Conclusie

De adaptive leerervaring is inhoudelijk herkenbaar als een echte training en niet meer als alleen een technische PoC. De grootste resterende problemen zitten nu vooral in **afronding, onboarding en presentatie**, niet meer in de adaptive kernlogica.
