# Solution Architecture Wave 1 presenter-video gate — 2026-09-01

## Oorspronkelijke einddoelstelling
`Solution Architecture – Ontwerppraktijk` moet als complete EAW-training met Modules 1–10 naar productie, inclusief consistente Eva/Alexander-presentatie, didactische visualisaties, captions/transcripts, secure media, bestaande auth/entitlement/enrollment/progress, adaptive state als sidecar, accessibility en gecontroleerde productiepromotie.

## Doelcheck vóór de stap
Wave 1 moest voor Modules 1, 4, 6 en 10 acht referentieclips realiseren en aantonen dat de gekozen presenterarchitectuur technisch werkt vóór opschaling naar de overige modules.

## Solution Architecture Review
- De Video Agent-route bleek voor deze bestaande private photo avatars een onnodige digital-twin prerequisite te introduceren.
- De ondersteunde HeyGen v3 `create_video_from_avatar` route accepteert bestaande private photo-avatar looks rechtstreeks.
- Dit past beter bij de doelarchitectuur: presenterclips zijn single-scene media; de didactische visualisaties blijven afzonderlijke semantische React-UI.
- Geen nieuwe avatar-identity of digital-twin-laag toegevoegd.
- Eén canonical Eva group/voice en één canonical Alexander group/voice blijven de identity-SoT.
- Presenter media wordt in een aparte assetregistry vastgelegd; signed HeyGen delivery-URL’s worden niet als permanente identifiers opgeslagen.
- Productiedeployment is fail-closed gemaakt op volledige presenter asset readiness.

## Uitvoering
Acht presenterclips zijn via de v3 avatar-route geproduceerd:

- Module 1 — Eva intro / Alexander explainer;
- Module 4 — Eva intro / Alexander explainer;
- Module 6 — Eva intro / Alexander explainer;
- Module 10 — Eva intro / Alexander explainer.

Technische resultaten:

- 8/8 `completed`;
- 8/8 positieve duur;
- 8/8 afzonderlijk SRT-subtitleartifact gegenereerd;
- 0 render failures;
- vaste 16:9 / 1080p presenterconfiguratie;
- vaste persona/voice-combinaties.

Duren:
- M1 Eva 26.592s; Alexander 29.52s;
- M4 Eva 25.128s; Alexander 29.088s;
- M6 Eva 21.048s; Alexander 31.368s;
- M10 Eva 29.712s; Alexander 36.6247s.

## Release asset registry
Toegevoegd: `content/solution-architecture-presenter-assets-v1.json`.

De registry bewaart stabiele provider-video-identifiers en reviewstatus, niet de tijdelijke signed delivery-URL’s.

Huidige reviewstatus van Wave 1:
- renderStatus: completed;
- subtitleArtifact: generated;
- captionReview: pending;
- transcriptReview: script_basis_ready;
- physicalPlaybackReview: pending.

## Pipeline-remediation
Toegevoegd: `scripts/verify-solution-architecture-presenter-assets.mjs`.

CI `wave1` vereist:
- exact 8 assets;
- completed render;
- geldige provider video-id;
- positieve duur;
- subtitleartifact gegenereerd;
- geen failure.

Production deploy vereist daarnaast via `release`:
- exact 20 presenter assets;
- captionReview=ready;
- transcriptReview=ready;
- physicalPlaybackReview=ready.

De production workflow is expliciet uitgebreid met:
`node scripts/verify-solution-architecture-presenter-assets.mjs release`.

Daarmee kan een merge naar `main` de training niet deployen zolang mediareview of resterende modules incompleet zijn.

## Technische validatie
Definitieve commit: `30fd12fe35f36c61dc7d8395cfaa8c161795bb06`.

Learning platform CI #639 / run `33466010270`: **PASS**.

Geslaagd:
- dependency install;
- environment contract;
- adaptive route convergence;
- canonical manifest export;
- Learning Experience Design contract;
- Visual Experience contract;
- canonical avatar identity contract;
- Wave 1 presenter media contract;
- Next.js build;
- adaptive HTTP contracts;
- production hard-deny.

## Open blocking finding
De huidige uitvoeromgeving kan de gegenereerde HeyGen mediabytes niet openen voor frame-/playbackinspectie en kan de SRT-inhoud niet uitlezen. De HeyGen connector levert wel een speler, status, duur en subtitleartifact, maar geen inspecteerbare lokale mediabytes voor deze agent-runtime.

