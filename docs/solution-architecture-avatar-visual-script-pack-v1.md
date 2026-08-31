# Solution Architecture – Avatar & Visual Script Pack v1

**Course:** `solution-architectuur-ontwerppraktijk`  
**Pedagogische bron:** manifest `sha256:ab0186d5dd65e6598eb9f7ecd728fd9985a1fc0b1048cf46c2df2460b6edf6d3`  
**Taal:** Nederlands (`nl-NL`)  
**Status:** scripts en visual briefs gereed; avataridentiteiten en assets nog niet geproduceerd.

## Productieprincipes

- Eva is interviewer: activeert denken vóór uitleg, maakt ambiguïteit expliciet, stelt scherpe praktijkvragen.
- Alexander is tutor: structureert, legt uit, helpt afwegen en geeft remediation.
- Geen video om de video: een clip moet een duidelijke didactische functie hebben.
- Essentiële kennis staat nooit uitsluitend in video of beeld.
- Het videoscript geldt tevens als transcriptbasis; captions zijn release-verplicht.
- Iedere visual heeft een tekstueel equivalent/alt-beschrijving.
- Visuele stijl: rustige EAW-huisstijl, professioneel, architectuurgericht, veel witruimte, één kernboodschap per visual.

## Voorgestelde avatar-identiteiten — nog te accorderen vóór HeyGen-creatie

### Eva — interviewer

**Appearance prompt**  
Realistische Nederlandse vrouwelijke professional, begin veertig, zelfverzekerde maar toegankelijke uitstraling, donkerblond tot lichtbruin schouderlang haar, natuurlijke styling, rustige directe blik, subtiele zakelijke make-up, moderne donkerblauwe blazer over een lichte neutrale top, half-body framing, hoogwaardige corporate studioverlichting, rustige abstracte architectuur/blueprint-achtergrond, professioneel maar niet afstandelijk, geen headset, geen opvallende sieraden, fotorealistisch.

**Voice direction**  
Nederlands, vrouwelijk, helder en volwassen; rustig tempo; intelligent en licht uitdagend; warm genoeg om veilig te voelen maar met de scherpte van een ervaren interviewer.

### Alexander — tutor

**Appearance prompt**  
Realistische Nederlandse mannelijke architectuurprofessional, midden veertig, rustige deskundige uitstraling, kort donkerblond tot bruin haar met lichte grijstint bij de slapen, verzorgd, geen overdreven formele look, donkergrijze of navy overshirt/blazer met een lichte neutrale top, half-body framing, hoogwaardige corporate studioverlichting, subtiele abstracte systeem-/architectuurachtergrond, analytisch en benaderbaar, fotorealistisch.

**Voice direction**  
Nederlands, mannelijk, helder en rustig; analytisch; compact; coachend zonder schools te klinken; natuurlijke autoriteit, niet theatraal.

---

# Module 1 — Rol en positionering

## Eva — `sa-m01-eva-intro-v1`

> Je bent gevraagd een digitale aanvraagoplossing te ontwerpen. De opdrachtgever zegt: “Jij bent de architect, dus bepaal maar of we volledig digitaal gaan.” Wat neem jij als solution architect wél over, en wat juist niet? Denk niet alleen aan techniek. Maak expliciet wie het businessbesluit neemt, welke kaders al vaststaan en waar jouw ontwerpmandaat begint.

## Alexander — `sa-m01-alexander-explainer-v1`

> De kern is rolzuiverheid. Een solution architect vertaalt een vastgestelde businessvraag en architectuurkaders naar een samenhangende oplossing. Je bepaalt bijvoorbeeld hoe systemen samenwerken en welke oplossingskeuzes nodig zijn. Je beslist niet zelfstandig dát de organisatie stopt met papier. En een lokale teamkeuze zonder landschapsimpact laat je bij het team. Goed ontwerpen begint dus met weten waar je mandaat ophoudt.

## Visual — `sa-m01-roles-mandate-map-v1`

