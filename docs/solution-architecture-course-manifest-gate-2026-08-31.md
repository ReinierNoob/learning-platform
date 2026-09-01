# Solution Architecture Course Manifest Gate — 2026-08-31

## Oorspronkelijke einddoelstelling

Solution Architecture – Ontwerppraktijk, Modules 1–10, moet veilig releaseklaar worden als één normale EAW-training via één `course_id`, met de bestaande EAW-auth-, entitlement-, enrollment- en officiële progressarchitectuur. Adaptive learner state blijft aanvullend en introduceert geen tweede completionmodel. Productiepromotie blijft buiten deze gate en is nog `NO-GO`.

## Bijdrage van deze stap

Deze gate bewijst dat de pedagogische runtime in `learning-platform` gecontroleerd kan worden geëxporteerd naar één geversioneerd course-manifest zonder assessmentvragen of answer keys handmatig in EAW te dupliceren. Het manifest is de gecontroleerde releasebrug naar de non-production EAW fixture.

## Solution Architecture Review

### Single source of truth

- Pedagogische SoT: Module 1–10 runtimecontracten in `learning-platform`.
- Database-/progress-SoT blijft in EAW/Supabase.
- Het manifest is een gegenereerd release-artifact, geen tweede handmatig onderhouden contentmodel.

### Verantwoordelijkheden

- `learning-platform`: moduledefinities, adaptive runtime, assessmentinhoud, server-side evaluators en manifestgeneratie.
- EAW: course materialization, entitlement, enrollment en officiële progress/completion.

### Afhankelijkheden en interfaces

- Standalone manifestexport gebruikt dezelfde server-only runtimecontracten als de adaptive HTTP-routes.
- Consumercontract voor quizopties is `2..4` keuzes, sequentieel gelabeld vanaf `A`; meer dan vier blijft verboden omdat de officiële EAW grader antwoordletters `A-D` ondersteunt.
- Iedere module materialiseert één required `content`-item en één required `assessment`-item.

### Data-/releaseflow

`Module runtime SoT -> manifest builder -> hashed CI artifact -> EAW non-production fixture -> EAW official progress writer`

Geen publiek manifestendpoint, adminroute of service-role HTTP-surface toegevoegd.

### Backward compatibility

Geen bestaande runtime-API of clientcontract gewijzigd. Module 6 behoudt zijn bestaande drie-keuze assessmentvragen; de manifestvalidator is aangepast aan het werkelijke consumercontract in plaats van de pedagogiek kunstmatig te wijzigen.

### Deployment en rollback

Wijzigingen zijn beperkt tot de featurebranch. PR #14 blijft draft en ongemerged. Rollback bestaat uit het terugdraaien van de drie gerichte manifest/dependencycommits. Productie is niet gewijzigd.

### Dubbele configuratie / hardcoded versies

Geen tweede content- of answer-key-SoT toegevoegd. `server-only` is expliciet als directe dependency vastgelegd op versie `0.0.1`, omdat standalone Node/tsx de markerpackage daadwerkelijk moet kunnen resolven.

### Race conditions / concurrent writers

Niet van toepassing op manifestgeneratie; de stap voert geen writes naar EAW/Supabase uit.

### Productie-impact

Geen directe productie-impact. Production hard-deny blijft onderdeel van CI en is opnieuw gevalideerd.

## Root causes en remediation

1. **Standalone CLI kon `server-only` niet resolven.**
   - Root cause: expliciete runtime-import zonder directe package dependency in de standalone Node/tsx context.
   - Remediation: `server-only@0.0.1` als directe dependency toegevoegd.

2. **Module 5 manifest-import wees naar legacy helpercode in plaats van het factory runtimecontract.**
   - Root cause: twee Module-5 bestanden met vergelijkbare namen; het manifest importeerde `solution-architecture-module-5-runtime.ts`, terwijl de echte adaptive routes `solution-architecture-module-5-factory-runtime.ts` gebruiken.
   - Remediation: manifest importeert nu hetzelfde factory runtimecontract als de adaptive routes.

3. **Manifest eiste exact vier opties, terwijl Module 6 bewust drie opties gebruikt.**
   - Root cause: een exportinvariant was strenger dan zowel de EAW grader als de generieke `QuizClient`.
   - Remediation: validator volgt nu het consumercontract: minimaal twee, maximaal vier opties; answer index moet binnen het werkelijk aanwezige aantal liggen.

## Technische validatie

Learning Platform CI run `33439037904` / #610 op commit `9c1f453a2add86ea7025e0fbfb575c6fa4c5d50d`:

- dependency install: PASS;
- environment contract: PASS;
- adaptive route convergence: PASS;
- Solution Architecture course manifest export: PASS;
- manifest artifact upload: PASS;
- Next.js build / TypeScript: PASS;
- adaptive HTTP contracts: PASS;
- adaptive production hard-deny: PASS.

Artifact:

- GitHub Actions artifact id: `9775518769`;
- artifact name: `solution-architecture-course-manifest`;
- source commit: `9c1f453a2add86ea7025e0fbfb575c6fa4c5d50d`;
- course slug: `solution-architectuur-ontwerppraktijk`;
- modules: exact `1..10`;
- assessmentvraag-aantallen per module: `6,6,6,5,5,3,6,6,6,13`;
- manifest SHA-256: `sha256:ab0186d5dd65e6598eb9f7ecd728fd9985a1fc0b1048cf46c2df2460b6edf6d3`;
- hash onafhankelijk herberekend: MATCH.

