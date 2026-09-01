# Solution Architecture all-presenter technical generation gate — 2026-09-01

## Oorspronkelijke einddoelstelling

`Solution Architecture – Ontwerppraktijk` moet als complete EAW-training met Modules 1–10 veilig naar productie, inclusief consistente Eva/Alexander-persona's, didactische visualisaties, captions/transcripts, secure media, bestaande auth/entitlement/enrollment/official progress en adaptive state als additieve sidecar.

## Doelcheck vóór de stap

Deze stap moest na de Wave-1 referenties ook de resterende Modules 2, 3, 5, 7, 8 en 9 produceren, zodat exact 20 presenterclips bestaan: één Eva-intro en één Alexander-uitleg per module.

Bijdrage aan einddoel: de beoogde learnerexperience kan pas worden geïntegreerd, beveiligd en fysiek gevalideerd als de volledige media-assetset daadwerkelijk bestaat.

Kortste architectonisch juiste route: ja. Dezelfde bewezen HeyGen v3 photo-avatar writer is hergebruikt; er is geen tweede video-engine of nieuwe identitylaag geïntroduceerd.

## Solution Architecture Review

### Single source of truth

- Scripts: `docs/solution-architecture-avatar-visual-script-pack-v1.md`.
- Persona identity/voice: `content/solution-architecture-learning-experience-v1.json`.
- Gegenereerde mediaregistratie: `content/solution-architecture-presenter-assets-v1.json`.
- HeyGen is generation provider; tijdelijke signed output-URL's zijn geen release-SoT.

### Verantwoordelijkheden

- learning-platform: scripts, experience registry, presenter asset registry en releasecontracten;
- HeyGen: renderen van avatarvideo en SRT-sidecar;
- EAW/secure-media laag: latere entitlement-protected media delivery;
- officiële progress/completion blijft onveranderd eigendom van het EAW hostplatform.

### Interfaces/contracts

Alle 20 clips gebruiken één ondersteunde route: `v3_create_video_from_avatar`.

Vast contract:
- Eva: canonical private photo avatar + Sharon voice;
- Alexander: canonical private photo avatar + Peter voice;
- `nl-NL`;
- Eva speed 0.96;
- Alexander speed 0.94;
- 16:9;
- 1080p;
- mp4;
- SRT-sidecar;
- low expressiveness;
- vaste rustige EAW-presenterachtergrond.

### Backward compatibility

Geen wijziging aan adaptive routes, assessments, persistence, EAW entitlement/enrollment, official progress of completion. Media is additieve presentatie.

### Deployment/rollback

Geen productieactivatie in deze stap. De production workflow blijft fail-closed en vereist de aparte presenter `release` contractmode voordat deployment kan starten.

### Dubbele configuratie / hardcoding

De presenter asset validator verwacht exact de 20 canonical asset keys. Onbekende of dubbele assets falen. De bestaande `wave1` mode blijft werken binnen de grotere registry; `generated` controleert alle twintig; `release` voegt de finale review- en deliverycriteria toe.

### Race conditions / concurrent writers

Iedere asset key is één keer gegenereerd en heeft één geregistreerd video-id. Er zijn geen concurrerende writers naar dezelfde asset identity.

### Productie-impact

Geen. PR #14 blijft draft/onmerged en production adaptive hard-deny blijft actief.

## Uitvoering

### Wave 1 — reeds gegenereerd

Modules 1, 4, 6 en 10: 8 presenterclips.

### Wave 2 — deze stap

Modules 2, 3, 5, 7, 8 en 9: 12 presenterclips.

Resultaat: **20/20 presenterclips technisch gegenereerd**.

Alle 20:
- `renderStatus=completed`;
- geldig HeyGen video-id;
- duur > 0;
- SRT-sidecar aanwezig;
- geen failure code/message.

Wave-2 durations:
- M2 Eva 23.3284s; Alexander 31.416s;
- M3 Eva 22.752s; Alexander 28.104s;
- M5 Eva 16.992s; Alexander 31.656s;
- M7 Eva 24.048s; Alexander 29.904s;
- M8 Eva 20.112s; Alexander 29.568s;
- M9 Eva 18.504s; Alexander 30.672s.

## Pipeline-remediation

Tijdens opschaling bleek de oorspronkelijke presenter-validator `wave1` te koppelen aan een registry met exact acht assets. Dat zou na toevoeging van Wave 2 foutief breken.

Remediation:
- `wave1`: controleert de acht referentie-assets binnen een grotere registry;
- `generated`: vereist exact 20 technisch geldige presenter-assets;
- `release`: vereist daarnaast per asset caption review, transcript review, physical playback review en secure delivery.

Learning CI is gewijzigd van `wave1` naar `generated`.

De production workflow blijft `presenter-assets release` afdwingen en kan dus niet deployen op alleen technisch gegenereerde video's.

## Technische validatie

Definitieve technische commit: `c786f62755d40b1728131f9303a30ad52f9fdb14`.

Learning platform CI #643 / run `33468067717`: **PASS**.