**Brief:** vier rollen — Business Architect, Enterprise Architect, Solution Architect en Delivery Team — met beslisrechten: businessrichting, enterprise-kaders, oplossingsontwerp en lokale implementatie. Maak escalatiegrenzen zichtbaar.  
**Alt:** Tabel met per rol wat deze beslist, adviseert, uitvoert en wanneer naar een andere rol wordt geëscaleerd.

---

# Module 2 — De businessvraag ontvangen en toetsen

## Eva — `sa-m02-eva-intro-v1`

> “Maak de aanvraag volledig digitaal.” Klinkt duidelijk, maar is dat het ook? Betekent volledig digitaal alleen indienen, of ook keuring, besluit en status? En wat gebeurt er met iemand zonder DigiD? Formuleer vóór je ontwerpt welke vragen je teruglegt en welke aannames je zichtbaar maakt.

## Alexander — `sa-m02-alexander-explainer-v1`

> Een oplossingsrichting is nog geen heldere opdracht. Scheid daarom resultaat, scope, randvoorwaarden en aannames. Vraag wat “volledig” betekent, wie de doelgroep is en welke uitzonderingen bestaan. Leg onbevestigde aannames vast als open punt. Zo voorkom je dat een impliciete veronderstelling stilletjes verandert in een technische afhankelijkheid. De architect maakt onzekerheid zichtbaar vóór die duur wordt.

## Visual — `sa-m02-question-scope-assumption-canvas-v1`

**Brief:** drie hoofdvlakken: businessdoel, afgebakende scope en te valideren aannames; aparte strook “besluit nodig”. Gebruik Middelveen-voorbeelden.  
**Alt:** Opsomming van businessdoel, scope, aannames en open beslissingen.

## Visual — `sa-m02-open-decisions-board-v1`

**Brief:** compact bord met statussen bevestigd, aanname, buiten scope en besluit nodig.  
**Alt:** Tekstlijst van open beslissingen met status en eigenaar.

---

# Module 3 — Stakeholders en eisen

## Eva — `sa-m03-eva-intro-v1`

> De gemeente wil actuele statusinformatie. Het klantcontactcentrum wil veel detail zien. De privacyfunctionaris wil juist minimale gegevensdeling. En een burger kan een aanvraag namens iemand anders doen. Wie mis je als je alleen naar de opdrachtgever kijkt? Benoem de belangen die werkelijk met elkaar botsen.

## Alexander — `sa-m03-alexander-explainer-v1`

> Stakeholderanalyse is geen namenlijst. Je zoekt naar belangen, invloed en conflicten die ontwerpkeuzes sturen. Zet vervolgens wensen om in toetsbare eisen. “Snel” is niet toetsbaar; “een volledige aanvraag krijgt binnen tien werkdagen een besluit” wel. Als eisen elkaar uitsluiten, kies je niet stilletjes zelf. Je maakt de consequenties zichtbaar en legt de beslissing neer waar het mandaat ligt.

## Visual — `sa-m03-stakeholder-tension-map-v1`

**Brief:** burger, gemachtigde, klantcontactcentrum, privacyfunctionaris, keuringsinstantie en opdrachtgever rond de oplossing; conflicterende belangen met spanningslijnen.  
**Alt:** Matrix stakeholder × belang × invloed × conflict.

## Visual — `sa-m03-requirement-quality-check-v1`

**Brief:** voorbeelden van vage wens naar toetsbare eis met labels meetbaar, conflicterend en besluit nodig.  
**Alt:** Teksttabel met oorspronkelijke wens, probleem en toetsbare herformulering.

---

# Module 4 — Kwaliteitsattributen

## Eva — `sa-m04-eva-intro-v1`

> Het portaal moet snel, veilig, gebruiksvriendelijk én vrijwel altijd beschikbaar zijn. Vier goede wensen — totdat ze elkaar raken. Een langere inlogsessie kan gebruiksgemak verbeteren en tegelijk het beveiligingsrisico verhogen. Welke kwaliteitseigenschappen sturen hier echt het ontwerp, en waar verwacht je een trade-off?

