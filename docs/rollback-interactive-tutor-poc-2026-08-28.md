# Rollback Interactive Tutor PoC — 2026-08-28

Doel: verwijder de interactieve tutor PoC uit productie en herstel de bestaande learning-platform als enige productieflow.

Verwijderd uit deze rollbackbranch:
- `/lab/value-stream-poc`;
- `/api/lab/value-stream-video/[scene]`;
- PoC scene-manifest, UI en styling;
- PoC typecontract en ongebruikte Synthesia helper;
- productie-PoC-documentatie.

Buiten scope en ongewijzigd:
- `/leren/[slug]/module/[id]`;
- bestaande OAuth/PKCE;
- bestaande entitlementchecks;
- bestaande `secure-video-url` videolaag;
- bestaande trainingcontent en voortgang.

De volledige PoC blijft bewaard op branch `archive/interactive-tutor-poc-2026-08-28`. De HeyGen-video-assets blijven in private storage bewaard.
