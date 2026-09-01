# Solution Architecture secure presenter media gate — 2026-09-01

## Oorspronkelijke einddoelstelling
`Solution Architecture – Ontwerppraktijk` moet als complete EAW-training met Modules 1–10 gecontroleerd naar productie, inclusief Eva/Alexander, didactische visualisaties, bestaande EAW-auth/entitlement/enrollment/progress als officiële SoT, adaptive state als sidecar, secure media, accessibility, commerce en publieke productievalidatie.

## Doelcheck vóór de stap
Deze stap moest alle twintig presenterclips uit tijdelijke HeyGen-delivery halen en aantoonbaar beschikbaar maken via private, entitlement-gecontroleerde EAW-mediadelivery zonder een tweede toegangsmodel of een privileged media-secret in de nieuwe learning runtime.

**Kortste architectonisch juiste route:** ja. De bestaande private media-Supabase en EAW-entitlement-SoT zijn hergebruikt. Er is geen nieuwe course-, enrollment- of completionlaag ingevoerd.

---

## Solution Architecture Review

### Single source of truth
- EAW Supabase blijft de enige SoT voor gebruiker, course, entitlement, enrollment, module-publicatie en progress.
- Learning-platform blijft de SoT voor de learnerexperience en verwijst alleen naar presenter media via een generieke route.
- Dedicated media Supabase bewaart uitsluitend private mediabytes en voert signing uit; hij bezit geen zelfstandig entitlementmodel.

### Verantwoordelijkheden
- **Learning-platform presenter route:** sessie-, course-, entitlement- en published-module precheck; same-origin captionproxy; redirect/JSON naar kortlevende media-URL.
- **Media Supabase Edge Function:** hercontroleert EAW-user + `get_my_learning_access` + published module en tekent daarna pas private storage.
- **Media Storage:** private `cursus-videos` bucket; geen publieke objecten.

### Afhankelijkheden en interfaces
Nieuwe presenterketen:
`browser → /api/presenter-media/{module}/{persona} → media edge function → EAW auth/entitlement validation → private storage signing/download`.

De bestaande generieke `app/api/video-url/[id]/[chapter]` route voor andere EAW-video's is bewust niet in deze stap gemigreerd. Die blijft tijdelijk zijn bestaande `VIDEO_SUPABASE_SERVICE_ROLE_KEY` gebruiken. Dit voorkomt een impliciete cross-productmigratie en productieregressie.

### Backward compatibility
- bestaande adaptive endpoints ongewijzigd;
- officiële progress/completion ongewijzigd;
- bestaande generieke video-route behouden;
- presenter media is additief;
- `VIDEO_SUPABASE_URL` blijft de bestaande niet-geheime media-projectbinding.

### Deployment / rollback
- presenter signing kan worden teruggedraaid door de presenter route te verwijderen of media edge te disablen;
- geen database-DDL nodig;
- private media-objecten zijn los van course/progressdata;
- tijdelijke importer en test-runner zijn na gebruik dichtgezet.

### Dubbele configuratie / hardcoding
- geen HeyGen signed URL in source of runtimeconfig;
- geen hardcoded Supabase project URL in learning runtime;
- geen media service-role-secret in de nieuwe presenter-route;
- de bestaande legacy service-roleconfiguratie is expliciet geïsoleerd en blijft voor backward compatibility voorlopig bestaan.

### Race/concurrent writers
- één eenmalig importerpad heeft de canonical 20 assets gematerialiseerd;
- objectnamen zijn deterministisch en uniek;
- importer is daarna permanent disabled;
- runtime is read/sign-only.

### Productie-impact
Geen bestaande course-, commerce-, progress- of legacy-video functionaliteit is gewijzigd buiten de expliciete presenteruitbreiding en environment-contractisolatie.

---

## Uitvoering

### Private materialisatie
Media Supabase project: `jtdcinvkpprgnwvtwvms`.

Bucket:
- `cursus-videos`
- `public=false`

Canonical objectstructuur:
`solution-architecture/presenter/module-NN/{eva-intro-v1|alexander-explainer-v1}.{mp4|srt|vtt}`

Gevalideerde storage-integriteit:
- 60 objecten totaal;
- 20 MP4;
- 20 bron-SRT;
- 20 runtime-WebVTT;
- 10 modules;
- 10 Eva-video's;
- 10 Alexander-video's;
- kleinste MP4: 8.731.268 bytes;
- kleinste VTT: 537 bytes.

### Importer lifecycle
De tijdelijke `solution-architecture-media-importer` heeft uitsluitend canonical assets geschreven en is na materialisatie vervangen door een disabled endpoint. De importer vormt geen blijvende runtime-afhankelijkheid.