## Alexander — `sa-m04-alexander-explainer-v1`

> Kwaliteitsattributen worden pas bruikbaar als je ze koppelt aan context en meetbare grenzen. “Hoge beschikbaarheid” zegt weinig; 99,9 procent binnen een afgesproken dienstperiode is toetsbaar. Prioriteer niet alles als hoogste. Kijk naar doelen, stakeholders en risico’s. Wanneer twee gewenste eigenschappen elkaar beïnvloeden, maak je de trade-off expliciet en toets je de keuze tegen de dominante kwaliteitsdoelen.

## Visual — `sa-m04-quality-attribute-priority-board-v1`

**Brief:** prioriteitenbord voor performance efficiency, security, reliability/availability, interaction capability en maintainability; relatie met stakeholderdoelen en risico’s.  
**Alt:** Gerangschikte lijst van kwaliteitsattributen met reden en meetcriterium.

## Visual — `sa-m04-quality-tradeoff-overlay-v1`

**Brief:** laat zien hoe een keuze, bijvoorbeeld langere sessieduur, positief scoort op interaction capability maar negatief kan scoren op security.  
**Alt:** Tekstuele oorzaak-gevolgbeschrijving van de trade-off.

---

# Module 5 — Modelleren en visualiseren

## Eva — `sa-m05-eva-intro-v1`

> De wethouder wil begrijpen welke partijen en verantwoordelijkheden betrokken zijn. Het deliveryteam wil technische grenzen en afhankelijkheden zien. Toon je beide groepen hetzelfde diagram? Welke informatie moet je weglaten om een model juist bruikbaarder te maken?

## Alexander — `sa-m05-alexander-explainer-v1`

> Een architectuurmodel is geen doel op zichzelf. Kies een view op basis van de vraag en het publiek. C4 helpt je technisch van context naar container, component en eventueel code te zoomen. ArchiMate helpt relaties over meerdere architectuurlagen betekenisvol te presenteren. Gebruik ze niet als rivalen. De beste visualisatie bevat precies genoeg om de gewenste beslissing of discussie mogelijk te maken.

## Visual — `sa-m05-c4-level-ladder-v1`

**Brief:** vier duidelijke niveaus Context → Container → Component → Code met afnemende scope en toenemend technisch detail.  
**Alt:** Tekstuele beschrijving van de vier C4-niveaus en hun doelgroep.

## Visual — `sa-m05-viewpoint-selection-guide-v1`

**Brief:** besliskaart: bestuur → betekenis/relaties; architectuurreview → cross-layer relaties; deliveryteam → technische grenzen/afhankelijkheden.  
**Alt:** Tabel doelgroep × vraag × passend model/detailniveau.

---

# Module 6 — Ontwerpkeuzes en trade-offs

## Eva — `sa-m06-eva-intro-v1`

> Je vergelijkt twee alternatieven. Eén optie lijkt op álle relevante kwaliteitsattributen beter te scoren. Heb je dan een uitzonderlijk goede trade-off gevonden, of ontbreekt er iets in je analyse? En als je uiteindelijk kiest: welke nadelige consequenties moeten zichtbaar blijven in je besluit?

## Alexander — `sa-m06-alexander-explainer-v1`

> Een echte trade-off betekent dat een keuze ergens wint en elders een prijs heeft. Als één alternatief aantoonbaar overal beter is, heb je waarschijnlijk geen dilemma maar een gegeven. Leg een besluit vast in een ADR: context, beslissing, alternatieven en consequenties. Consequenties zijn nadrukkelijk niet alleen voordelen. Juist de lasten en beperkingen maken later begrijpelijk waarom deze keuze destijds verdedigbaar was.

## Visual — `sa-m06-tradeoff-matrix-v1`

**Brief:** Alternatief A en B tegenover dominante kwaliteitsattributen; gebruik plus/min/minus-neutraal met korte rationale, geen misleidende totaalscore.  
**Alt:** Tabel met per alternatief de positieve en negatieve consequenties per kwaliteitsattribuut.