## Retrospective

### Wat was het doel?

De eerste open releasegate sluiten: een reproduceerbaar en valide course-manifest genereren uit de bestaande Module 1–10 runtime-SoT.

### Wat is daadwerkelijk gedaan?

Drie opeenvolgende root causes zijn geïdentificeerd en structureel geremedieerd: dependencycontract, Module-5 runtime-import en een te strakke optiecount-invariant. Daarna is de volledige CI-keten groen gemaakt en het gegenereerde artifact inhoudelijk plus cryptografisch gecontroleerd.

### Is het doel bereikt?

Ja.

### Waar is afgeweken?

De oorspronkelijke aanname “precies vier A-D opties” bleek niet het werkelijke EAW consumercontract te zijn en is gecorrigeerd naar `2..4` opties.

### Onnodige complexiteit geïntroduceerd?

Nee. Er is bewust geen tweede build-time contentmodel of adapterlaag toegevoegd.

### Onderliggende root cause

De manifestketen was nieuw en nog niet eerder volledig standalone uitgevoerd. Daardoor werden verborgen afhankelijkheden en één legacy naamgevingsambiguïteit pas bij de eerste echte export zichtbaar.

### Structurele verbetering

De manifestexport blijft vóór build/HTTP-contracts in CI staan. Daardoor worden dependency-, SoT- en contentcontractfouten voortaan vóór fixture/materialization gedetecteerd.

### Kortste route naar einddoel?

Ja. De volgende architectonisch juiste stap is nu de non-production fixture en write-E2E; niet commerce, delivery of productie.

## Foolproof UX/UI Review

`NO_DIRECT_UI_CHANGE`

- Begrijpelijkheid: geen learner-facing tekst of interactie gewijzigd.
- Terminologie: `content` en `assessment` blijven aansluiten op het EAW progressmodel.
- Foutgevoeligheid: manifestvalidatie voorkomt ongeldige option counts en answer-key indices vóór database-materialization.
- Informatiepresentation: geen UI-impact.
- Toekomstige UI: drie- en vier-keuzevragen blijven correct renderbaar via de bestaande generieke QuizClient.
- Technische complexiteit lekt niet naar learner: nee.

## Architecture Product Review

- **Businessarchitectuur:** één course identity blijft uitgangspunt; commerce/delivery blijven buiten deze gate.
- **Solutionarchitectuur:** één pedagogische runtime-SoT, gegenereerde releasebrug, geen extra HTTP-surface.
- **Informatie/datarelaties:** manifest bevat exact de module/quiz/progress-unit configuratie die later aan één EAW `course_id` wordt gekoppeld.
- **Technische coherentie:** manifest gebruikt dezelfde runtimecontracten als de adaptive routes.
- **Productbruikbaarheid:** geen wijziging aan learner experience; bestaande 3/4-keuzevragen blijven bruikbaar.
- **Herbruikbaarheid:** manifestpatroon is generiek genoeg voor release-tooling zonder module-specifieke kopieën in EAW.
- **Onderhoudbaarheid:** CI maakt runtime/exportdrift direct zichtbaar.
- **Referentiearchitectuurprincipes:** SoT-scheiding, optional sidecars en één officiële progresswriter blijven intact.
- **Afhankelijkheden andere EAW-producten:** fixture/write-E2E in `enterprise-architecture-works` is de eerstvolgende consumer.

### Product-release aandachtspunt buiten deze gate

De repository is publiek en assessment-answer keys bestaan in server-side bronbestanden. `server-only` voorkomt client-bundling, maar maakt broncode in een publieke repository niet vertrouwelijk. Dit is **geen blocker voor de non-production manifest/fixturegate**, maar moet vóór commerciële productierelease expliciet als assessment-integriteits/contentbeschermingsbesluit worden afgehandeld. Deze gate claimt daarom geen geheimhouding van broncode.

## Remediation

Alle bevindingen die deze gate blokkeerden zijn verwerkt in code vóór het gatebesluit. Het publieke-repository/answer-key punt is niet door deze manifestwijziging geïntroduceerd en wordt als afzonderlijke production-release finding geregistreerd.

## Retest

De volledige Learning Platform CI is na de code-remediation opnieuw uitgevoerd en volledig groen op run #610. Na toevoeging van dit gate-document moet de CI nogmaals groen blijven; pas dan is deze documentcommit zelf meegenomen in de definitieve retest.

## Gatebesluit vóór documentcommit-retest

`PENDING FINAL RETEST`

Na een volledig groene CI op de commit die dit document bevat, wordt de manifestgate `GO` en mag de non-production fixture starten.

## Doelcheck na de stap

**Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?**

Ja. Het manifest is de noodzakelijke gecontroleerde releasebrug van de Module 1–10 pedagogische SoT naar één EAW course-id fixture. De volgende stap is uitsluitend de non-production fixture plus adaptive persistence/platformprogress write-E2E.
