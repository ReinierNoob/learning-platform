# Adaptive Module 6 — vakinhoudelijke Solution Architecture-review

**Datum:** 31 augustus 2026  
**Scope:** Module 6 — Ontwerpkeuzes en trade-offs  
**Perspectieven:** senior Solution Architect, opleidingskundige, beginnende Solution Architect  
**Productie gewijzigd:** nee

## Conclusie

De module heeft een sterke en relevante kern: alternatieven vergelijken, trade-offs expliciteren, kwaliteitscriteria gebruiken en architectuurbeslissingen vastleggen in ADR's. De casus is voldoende concreet om professioneel redeneren te oefenen zonder te verzanden in technologiekeuze.

De review vond wel een aantal formuleringen die te absoluut of ambigu waren. Die zijn in `lib/solution-architecture-module-6.ts` gecorrigeerd.

## Gevalideerde referenties

### ISO/IEC 25010

Actueel is **ISO/IEC 25010:2023, Edition 2**, gepubliceerd in november 2023. Het product quality model bevat negen kenmerken en dient als referentiemodel voor het specificeren, meten en evalueren van productkwaliteit.

Bron: ISO, `ISO/IEC 25010:2023 — Systems and software engineering — SQuaRE — Product quality model`.

### ArchiMate

De actuele ArchiMate-specificatie is **ArchiMate 3.2**, uitgebracht in oktober 2022.

Bron: The Open Group, ArchiMate Licensed Downloads / ArchiMate Certification.

### TOGAF

De actuele TOGAF-standaard is **The TOGAF Standard, 10th Edition**, met **Technical Corrigendum 1**.

Bron: The Open Group Publications.

### Architecture Decision Records

Michael Nygard beschrijft de klassieke ADR met:

- Title;
- Status;
- Context;
- Decision;
- Consequences.

Consequenties omvatten positieve, negatieve en neutrale gevolgen. Een latere beslissing kan een eerdere ADR de status `deprecated` of `superseded` geven met een verwijzing naar de vervanger.

De ADR-community bevestigt daarnaast dat meerdere ADR-templates bestaan, waaronder Nygard, MADR en Y-Statements. MADR maakt overwogen opties en hun voor- en nadelen explicieter.

## Bevindingen en doorgevoerde verbeteringen

### 1. Aantal alternatieven

**Oorspronkelijk:** de tekst presenteerde voorkeursoptie + twee alternatieven als een algemeen werkbaar minimum.

**Review:** daarvoor bestaat geen universele ADR-regel. Het is wel een goede didactische oefenvorm.

**Aangepast:** de module zegt nu expliciet dat **deze oefening** met drie serieuze opties werkt om vergelijken af te dwingen; in de praktijk hangt het aantal reële alternatieven af van de context.

### 2. ADR-structuur

**Oorspronkelijk:** de vijfdelige structuur werd als dé vaste ADR-kern geformuleerd.

**Review:** dit klopt voor de klassieke Nygard-variant, maar er bestaan andere templates.

**Aangepast:** de module noemt expliciet de `klassieke Nygard-variant`. De EAW-oefenkaart voegt `Alternatieven` bewust toe omdat de module juist trade-offs en vergelijking traint.

### 3. Ambigue ADR-check

**Oorspronkelijk:** een check noemde alleen Context, Beslissing en Alternatieven en vroeg welk verplicht onderdeel ontbrak. Daardoor konden ook Status en Titel als ontbrekend worden geïnterpreteerd.

**Aangepast:** Titel, Status, Context, Beslissing en Alternatieven zijn nu expliciet aanwezig; de enige bedoelde ontbrekende kernsectie is Consequenties. Ook assessmentvraag 2 is daarop aangepast.

### 4. Kwaliteitsattributen

**Oorspronkelijk risico:** Beschikbaarheid, Consistentie, Vertrouwelijkheid en Onderhoudbaarheid konden worden gelezen alsof ze samen een officiële ISO/IEC 25010-set vormden.

**Aangepast:** ze worden nu expliciet behandeld als **casusspecifieke besliscriteria**. ISO/IEC 25010:2023 is een bruikbaar referentiemodel bij het selecteren van kwaliteitskenmerken, maar de oefening pretendeert niet het volledige ISO-model te reproduceren.

### 5. Gevoelige gegevens

`medische gegevens` is vervangen door `gevoelige keuringsgegevens`. Daardoor blijft het leerdoel bij architectuurtrade-offs en wordt niet impliciet een medisch/juridisch domein geïntroduceerd dat de module niet behandelt.

### 6. Niet-technisch alternatief

De Berichtenbox/e-mailroute blijft staan. Dit is inhoudelijk nuttig omdat een serieus architectuuralternatief niet per se hetzelfde technische patroon hoeft te hebben als de andere opties; het moet hetzelfde probleem geloofwaardig oplossen.

### 7. ADR achteraf

**Oorspronkelijk:** een achteraf geschreven ADR werd te absoluut als problematisch neergezet.

**Aangepast:** een retrospectieve ADR kan nuttig zijn om historie te reconstrueren, maar legt niet meer de oorspronkelijke afweging op het beslismoment vast. Voor nieuwe beslissingen moeten context, alternatieven en consequenties vóór of tijdens het besluit worden vastgelegd.

### 8. Assessment-eigenaarschap

De eindchecktekst zegt nu expliciet dat vaste beoordelingsregels worden gebruikt en dat de uitslag geen persoonlijke beoordeling van Eva of Alexander is.

## Beoordeling per expertise-perspectief

### Senior Solution Architect — GO

De module traint relevante professionele vaardigheden:
- architectuursignificante keuzes herkennen;
- alternatieven niet reduceren tot technologieproducten;
- kwaliteitscriteria als decision drivers gebruiken;
- winst én verlies expliciteren;
- rationale en consequenties vastleggen;
- eerdere beslissingen navolgbaar vervangen.

### Opleidingskundige — GO

Sterk:
- contrastgevallen;
- transferopdracht;
- expliciete misconceptions;
- verplichte eindcheck;
- targeted remediation.

Aandachtspunt voor latere modules: voorkom dat iedere module hetzelfde patroon van vier intakevragen + vaste drievragencheck mechanisch kopieert; de assessmentvorm moet bij het leerdoel passen.

### Beginnende Solution Architect — GO

Na de learner-experience verbeteringen is de instap voldoende veilig: context vóór vraag 1, onzekerheid mag expliciet worden aangegeven en interne classifierlabels zijn uit de primaire leerervaring gehaald.

## Gate

**Vakinhoudelijke Module 6-review: PASS na verwerking van bovenstaande wijzigingen.**

Deze PASS geldt voor de huidige leerinhoud en betekent niet automatisch dat de volledige 10-module training inhoudelijk is gevalideerd.