Daarom zijn de volgende claims **niet** gedaan:
- correcte framing/pose gedurende de hele clip;
- visuele avatarconsistentie per frame;
- lipsynckwaliteit;
- hoorbare uitspraak/intonatie van alle architectuurtermen;
- inhoudelijke juistheid van de gegenereerde SRT tegen het bronscript.

Dit is een acceptatieblocker voor opschaling naar Wave 2, omdat een defect presenter-template anders over 12 extra clips wordt vermenigvuldigd.

## Retrospective
**Wat was het doel?** Acht representatieve presenterclips realiseren en valideren vóór opschaling.  
**Wat is gedaan?** Ondersteunde photo-avatarroute vastgesteld, 8 clips geproduceerd, assetregistry en executable media-contract toegevoegd, production deploy fail-closed gemaakt.  
**Doel bereikt?** Technisch wel; visuele/audio-acceptatie nog niet aantoonbaar.  
**Waar afgeweken?** De eerste route via Video Agent bleek architectonisch onjuist voor bestaande photo avatars en eiste een digital twin. De route is vervangen door de ondersteunde v3 avatar-renderroute.  
**Onnodige complexiteit voorkomen?** Ja: geen nieuwe digital twins, geen duplicaatidentities en geen hardcoded signed media-URL’s.  
**Root cause?** Video Agent werd aanvankelijk behandeld als enige presenterroute terwijl de v3 avatar-route beter aansluit op de bestaande EAW-assets.  
**Structurele verbetering?** Presenter transport en asset lifecycle zijn nu expliciet gescheiden van persona identity en van semantische visuals.  
**Pipelineverbetering?** Wave1 media contract + full release media gate in production deploy.  
**Kortste route naar einddoel?** Ja, maar opschaling stopt terecht bij ontbrekende playback/captionacceptatie.

## Foolproof UX/UI Review
`NO_DIRECT_UI_CHANGE`

De video’s zijn nog niet in de learner UI geïntegreerd. Toch gelden de volgende productbevindingen:
- dezelfde Eva/Alexander identity en voice over alle Wave 1 modules;
- korte clips van circa 21–37 seconden beperken cognitieve belasting;
- captions zijn gegenereerd als sidecar en blijven release-verplicht;
- essentiële kennis blijft ook tekstueel beschikbaar in de learner en is niet uitsluitend video-afhankelijk;
- fysieke playbackreview blijft noodzakelijk vóór integratie/opschaling om framing, uitspraak en lipsync te beoordelen.

## Architecture Product Review
- **Business:** twee consistente presenters ondersteunen herkenbaarheid zonder video tot hoofdcontent te maken.
- **Solution:** photo-avatar presenterroute is los van React-visuals en van progress/persistence.
- **Data/informatie:** assetregistry bevat stabiele IDs/status; geen tijdelijke URLs als SoT.
- **Techniek:** één supported v3 renderpad, geen duplicate digital-twin lifecycle.
- **Productbruikbaarheid:** clipduur past bij interventie/explainerfunctie; daadwerkelijke playbackkwaliteit nog te accepteren.
- **Herbruikbaarheid:** dezelfde presenterarchitectuur kan voor Modules 2/3/5/7/8/9 worden opgeschaald nadat Wave 1 visueel is goedgekeurd.
- **Onderhoudbaarheid:** CI en production deploy bewaken completeness.
- **Referentieprincipes:** single source of truth, fail closed, minimal dependencies en accessibility by design zijn behouden.

## Remediation
Verwerkt:
1. Video Agent-route vervangen door supported v3 avatar-route;
2. presenter assetregistry toegevoegd;
3. aparte media-validator toegevoegd;
4. foutieve CI-binding naar experience-validator gecorrigeerd;
5. production deployment fail-closed gemaakt op full presenter release readiness.

De ontbrekende fysieke playback-/captionreview kan binnen deze runtime niet technisch worden geremedieerd omdat de connector geen inspecteerbare mediabytes/SRT-content exposeert.

## Retest
CI #639 volledig groen na alle remediation.

## Gatebesluit
`NO-GO`

Reden: de technische presenterproductie is groen, maar Wave 1 is nog niet visueel/audio/caption-geaccepteerd. Volgens de afgesproken pipeline mag Wave 2 daarom nog niet starten.

## Doelcheck na de stap
**Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?** Ja. De presenterproductie is technisch bewezen en productiedeployment is beschermd. De kortste vervolgrichting is één fysieke playback/captionreview van de acht Wave 1 clips in een omgeving die de media daadwerkelijk kan afspelen/inspecteren; pas na `GO` mag Wave 2 worden geproduceerd.