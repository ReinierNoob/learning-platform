# Retrospective — Adaptive Modules 4–6 productvalidatie — 2026-08-31

## Wat ging goed

1. Centrale progresslogica bleek generiek genoeg om Modules 4, 5 en 6 via hetzelfde hostcontract te laten lopen.
2. De fail-closed contractcheck voorkomt dat adaptive content en gepubliceerde quizconfig ongemerkt uit elkaar groeien.
3. De persona-review op de volledige 4→5→6-keten leverde andere bevindingen op dan losse modulereviews.
4. Responsive review op daadwerkelijke CSS-classes vond een concrete desktopregressie die een gewone inhoudsreview niet had gezien.
5. Productiestatus bleef expliciet NO-GO; ontbrekende live/device evidence werd niet als PASS gerapporteerd.
6. De twee gevonden P1's — dynamische focus en mastery-versus-hostcompletion — konden in de generieke engine worden opgelost in plaats van per module.

## Wat ging minder goed

1. `.mobileCards` werd semantisch gebruikt alsof het een generieke cardlayout was, terwijl de CSS hem bewust op desktop verbergt. Naamgeving stuurde daarmee naar verkeerd gebruik.
2. De generieke completion-UI behandelde inhoudelijke mastery aanvankelijk alsof dat automatisch officiële platformcompletion betekende.
3. Dynamische SPA-orientatie/focus was aanvankelijk geen first-class acceptance criterion in de runtime.
4. Progress-E2E is te laat afhankelijk geworden van de definitieve course/module-config. Het configuratiecontract moet eerder als testfixture beschikbaar zijn.

## Nieuwe pipeline-regels

### Regel 1 — mastery en host completion blijven zichtbaar gescheiden

Backend én UI onderscheiden:
- inhoudelijk geslaagd;
- hostprogress gesynchroniseerd;
- hostprogress niet geconfigureerd/mismatch/mislukt.

Een groene mastery-status mag een mislukte hostsync niet maskeren.

### Regel 2 — responsive utility-namen beschrijven intentie

Gebruik niet een viewportnaam (`mobileCards`) voor content die in meerdere viewports relevant is.

Voorkeur:
- `mobileOnlyCards` voor echt mobile-only;
- `responsiveCards`/`alwaysCards` voor multi-viewport inhoud.

### Regel 3 — dynamic-focus gate na iedere stateful stepflow

Bij React/SPA-stapwissels expliciet beoordelen:
- waar blijft keyboardfocus?
- wordt de nieuwe stap programmatisch herkenbaar?
- blijft de leesvolgorde logisch?
- is feedback een statusbericht of vraagt het focus?

### Regel 4 — course-config fixture vóór platformprogress E2E

Voor elke adaptive module moet vóór live E2E een branch-only fixture bestaan met:
- gepubliceerde module;
- exact quizcontract;
- centrale answer key;
- required content/assessment items;
- entitlement + enrollment.

### Regel 5 — cross-module review na iedere cluster van aangrenzende modules

Niet alleen module per module reviewen. Minimaal toetsen:
- begripsherhaling;
- verkeerde terminologieverschuiving;
- handoff tussen leerdoelen;
- casecontinuïteit;
- oplopend cognitief niveau.

## Afgeronde acties uit deze retrospective

1. completion-status UX generiek verbeterd — PASS;
2. focus/orientatie bij step transitions toegevoegd — PASS;
3. Module 4 responsive desktop/mobile cards hersteld — PASS;
4. Modules 4 en 5 aangesloten op generiek centraal progresscontract — PASS.

## Nog open

1. branch-only course-config fixture voor Modules 4–6;
2. persistence/platformprogress write-E2E met die fixture;
3. fysieke desktop/mobile/touch review;
4. VoiceOver/NVDA of equivalente screenreader-run;
5. media pas na live UX GO;
6. productiereleasebesluit.
