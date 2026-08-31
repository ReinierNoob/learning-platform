# Retrospective — Adaptive Solution Architecture Modules 1–3

Datum: 2026-08-31

## Wat was het doel?

Modules 1–3 realiseren als gecontroleerde uitbreiding van het bestaande adaptive patroon, zonder een tweede runtime-, progress- of persistencearchitectuur te introduceren, en het blok pas afsluiten na volledige EAW-gate.

## Wat heb ik daadwerkelijk gedaan?

- canonieke leerlijn uit Dropbox als bron gebruikt;
- adaptiviteitsniveau per module bepaald;
- drie client-safe moduledefinitions gebouwd;
- drie server-only evaluators gebouwd;
- vijftien API-routes toegevoegd;
- drie learner experiences en drie QA-harnesses toegevoegd;
- Modules 1–3 geïntegreerd in de normale `/leren`-route;
- previewflags toegevoegd;
- centrale hostprogress en module-scoped state restore hergebruikt;
- inhoudelijke, UX- en architectuurbevindingen geremedieerd;
- volledige build opnieuw uitgevoerd;
- Architecture/Product Gate vastgelegd.

## Heb ik het doel bereikt?

Ja, voor controlled featurebranch-rollout.

Niet voor productie: fysieke device/screenreader-validatie en definitieve data-E2E blijven open releasegates.

## Waar ben ik afgeweken?

1. Ik stopte tussentijds met een statusrapport terwijl de resterende gate technisch nog uitvoerbaar was. Dat was in strijd met de EAW-hoofdregel.
2. In Module 1 breidde ik een bronlabel onnodig uit van `Business-architect` naar `Business-architect / businessverantwoordelijke`.
3. In Module 3 was een bedoelde misconception aanvankelijk niet werkelijk observeerbaar.
4. De generieke focusfix richtte zich eerst op de moduletitel in plaats van de actieve leerstap.

## Welke onnodige complexiteit heb ik geïntroduceerd?

De grootste resterende complexiteit is de hoeveelheid repetitieve Next.js endpoint-boilerplate: vijf routebestanden per module. Dit is nog functioneel coherent, maar schaalt lineair mee met het aantal modules.

De adaptive pedagogiek zelf is bewust niet overal even zwaar gemaakt; daarmee is onnodige adaptieve complexiteit in Module 1 juist voorkomen.

## Welke root cause ligt onder de gevonden problemen?

### Statusstop
Root cause: statusrapportage werd onterecht behandeld als een veilige afsluiting terwijl de Definition of Done nog niet compleet was.

### Bronlabeldrift
Root cause: nuttige praktijknuance werd toegevoegd in een brongebonden assessment in plaats van alleen in uitleg/context.

### Niet-observeerbare misconception
Root cause: misconceptionlijst en diagnostic items waren niet automatisch als één contract gereviewd.

### Focus op moduletitel
Root cause: focusmanagement werd generiek geïmplementeerd zonder onderscheid tussen modulecontext en actieve-stepcontext.

### Deterministische rubric lockout
Root cause: serverrubrics zijn bewust eenvoudig/deterministisch, maar de UX had geen escape hatch voor false negatives.

## Wat moet structureel worden verbeterd?

1. Een gate mag nooit eindigen op `status` als remediation/retest nog uitvoerbaar is.
2. Brongebonden assessmenttekst krijgt strengere source-fidelity review dan uitlegtekst.
3. Iedere misconception moet gekoppeld zijn aan minimaal één observeerbaar diagnostic- of tutor-signaal.
4. Dynamic focus moet altijd naar de nieuw actieve taak/stap gaan, niet naar herhaalde context.
5. Deterministische observaties mogen navigation niet onbeperkt blokkeren; mastery blijft bij de eindcheck.
6. Voor verdere modulegroei endpoint-boilerplate opnieuw beoordelen op shared server handlers.

## Welke pipeline-/skillverbetering voorkomt herhaling?

Toevoegen aan de Adaptive Learning Pipeline:
- `no-status-as-done` gate;
- source-fidelity rule voor assessment versus explanatory copy;
- misconception-observability matrix;
- active-task focus rule;
- deterministic-rubric anti-lockout rule;
- server-route duplication threshold review.

## Foolproof UX/UI Review

Directe UI-wijziging: ja.

Begrijpelijkheid:
- routebenamingen zijn learner-facing;
- Module 1–3 volgen één logisch verhaal;
- businessarchitectuurgrens in Module 2 is expliciet.

Terminologie:
- brongebonden assessment gebruikt `Business-architect` zoals de canonieke leerlijn;
- solutionmandaat wordt niet gelijkgesteld aan businessmandaat.

Foutgevoeligheid:
- `Ik weet dit nog niet` blijft beschikbaar;
- twee foutief geïnterpreteerde vrije antwoorden kunnen de cursist niet meer permanent blokkeren;
- officiële progresssync en mastery blijven visueel gescheiden.

Informatiepresentation:
- visuals ondersteunen de denkstap;
- mobile layout valt naar één kolom;
- actieve-step focus ondersteunt keyboard/screenreaderoriëntatie.

Impact op toekomstige UI:
- generic runtimefix geldt direct voor Modules 1–6 en toekomstige modules.

Risico dat technische complexiteit naar de gebruiker lekt:
- laag; interne reason codes, classifierdetails en persistence blijven verborgen.

## Architecture Product Review

Businessarchitectuur: PASS.

Solutionarchitectuur: PASS.

Informatie/datarelaties: PASS.

Technische coherentie: PASS met warning voor endpoint-boilerplate.

Productbruikbaarheid: PASS.

Herbruikbaarheid: PASS.

Onderhoudbaarheid: PASS met accepted warning.

Referentiearchitectuurprincipes: PASS.

Afhankelijkheden met andere EAW-producten: geen nieuwe dependency in deze stap.

## Ben ik nog op de kortste route naar het einddoel?

Ja. Modules 1–6 draaien nu op hetzelfde adaptive productpatroon. De volgende ontwikkeling hoeft geen nieuwe fundamentele runtimearchitectuur te introduceren.

## Gate

Controlled rollout: **GO WITH ACCEPTED NON-BLOCKING WARNINGS**.

Productie: **NO-GO**.