## Visual — `sa-m06-adr-card-v1`

**Brief:** ADR-kaart met Context, Status, Beslissing, Alternatieven en Consequenties; highlight Consequenties als ontbrekend risico.  
**Alt:** Tekstsjabloon voor een ADR met dezelfde vijf onderdelen.

---

# Module 7 — Integratie en applicatielandschap

## Eva — `sa-m07-eva-intro-v1`

> Het burgerportaal heeft gegevens uit het zaaksysteem nodig en de keuringsinstantie levert enkele keren per dag een uitslag. Iemand stelt voor het portaal rechtstreeks op de database van het zaaksysteem aan te sluiten. Dat is snel. Maar welke afhankelijkheid koop je daarmee? En moet de keuringsuitslag worden bevraagd of juist als gebeurtenis worden ontvangen?

## Alexander — `sa-m07-alexander-explainer-v1`

> Een koppeling is een afspraak tussen partijen en dus altijd beheerlast. Vermijd dat een afnemer afhankelijk wordt van interne databasestructuren die eigenlijk vrij moeten kunnen veranderen. Gebruik stabiele gepubliceerde interfaces waar dat past. Bij een uitslag die op een bepaald moment ontstaat en herleidbaar moet zijn, is gebeurtenisgedreven uitwisseling logisch — mits bevestiging, logging en foutafhandeling expliciet zijn ontworpen.

## Visual — `sa-m07-system-context-integration-map-v1`

**Brief:** burgerportaal, zaaksysteem, BRP en keuringsinstantie met duidelijke interfacegrenzen; contrasteer directe databasekoppeling met gepubliceerde interface.  
**Alt:** Tekstlijst van systemen, verantwoordelijkheden en toegestane gegevensstromen.

## Visual — `sa-m07-sync-async-pattern-compare-v1`

**Brief:** twee banen: synchronous query versus event-driven push; toon beschikbaarheidsafhankelijkheid, timing, logging en foutafhandeling.  
**Alt:** Vergelijkingstabel synchroon versus gebeurtenisgedreven.

---

# Module 8 — Principes, governance en review

## Eva — `sa-m08-eva-intro-v1`

> Een ontwerp slaat een kopie van de keuringsuitslag op in het zaaksysteem, terwijl het architectuurprincipe zegt dat gegevens bij de bronhouder blijven tenzij dat aantoonbaar onwerkbaar is. Keur je het ontwerp direct af? Of kan een afwijking verdedigbaar zijn — en wat moet dan aantoonbaar worden gemaakt?

## Alexander — `sa-m08-alexander-explainer-v1`

> Een principe geeft richting bij afwegingen; het is geen losse slogan en ook niet automatisch een absoluut verbod. Een afwijking kan verdedigbaar zijn als context, consequenties, eigenaar en termijn expliciet zijn. Een reviewopmerking als “zo doen wij dat niet” is onvoldoende. Koppel het bezwaar aan een principe of eis, zodat het toetsbaar en weerlegbaar wordt. Governance maakt keuzes navolgbaar, niet bureaucratisch.

## Visual — `sa-m08-principle-deviation-board-v1`

**Brief:** principe → ontwerpkeuze → afwijking? → rationale → consequentie → eigenaar → vervaldatum/herbeoordeling.  
**Alt:** Tekstueel afwijkingsregister met deze velden.

## Visual — `sa-m08-review-decision-table-v1`

**Brief:** vier uitkomsten: akkoord, akkoord met expliciete afwijking, nadere onderbouwing nodig, escaleren.  
**Alt:** Beslissingstabel met criteria per reviewuitkomst.

---

# Module 9 — Realisatie en migratie

## Eva — `sa-m09-eva-intro-v1`

