# Solution Architecture Wave 1 presenter media gate — 2026-09-01

## Oorspronkelijke einddoelstelling
`Solution Architecture – Ontwerppraktijk` moet als complete EAW-training met Modules 1–10 veilig naar productie, inclusief consistente Eva/Alexander-presenters, didactische visualisaties, secure media, bestaande auth/entitlement/enrollment/progress, adaptive state als sidecar, accessibility, commerce en gecontroleerde productiepromotie.

## Doelcheck vóór de stap
Deze stap moest eerst een representatieve Wave 1 voor Modules 1, 4, 6 en 10 produceren en valideren. Alleen als deze referentiegolf technisch én fysiek bruikbaar is, mag productie worden opgeschaald naar de overige zes modules.

## Solution Architecture Review
De eerdere route via HeyGen Video Agent v3 bleek voor deze request een digital-twin prerequisite af te dwingen. Dat was geen productvereiste: de course-architectuur heeft al canonical private EAW photo-avatar identities en de didactische visualisaties worden afzonderlijk in semantische React-UI geleverd.

Structurele keuze:
- presenterclips gebruiken de ondersteunde HeyGen v3 `create_video_from_avatar`-route;
- bestaande private photo-avatar identities blijven canonical;
- geen nieuwe digital-twin identitylaag;
- geen B-roll of slideshow in de presenterclip;
- visual learning content blijft in de bestaande React-SoT;
- generation output wordt niet als production delivery URL gebruikt;
- fysieke playbackreview en secure EAW delivery blijven afzonderlijke harde gates.

Dit behoudt single source of truth, voorkomt identiteitsduplicatie en houdt de presenter- en visualverantwoordelijkheden gescheiden.

## Uitvoering
Acht presenterclips zijn met vaste identities, voices, scripts en outputcontracten gegenereerd:

| Module | Persona | Asset key | HeyGen video asset id | Duur |
|---|---|---|---|---:|
| 1 | Eva | `sa-m01-eva-intro-v1` | `4a98866731eab935ce76e7ea6954ea64` | 26.592 s |
| 1 | Alexander | `sa-m01-alexander-explainer-v1` | `067466cf79e9febf46bd43d0650c5552` | 29.520 s |
| 4 | Eva | `sa-m04-eva-intro-v1` | `d9dc454d8c22f3f2529a9273c3043fdd` | 25.128 s |
| 4 | Alexander | `sa-m04-alexander-explainer-v1` | `053deb44ce45a9c0136a5bda955c68af` | 29.088 s |
| 6 | Eva | `sa-m06-eva-intro-v1` | `b9c1684572a365bd001de1b36faadbcb` | 21.048 s |
| 6 | Alexander | `sa-m06-alexander-explainer-v1` | `36c6f25f7e8c8360f7913cebfafd582c` | 31.368 s |
| 10 | Eva | `sa-m10-eva-intro-v1` | `202c1eedfd84830444d87c30964c4d58` | 29.712 s |
| 10 | Alexander | `sa-m10-alexander-explainer-v1` | `54c8dd038efdb76e4e34078c0a4b22a5` | 36.625 s |

Alle acht hebben status `completed`; alle acht leveren een subtitle-sidecar; geen generation failure is gemeld.

Outputrequest voor alle clips:
- landscape 16:9;
- 1080p;
- mp4;
- SRT sidecar captions;
- rustige presenter motion;
- Eva: canonical Eva + vaste Dutch voice Sharon;
- Alexander: canonical Alexander + vaste Dutch voice Peter.

De canonical registry registreert dit als `generationStatus=completed` en `captionStatus=generated`, maar houdt `playbackReviewStatus=pending`. Modules 1, 4, 6 en 10 staan daarom op `blocked_playback_review_pending`.

## Technische validatie
De course registry bevat een expliciete `mediaArchitecture` met:
- generation route `v3_create_video_from_avatar`;
- outputcontract;
- `physicalPlaybackReviewRequired=true`;
- `secureDeliveryRequired=true`;
- expliciete regel dat signed HeyGen generation URLs geen canonical production delivery URLs zijn.

`scripts/verify-solution-architecture-experience.mjs wave1` controleert fail-closed:
- exact Modules 1, 4, 6 en 10 bevatten gegenereerde presenterassets;
- exact 8 unieke video asset IDs;
- alle generation statuses zijn `completed`;
- alle durations zijn positief;
- alle caption statuses zijn `generated`;
- alle playbackreviews staan nog `pending`;
- de overige modules hebben nog geen gegenereerde videoassets;
- Wave 1 modules blijven expliciet release-blocked.

Learning platform CI #634 / run `33459838821`: **PASS**.

Geslaagd:
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

## Fysieke playbackvalidatie — blocker
Er is geprobeerd de gegenereerde mediabytes buiten de HeyGen-player technisch te openen voor frame-/captionanalyse.