### Media trust boundary
Media Edge Function:
- slug `solution-architecture-presenter-media`;
- media project `jtdcinvkpprgnwvtwvms`;
- function version 1;
- function id `12891fc4-37f5-4189-8041-eb4168296413`;
- custom auth boundary;
- unauthenticated probe: HTTP 401.

De functie valideert vóór signing:
1. EAW bearer token via OIDC UserInfo / legacy Auth fallback;
2. `get_my_learning_access` voor course `25456c47-2a33-4e8e-97af-ab9ac8185953`;
3. published module;
4. pas daarna private storage.

Video-URLs verlopen na 900 seconden. Captions worden entitlement-gecontroleerd als `text/vtt` teruggegeven.

### Learning runtime
De learning-platform presenter-route:
- valideert zelf eerst user/course/access/published module;
- bevat geen media service-role-secret;
- geeft de bestaande EAW-usersessie door aan de media-boundary;
- exposeert geen HeyGen runtime-URL;
- gebruikt `Cache-Control: private, no-store` en `Referrer-Policy: no-referrer`.

### Presenter UX-integratie
- Eva vóór diagnose;
- Alexander na routebepaling;
- native video controls;
- `playsInline`;
- geen autoplay;
- Nederlandse captions;
- uitklapbaar teksttranscript;
- essentiële leerstof blijft tevens tekstueel beschikbaar.

---

## Technische validatie

### Source/build contract vóór E2E
Learning CI #666 op commit `94a6c7dca072d446e757c594d6391f686df2cc31`: **PASS**.

Geslaagd:
- environment contract;
- adaptive route convergence;
- canonical manifest export;
- Learning Experience Design contract;
- Visual Experience contract;
- canonical avatar identities;
- all generated presenter media;
- secure presenter media source contract;
- Next.js build;
- adaptive HTTP contracts;
- production hard-deny.

Exacte Vercel preview:
- deployment `dpl_N7Rtm7pEjRfHQvQAoGwZF4P7amBZ`;
- commit `94a6c7dca072d446e757c594d6391f686df2cc31`;
- state `READY`.

### Echte authenticated entitlement E2E
EAW test request: `21372`.

Resultaat: **HTTP 200 / `ok=true`**.

Bewezen:
- `entitledJsonStatus=200`;
- `entitledTtl=900`;
- `signedUrlLooksPrivate=true`;
- signed storage range-read `206`;
- `signedFetchBytes=1024`;
- captions `200`;
- content type `text/vtt; charset=utf-8`;
- captiondocument start met `WEBVTT`;
- minstens één geldige cue (`-->`);
- video redirect `307`;
- redirect wijst naar private signed `cursus-videos` object;
- na revocation van hetzelfde entitlement: `403`.

Dit gebruikt een echte tijdelijke Supabase Auth-user, order/order item en entitlement en de echte Vercel previewroute.

### Cleanup en test-runner hardening
Na E2E:
- temp auth users: 0;
- orders: 0;
- order items: 0;
- entitlements: 0;
- enrollments: 0.

`e2e-learning-runner` is onmiddellijk hersteld naar:
- version 18;
- `verify_jwt=true`;
- SHA `213bb6722a4df355a5b1ce51f51759f4a99bda744965b26afc860b27a5fbde0b`;
- permanent disabled 410-body `e2e_test_endpoint_disabled` achter JWT-verificatie.

---

## Retrospective

**Wat was het doel?**  
Alle twintig presenterclips veilig en entitlement-gecontroleerd beschikbaar maken zonder nieuwe entitlement-SoT.

**Wat is daadwerkelijk gedaan?**  
20 MP4 + 20 SRT + 20 VTT privé gematerialiseerd; entitlement presenter-route geïntegreerd; media-edge trust boundary gebouwd; echte auth/entitlement E2E uitgevoerd; cleanup en runner-disable bewezen; executable secure gate toegevoegd.

**Is het doel bereikt?**  
Ja, voor secure delivery.

**Waar is afgeweken?**  
De eerste presenterimplementatie probeerde signing rechtstreeks vanuit Vercel met `VIDEO_SUPABASE_SERVICE_ROLE_KEY`. Preview miste die configuratie en E2E gaf 503. De structurele remediation verplaatste privileged signing naar de storage-owner: media Supabase.

**Welke onnodige complexiteit is geïntroduceerd?**  
Geen blijvende importer of tweede entitlementdatabase. De media-edge voegt één extra server hop toe, maar verwijdert een privileged Vercel-secret en maakt de trust boundary explicieter.

**Root cause van de gevonden 503?**  
Signingverantwoordelijkheid en secret-locatie waren aanvankelijk verkeerd toegewezen aan de learning runtime in plaats van aan de media/storage boundary.