> Middelveen wil snelheid. Waarom niet gewoon digitale indiening, statusinzage en de keuringskoppeling in één weekend live zetten? Stel dat er maandag iets misgaat. Kun je dan nog aanwijzen welke wijziging de oorzaak is — en heb je een vooraf ontworpen weg terug?

## Alexander — `sa-m09-alexander-explainer-v1`

> Een doelarchitectuur wordt pas uitvoerbaar met tussenstappen die zelfstandig waarde leveren. Digitale indiening kan bijvoorbeeld eerst live terwijl de interne afhandeling nog gelijk blijft. Dat beperkt veranderomvang en maakt effecten beter observeerbaar. Ontwerp afhankelijkheden, go/no-go-criteria en rollback vooraf. Dubbeldraaien kost geld, maar kan rationeel zijn als die kosten lager zijn dan de schade van een mislukte overgang.

## Visual — `sa-m09-phased-roadmap-v1`

**Brief:** fase 1 digitale indiening, fase 2 betrouwbare identificatie/status, fase 3 keuringsintegratie; toon zelfstandige waarde en afhankelijkheden.  
**Alt:** Genummerde roadmap met per fase doel, afhankelijkheid en waarde.

## Visual — `sa-m09-rollback-gonogo-checkpoints-v1`

**Brief:** per fase entry criteria, go/no-go, observatieperiode en rollbackpad.  
**Alt:** Checklist per releasefase met criteria en herstelactie.

---

# Module 10 — Integrale eindcasus

## Eva — `sa-m10-eva-intro-v1`

> Nu komt alles samen. De opdrachtgever noemt al een burgerportaal. Bestuur wil rijke actuele status, privacy vraagt begrenzing, delivery wil beheersbare afhankelijkheden en keuringsuitslagen moeten herleidbaar zijn. Neem niets automatisch over omdat het als oplossing is geformuleerd. Welke aannames toets je, welke kwaliteitsattributen domineren en welke keuze kun je straks echt verdedigen?

## Alexander — `sa-m10-alexander-explainer-v1`

> Gebruik de hele redeneringsketen. Begin bij vraag, scope en aannames. Maak stakeholders en toetsbare eisen expliciet. Prioriteer kwaliteitsattributen. Kies views die de relevante beslissingen ondersteunen. Vergelijk alternatieven op consequenties, toets ze aan principes en leg het besluit vast. Ontwerp daarna een realiseerbare route met rollback. Een goede solution architecture is niet het mooiste diagram, maar een samenhangend en navolgbaar besluit dat ook uitvoerbaar blijft.

## Visual — `sa-m10-integral-case-map-v1`

**Brief:** één integrale kaart met zeven zones: vraag/scope, stakeholders, eisen, kwaliteitsattributen, alternatieven, principes/besluiten en realisatiefasen. Relaties zijn belangrijker dan detail.  
**Alt:** Gestructureerde tekstsamenvatting van de zeven zones en hun onderlinge relaties.

## Visual — `sa-m10-final-decision-tree-v1`

**Brief:** beslisboom van businessvraag via validatie, dominante trade-off, alternatiefkeuze, principle check, ADR en migratiestap.  
**Alt:** Genummerde beslisvragen in dezelfde volgorde.

---

# Release-assetcheck

Voor productie moeten minimaal gereed zijn:

- 1 goedgekeurde HeyGen-identiteit + Nederlandse voice voor Eva;
- 1 goedgekeurde HeyGen-identiteit + Nederlandse voice voor Alexander;
- 20 clips: 10 Eva + 10 Alexander;
- captions en transcript voor alle 20 clips;
- 19 visuals uit dit pack;
- tekstueel equivalent/alt voor iedere visual;
- runtime-integratie waarin media niet essentieel is voor begrip;
- secure-media gate opnieuw uitgevoerd na echte mediakoppeling;
- desktop/mobile/touch/keyboard/accessibility-gate pas daarna.

> Let op: de assettelling is 19 visuals (Module 1 heeft één visual; Modules 2–10 hebben er twee). Dit document is de productdefinitie; de registry en CI moeten dezelfde telling afdwingen.