Beschikbare tools leveren de video als HeyGen player plus signed generation URLs. In de huidige uitvoeringsomgeving:
- de container kan `files2.heygen.ai` niet resolven;
- de browser-automation CLI is niet beschikbaar;
- de webfetch-beveiliging accepteert de tijdelijke signed HeyGen URL niet als analysetarget;
- de HeyGen connector exposeert status, duur, player en subtitle-URL, maar niet de mediaframes of subtitle-inhoud als leesbare toolresponse.

Daarom zijn de volgende kwaliteitsclaims **niet** gedaan:
- correcte framing gedurende de hele clip;
- natuurlijke lipsync/motion;
- auditief natuurlijke voice over de hele clip;
- captiontekst exact gelijk aan het script;
- geen zichtbare rendering artefacts.

Het zou onjuist zijn deze controles als PASS te registreren zonder de bytes daadwerkelijk te hebben beoordeeld.

## Retrospective
**Wat was het doel?** Een representatieve presenter-wave technisch én fysiek valideren vóór opschaling.  
**Wat is daadwerkelijk gedaan?** Acht clips geproduceerd; identity/voice/script/output vastgezet; generation en subtitles aantoonbaar compleet; registry en CI als executable stage-contract uitgebreid.  
**Doel bereikt?** Gedeeltelijk: technische generation is bereikt, fysieke playbackvalidatie niet.  
**Afwijking?** De eerste Video Agent-route introduceerde ten onrechte een digital-twin prerequisite. Dit is structureel gecorrigeerd naar de bestaande-avatarroute.  
**Onnodige complexiteit geïntroduceerd?** Nee; juist een extra identitylaag voorkomen.  
**Root cause?** Video Agent combineert presenter en productieflow anders dan de EAW-architectuur, waarin presenterclips en semantische visualisaties gescheiden zijn.  
**Structurele verbetering?** Kies generation route op basis van mediaresponsibility: presenter-only → existing-avatar route; composited/cinematic video → Video Agent.  
**Pipeline-/skillverbetering?** Voeg een verplichte media-route decision en fysieke playbackreview toe vóór batchgeneratie.  
**Kortste route naar einddoel?** Ja, maar verdere batchgeneratie vóór playbackreview zou nu juist verspilling en risico introduceren.

## Foolproof UX/UI Review
`NO_DIRECT_UI_CHANGE`

De clips zijn nog niet in de learner geïntegreerd. Voor de toekomstige learner-UX gelden wel reeds harde eisen:
- één herkenbare Eva en één herkenbare Alexander over de hele cursus;
- geen essentiële kennis uitsluitend in video;
- captions/transcript als alternatief;
- presenterclips kort en functiegericht;
- geen technische generation-URL zichtbaar voor de learner;
- failure of missing media mag de cursusinhoud niet onbegrijpelijk maken.

Open blocking UX finding: fysieke playbackkwaliteit van de acht referentieclips is nog niet aantoonbaar beoordeeld.

## Architecture Product Review
- **Businessarchitectuur:** presenterrollen ondersteunen interviewer/tutor-verantwoordelijkheden zonder businessbeslissingen over te nemen.
- **Solutionarchitectuur:** bestaande photo-avatar route sluit beter aan op de EAW scheiding tussen presenter en semantic visual UI dan Video Agent.
- **Informatie/data:** registry is de enige release-SoT voor media asset IDs en statussen.
- **Technische coherentie:** generated, reviewed, securely delivered en release-ready zijn verschillende states.
- **Productbruikbaarheid:** korte clips en transcriptbasis zijn passend, maar playbackkwaliteit is nog niet bewezen.
- **Herbruikbaarheid:** media-stagecontract kan voor andere EAW-cursussen worden hergebruikt.
- **Onderhoudbaarheid:** unieke asset IDs en modulegebonden release-status voorkomen stille drift.
- **Referentiearchitectuur:** single source of truth, fail-closed release en separation of concerns zijn behouden.

## Remediation
1. Video Agent/digital-twin route verlaten voor presenter-only clips.
2. Bestaande canonical photo-avatar identities hergebruikt.
3. Acht concrete Wave 1 assets gegenereerd.
4. `mediaArchitecture` en Wave 1 stage-status aan de canonical registry toegevoegd.
5. Executable Wave 1 CI-contract toegevoegd.
6. Playbackreview expliciet als blokkade gemodelleerd in plaats van impliciet aangenomen.

## Retest
Learning platform CI #634 is volledig groen na alle bovenstaande remediation.

## Gatebesluit
`NO-GO`

Reden: de technische generationlaag is bewezen, maar de vooraf afgesproken fysieke playback-/UX-review van de representatieve Wave 1 kan in de huidige toolomgeving niet aantoonbaar worden uitgevoerd. Daarom mogen Modules 2, 3, 5, 7, 8 en 9 nog niet in batch worden gegenereerd en mag secure-media/release-integratie nog niet als afgerond worden beschouwd.

## Doelcheck na de stap
**Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?** Ja. De structurele media-route en Wave 1 generation zijn gerealiseerd. De huidige oplossingsrichting stopt terecht bij de playbackreview-gate; verder opschalen zonder die review zou niet langer de kortste architectonisch juiste route zijn.