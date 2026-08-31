# Productvalidatie Adaptive Solution Architecture Modules 4–6 — 2026-08-31

## Scope

Gezamenlijke validatie van de leerketen:

`Module 4 kwaliteit expliciet maken → Module 5 kwaliteit zichtbaar maken → Module 6 kwaliteit afwegen`

Deze review beoordeelt:
- centrale platformprogress;
- beginner/basis/ervaren persona;
- mobile/responsive informatievolgorde;
- keyboard- en screenreadersemantiek op codeniveau;
- foolproof gedrag;
- resterende live/device gates.

## 1. Centrale EAW-platformprogress

### PASS — code/build

Modules 4 en 5 gebruiken nu hetzelfde fail-closed progresscontract als Module 6.

Na een geslaagde adaptive eindcheck:
1. session/entitlement/published-modulecontext wordt server-side opnieuw opgehaald;
2. gepubliceerde vraagtekst wordt vergeleken met de adaptive assessment;
3. optievolgorde wordt exact vergeleken;
4. centrale `system_instruction` answer key wordt gecontroleerd;
5. bij iedere afwijking vinden geen progresswrites plaats;
6. verplichte contentitems worden via bestaande `recordProgress(...)` voltooid;
7. de centrale assessment wordt via dezelfde platformfunctie beoordeeld;
8. alleen score 100 geldt als succesvolle synchronisatie;
9. daarna wordt het centrale `completion_percentage` opnieuw gelezen.

Geen tweede adaptive completion-teller is geïntroduceerd.

### OPEN — data-E2E

De definitieve Solution Architecture course/module-config bestaat nog niet in een veilige branch-only testfixture. Daarom is de echte write-E2E voor Modules 4 en 5 nog niet uitgevoerd.

Geen productie-Supabase mutatie gebruiken voor deze test.

## 2. Persona walkthrough

### Beginner — PASS op ontwerp/codeniveau

- casus wordt vóór diagnose uitgelegd;
- `Ik weet dit nog niet` is expliciet beschikbaar;
- route A bouwt kernbegrippen volledig op;
- Module 4 gebruikt ISO/IEC 25010 als begrippenkaart, niet als memoriseerlijst;
- Module 5 doseert detail per stakeholder;
- Module 6 laat winst én verlies in ontwerpkeuzes zien.

### Basisgebruiker — PASS op ontwerp/codeniveau

- route B verkort bekende uitleg;
- tussentijdse toepassing blijft behouden;
- volledige uitleg blijft vrijwillig toegankelijk;
- assessment blijft verplicht.

### Ervaren cursist met fout denkpatroon — PASS op ontwerp/codeniveau

- route C repareert alleen geobserveerde misconcepties;
- misconception-id staat voor één observeerbaar denkpatroon;
- learner override blijft mogelijk;
- formele mastery blijft onafhankelijk van Eva/Alexander als persona.

## 3. Cross-module continuïteit — PASS

### Module 4 → 5

Module 5 gebruikt de kwaliteitslens uit Module 4 per stakeholder, maar doceert ISO niet opnieuw.

### Module 5 → 6

Module 6 bouwt voort op stakeholdergerichte beelden en gebruikt kwaliteit als besliscriterium bij alternatieven en ADR's.

### Begripsconsistentie

- ISO/IEC 25010:2023 is de Module 4-referentie;
- ArchiMate 4 is de Module 5-referentie;
- Module 6 presenteert beschikbaarheid, vertrouwelijkheid en onderhoudbaarheid correct in relatie tot ISO en markeert consistentie als aanvullend casuscriterium.

## 4. Responsive/mobile — PASS op codeniveau, live device OPEN

Gevonden en hersteld tijdens deze review:
- Module 4 gebruikte alleen `.mobileCards`; daardoor waren zijn kwaliteitsvisuals op desktop verborgen;
- nieuwe `.alwaysCards`-layout toont Module 4-cards op desktop én mobiel;
- op mobiel wordt deze layout één kolom;
- touch targets blijven minimaal 40–44 px;
- Module 5 behoudt desktopdiagram + taakgerichte mobiele cards.

Fysieke iPhone/touch-validatie blijft een aparte releasecheck.

## 5. Keyboard/screenreader — statische basis PASS, dynamische focus OPEN

Positief:
- native buttons, links, radio inputs en textareas;
- fieldset/legend bij keuzevragen;
- `aria-pressed` bij stakeholdertabs;
- `role=status` voor feedback;
- `role=alert` voor fouten;
- geen pointer-only primaire interacties gevonden.

OPEN:
- na `Volgende`, routekeuze of remediation wordt focus niet expliciet naar de nieuwe stap/heading verplaatst;
- een echte VoiceOver/NVDA-run is nog niet uitgevoerd.

Normbasis voor de releasecheck:
- WCAG 2.2 SC 2.4.3: focusvolgorde moet betekenis en bedienbaarheid behouden;
- WCAG 2.2 SC 4.1.3: statusmeldingen moeten programmatisch herkenbaar zijn zonder dat focus per se wordt verplaatst.

## 6. Foolproof completion — P1 OPEN

De backend onderscheidt `synced`, `not_configured`, `contract_mismatch` en `failed`.

De huidige generieke UI toont na een inhoudelijk geslaagde eindcheck nog steeds dezelfde succesboodschap, ook wanneer centrale platformprogress niet is gesynchroniseerd.

Voor productie vereist:
- bij `platformProgress.status === synced`: normale afronding;
- bij een andere status in `/leren`: expliciet melden dat de leerdoelen zijn gehaald maar voortgang nog niet is bijgewerkt;
- retry mogelijk maken of terugkeer met duidelijke status aanbieden.

## 7. Buildbewijs

PASS:
- generic progresscontract compileert;
- Module 4 progressintegratie READY;
- Module 5 progressintegratie READY;
- Module 4 desktop/mobile visual fix READY;
- Modules 4, 5 en 6 blijven samen compileren;
- productie blijft hard-disabled.

## Gate-status

### PASS
- 4→5→6 learning spine;
- config-driven multi-module runtime;
- centrale progresscode voor 4/5/6;
- fail-closed question/options/answer-key contract;
- Module 4 desktopvisuals;
- persona walkthrough op ontwerp/codeniveau;
- responsive/keyboard/semantic static review.

### OPEN
1. branch-only Supabase persistence/progress E2E voor Modules 4 en 5;
2. completion-status UX bij mislukte progresssync;
3. dynamische focus/orientatie na stapwissel;
4. fysieke desktop/mobile/touch review;
5. VoiceOver/NVDA of equivalente screenreader-run;
6. finale Solution Architecture course-config;
7. production releasebesluit.

**Productie: NO-GO.**