**Wat is structureel verbeterd?**  
Least privilege: learning runtime bezit geen media service-role voor de nieuwe presenterflow. EAW entitlement wordt aan beide zijden van de media-boundary gevalideerd.

**Pipeline-/skillverbetering?**  
Presenter assets kennen nu aparte gates: `generated → secure → release`. Een technisch gegenereerde video is niet automatisch secure/release-ready.

**Kortste route naar einddoel?**  
Ja. Secure delivery is afgesloten zonder bestaande legacy-video's mee te migreren.

---

## Foolproof UX/UI Review

Deze stap bevat een directe presenter-UI-integratie plus backend security.

- **Begrijpelijkheid:** Eva en Alexander blijven expliciet gelabeld als interviewer/tutor.
- **Terminologie:** consistent met het Learning Experience Design.
- **Foutgevoeligheid:** video is niet de enige bron van essentiële informatie; tekstuele moduleinhoud blijft leidend.
- **Informatiepresentation:** native controls, captions en transcript zijn zichtbaar/bruikbaar zonder custom playergedrag.
- **Toekomstige UI:** media kan responsive worden getest zonder securitycontract te wijzigen.
- **Complexiteitslekkage:** learner ziet geen Supabase-, signed-URL- of entitlementtechniek.

Openstaande UX-blocker voor de volgende stap: framing, lipsync, uitspraak, captiontekst/timing en daadwerkelijke desktop/mobile/touch playback zijn nog niet fysiek geaccepteerd.

---

## Architecture Product Review

### Businessarchitectuur
De presenter-media ondersteunt het leerproduct zonder een parallel verkoop-, toegang- of completionmodel.

### Solutionarchitectuur
EAW blijft authorization-SoT; media-Supabase is storage/signing boundary; learning-platform orchestreert de learnerflow.

### Informatie/datarelaties
Presenter asset identity is gekoppeld aan module + persona. Progress/completion is niet gekoppeld aan videokijken en blijft via de bestaande module-items lopen.

### Technische coherentie
Private storage, korte signed URLs, same-origin captionproxy, defense-in-depth entitlementvalidatie en fail-closed gedrag zijn coherent.

### Productbruikbaarheid
Media is additioneel: een mediaprobleem maakt de essentiële leerstof niet inhoudelijk onbereikbaar.

### Herbruikbaarheid
Het presenter-media patroon kan later worden gegeneraliseerd, maar is nu bewust course-specifiek gehouden om geen impliciete migratie van andere EAW-producten te veroorzaken.

### Onderhoudbaarheid
Deterministische paths, registrycontracten en CI `secure` mode verminderen handmatige drift.

### Referentiearchitectuurprincipes
- single source of truth;
- least privilege;
- defense in depth;
- explicit trust boundary;
- fail closed;
- backward compatibility;
- no hidden completion semantics.

### Afhankelijkheden met andere EAW-producten
De bestaande legacy video-route blijft bewust onaangeraakt en behoudt zijn huidige deployment-preflight. Een eventuele toekomstige migratie daarvan is een aparte architectuurstap.

---

## Remediation
1. Verkeerde directe Vercel signing ownership verwijderd voor presenter-media.
2. Signing verplaatst naar media-Supabase.
3. Hardcoded media-project URL uit runtime verwijderd.
4. Existing `VIDEO_SUPABASE_URL` gebruikt als niet-geheime binding.
5. Environment-contract scoped zodat legacy video-route backward-compatible blijft.
6. Preview/production preflight behoudt legacy service-role-secret uitsluitend voor bestaande video-functionaliteit.
7. Testharnas-cleanup gerepareerd; achtergebleven eerste-testdata verwijderd.
8. Runner na succesvolle test direct disabled.

## Retest
- CI #666: PASS.
- finale preview: READY.
- media edge unauthenticated: 401.
- authenticated entitled E2E: PASS.
- private signed media byte-read: PASS.
- WebVTT caption delivery: PASS.
- revoked entitlement: 403 PASS.
- cleanup: 0 records/users.
- runner restored disabled/JWT-protected: PASS.

## Gatebesluit
`GO`

Dit GO geldt specifiek voor **secure presenter media delivery**. Het is geen release-GO; `captionReview`, `transcriptReview` en `physicalPlaybackReview` blijven bewust open.

## Doelcheck na de stap
**Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?**  
Ja. De volledige presenter-mediaketen is nu veilig en entitlement-gecontroleerd. De architectonisch juiste volgende stap is de fysieke learner-UX/accessibility gate op de complete ervaring met avatars én visualisaties, gevolgd door remediation/retest vóór de integrale Architecture Product Review en productiepromotie.
