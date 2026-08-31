# Productvalidatie Adaptive Solution Architecture Modules 4–6 — 2026-08-31

## Scope

Gezamenlijke validatie van de leerketen:

`Module 4 kwaliteit expliciet maken → Module 5 kwaliteit zichtbaar maken → Module 6 kwaliteit afwegen`

Deze review beoordeelt centrale platformprogress, persona's, responsive gedrag, keyboard/screenreadersemantiek, foolproof completion en resterende live/device gates.

## 1. Centrale EAW-platformprogress — PASS op code/build

Modules 4, 5 en 6 gebruiken hetzelfde fail-closed progresscontract.

Na een geslaagde adaptive eindcheck:
1. session/entitlement/published-modulecontext wordt server-side opnieuw opgehaald;
2. gepubliceerde vraagtekst wordt exact vergeleken;
3. optievolgorde wordt exact vergeleken;
4. centrale `system_instruction` answer key wordt gecontroleerd;
5. bij iedere afwijking vinden geen progresswrites plaats;
6. verplichte contentitems worden via bestaande `recordProgress(...)` voltooid;
7. de centrale assessment wordt via dezelfde platformfunctie beoordeeld;
8. alleen score 100 geldt als succesvolle synchronisatie;
9. het centrale `completion_percentage` wordt opnieuw gelezen.

Geen tweede adaptive completion-teller is geïntroduceerd.

### OPEN — data-E2E

De definitieve Solution Architecture course/module-config bestaat nog niet in een veilige branch-only testfixture. Daarom is de echte write-E2E voor Modules 4 en 5 nog niet uitgevoerd. Productie-Supabase wordt hiervoor niet gebruikt.

## 2. Persona walkthrough — PASS op ontwerp/codeniveau

### Beginner
- casus vóór diagnose;
- expliciet `Ik weet dit nog niet`;
- route A bouwt kernbegrippen volledig op;
- Module 4 gebruikt ISO/IEC 25010 als begrippenkaart;
- Module 5 doseert detail per stakeholder;
- Module 6 maakt winst én verlies zichtbaar.

### Basisgebruiker
- route B verkort bekende uitleg;
- toepassing blijft behouden;
- volledige uitleg blijft beschikbaar;
- assessment blijft verplicht.

### Ervaren cursist met fout denkpatroon
- route C repareert alleen geobserveerde misconcepties;
- één misconception-id staat voor één observeerbaar denkpatroon;
- learner override blijft mogelijk;
- formele mastery blijft onafhankelijk van Eva/Alexander als persona.

## 3. Cross-module continuïteit — PASS

- Module 4 → 5: kwaliteitslens wordt per stakeholder gebruikt zonder ISO opnieuw te doceren.
- Module 5 → 6: stakeholdergerichte beelden voeden de ontwerpafweging.
- ISO/IEC 25010:2023 is de Module 4-referentie.
- ArchiMate 4 is de Module 5-referentie.
- Module 6 positioneert beschikbaarheid, vertrouwelijkheid en onderhoudbaarheid correct en markeert consistentie als aanvullend casuscriterium.

## 4. Responsive/mobile — PASS op codeniveau, live device OPEN

Tijdens deze review gevonden en hersteld:
- Module 4 gebruikte alleen `.mobileCards`; kwaliteitsvisuals waren daardoor op desktop verborgen;
- `.alwaysCards` toont Module 4 nu op desktop én mobiel;
- mobiel wordt één kolom;
- touch targets blijven minimaal 40–44 px;
- Module 5 behoudt desktopdiagram + taakgerichte mobiele cards.

Fysieke iPhone/touch-validatie blijft een aparte releasecheck.

## 5. Keyboard/screenreader — dynamische focus code PASS, fysieke screenreader OPEN

Positief:
- native buttons, links, radio inputs en textareas;
- fieldset/legend bij keuzevragen;
- `aria-pressed` bij stakeholdertabs;
- `role=status` voor feedback;
- `role=alert` voor fouten;
- geen pointer-only primaire interacties;
- na diagnostische stapwissels, routewissels, lesson navigation en remediation wordt de nieuwe context programmatisch focusbaar gemaakt en gefocust.

Normbasis:
- WCAG 2.2 SC 2.4.3 — betekenisvolle focusvolgorde;
- WCAG 2.2 SC 4.1.3 — programmatisch herkenbare statusmeldingen.

OPEN:
- echte VoiceOver/NVDA of equivalente screenreader-run.

## 6. Foolproof completion — PASS op code/build

De backend onderscheidt `synced`, `not_configured`, `contract_mismatch` en `failed`.

De generieke UI maakt nu eveneens onderscheid:
- inhoudelijk geslaagd + `synced` → normale moduleafronding;
- inhoudelijk geslaagd + geen succesvolle hostsync → expliciet `Eindcheck gehaald — voortgang nog niet bijgewerkt`;
- retry van de voortgangssync is mogelijk;
- terugkeer zonder sync blijft mogelijk, maar wordt expliciet zo benoemd;
- learner mastery wordt niet teruggedraaid door een technische hostsyncfout.

Daarmee maskeert een groene mastery-status geen mislukte officiële EAW-progressregistratie meer.

## 7. Buildbewijs — PASS

Finale Vercel-build na de P1-fixes:
- Next.js compile PASS;
- TypeScript PASS;
- 15 adaptive API-endpoints aanwezig;
- 3 QA-harnesses aanwezig;
- Module 4 desktop/mobile visuals PASS;
- generic platformprogress voor Modules 4/5/6 compileert;
- dynamic focus + completion sync UX compileert;
- productie blijft hard-disabled.

## Gate-status

### PASS
- 4→5→6 learning spine;
- config-driven multi-module runtime;
- centrale progresscode voor 4/5/6;
- fail-closed question/options/answer-key contract;
- Module 4 desktopvisuals;
- persona walkthrough op ontwerp/codeniveau;
- responsive/keyboard/semantic static review;
- dynamic focus/orientation code;
- foolproof completion-status UX.

### OPEN
1. branch-only Supabase persistence/progress E2E voor Modules 4 en 5;
2. fysieke desktop/mobile/touch review;
3. VoiceOver/NVDA of equivalente screenreader-run;
4. finale Solution Architecture course-config;
5. production releasebesluit.

**Productie: NO-GO.**