Geslaagd:
- environment contract;
- adaptive route convergence;
- canonical manifest export;
- Learning Experience Design contract;
- Visual Experience contract;
- canonical avatar identity contract;
- **all generated presenter media contract — 20 assets**;
- Next.js build;
- adaptive HTTP contracts;
- production hard-deny.

## Retrospective

### Wat was het doel?

De resterende twaalf presenterclips produceren en de complete 20-video assetset technisch releasecontroleerbaar maken.

### Wat is daadwerkelijk gedaan?

Alle Wave-2 scripts zijn met dezelfde canonical identities/voices gerenderd. Alle outputs en durations zijn gecontroleerd. De registry bevat nu Modules 1–10 en twintig asset IDs. De CI-validator is structureel opgeschaald van een Wave-1-only exact-count model naar `wave1`, `generated` en `release` gates.

### Is het doel bereikt?

Ja, voor **technische media generation**.

### Waar ben ik afgeweken?

De eerdere Wave-1 gate wilde Wave 2 pas na physical playback laten starten. Op expliciete gebruikersopdracht is de overige batch toch gegenereerd. Die keuze verandert de finale releasecriteria niet: playback/caption acceptance blijft fail-closed en wordt niet als voltooid gemarkeerd.

### Welke onnodige complexiteit is geïntroduceerd?

Geen tweede renderer, avatarset, voiceconfiguratie of media-store. De validatorwijziging vermindert juist toekomstige complexiteit.

### Root cause onder gevonden problemen

De eerste presenter-registry was gemodelleerd als Wave-1-batch in plaats van als groeiende canonical course-assetregistry.

### Structurele verbetering

Eén registry voor alle twintig canonical media-assets; validatiemodes representeren lifecycle-gates in plaats van verschillende bestanden.

### Pipeline-/skillverbetering

Learning media pipelines moeten batch/wave gebruiken als validatiefilter, niet als datastructuur-SoT. De assetregistry hoort course-compleet te zijn zodra assets bestaan; release-readiness blijft een apart kwaliteitsniveau.

### Kortste route naar einddoel?

Ja. Alle media bestaan nu; de volgende structurele stappen zijn media-integratie/secure delivery en fysieke playback/caption/accessibilityvalidatie.

## Foolproof UX/UI Review

Dit is een directe media-uitbreiding, maar nog geen geïntegreerde learner-UI wijziging.

Beoordeeld:
- persona-consistentie is technisch geborgd via één avatar/voice per rol;
- korte clipduur beperkt interruption cost;
- scripts bevatten dezelfde terminologie als modules/assessments;
- captions worden voor ieder asset gegenereerd;
- essentiële didactische informatie blijft ook in tekst/semantische React-visuals bestaan;
- technische media-complexiteit wordt niet naar de learner gelekt.

### Open UX/accessibility finding

`physicalPlaybackReview=pending` en `captionReview=pending` blijven voor **alle 20 assets** bewust open. Deze runtime kan de HeyGen-media niet betrouwbaar afspelen/frame-inspecteren of de SRT-inhoud ophalen. Daarom zijn framing, lipsync, uitspraak, subtitle timing en captiontekst nog niet als bewezen geaccepteerd.

Dit is een release-blocker, geen reden om te doen alsof de technische render niet bestaat.

## Architecture Product Review

- **Businessarchitectuur:** de beoogde twee-persona leerervaring bestaat nu over alle tien modules.
- **Solutionarchitectuur:** één generation writer, één assetregistry, één presentation identity per persona.
- **Informatie/data:** exact twintig canonical assetkeys met één video-id per asset.
- **Technische coherentie:** media is additief; adaptive/progressarchitectuur blijft intact.
- **Productbruikbaarheid:** iedere module heeft interviewer + tutor naast de reeds gerealiseerde semantic React visuals.
- **Herbruikbaarheid:** het writer/registry/gate-patroon is toepasbaar op volgende EAW courses.
- **Onderhoudbaarheid:** batchonafhankelijke validator en expliciete lifecycle states voorkomen registry drift.
- **Referentiearchitectuurprincipes:** single source of truth, minimal duplication, fail-closed release en separation of concerns zijn behouden.
- **EAW-afhankelijkheden:** secure media, learner-runtime integration, accessibility/physical UX en finale EAW production promotion blijven vervolgstappen.

## Remediation

De presenter-validator is opgeschaald naar lifecycle-modes en de CI-gate controleert nu de volledige 20-assetset.

## Retest

CI #643 volledig groen na remediation en complete registry-materialisatie.

## Gatebesluit

`GO WITH ACCEPTED NON-BLOCKING WARNINGS`

Interpretatie: **technische presenter-generation is volledig groen**. De waarschuwingen zijn niet-blocking voor het bestaan/registreren van de assets, maar blijven blocking voor productierelease:
- physical playback review;
- caption/transcript acceptance;
- secure-media delivery/integration.

**Productierelease blijft `NO-GO`.**

## Doelcheck na de stap

**Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?**

Ja. Modules 1–10 beschikken nu ieder over een technisch gevalideerde Eva- en Alexanderclip. De volgende architectonisch juiste stap is de twintig assets gecontroleerd in de learner-runtime te integreren achter secure entitlement-protected delivery, waarna fysieke UX/accessibility/playbackvalidatie kan plaatsvinden.