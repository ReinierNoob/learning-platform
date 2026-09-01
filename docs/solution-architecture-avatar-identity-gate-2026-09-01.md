# Solution Architecture canonical avatar identity gate — 2026-09-01

## Oorspronkelijke einddoelstelling
`Solution Architecture – Ontwerppraktijk` moet als complete EAW-training met Modules 1–10 naar productie, inclusief consistente Eva/Alexander-persona’s, didactische visualisaties, secure media, bestaande auth/entitlement/enrollment/progress, adaptive state als sidecar, accessibility, commerce en gecontroleerde productiepromotie.

## Doelcheck vóór de stap
Deze stap moest exact één canonical avatar-identity en één vaste Nederlandse voice per persona vastleggen, zodat de 20 presenterclips niet per module van gezicht of stem kunnen wisselen.

## Solution Architecture Review
- Persona-identiteit is presentatie-/experienceconfiguratie en verandert geen course-, assessment- of progressmodel.
- Bestaande private EAW-HeyGen-identiteiten worden hergebruikt; er worden geen onnodige nieuwe avatar-identiteiten aangemaakt.
- De learning experience registry is de release-SoT voor de gekozen group/voice IDs.
- Productiedeployment blijft fail-closed totdat naast identity ook alle verplichte video’s, captions/transcripts en module-statussen gereed zijn.
- Historische onzekerheid wordt niet als feit ingevuld: de oude HeyGen video-uitlezing exposeert het gebruikte avatar-group/voice-id niet.

## Uitvoering
### Eva — canonical release identity
- bestaande private HeyGen identity: `Eva — EAW Interviewer`;
- group/look id: `4acc8e9013e42f8ebe9f18d7f5b779fc`;
- status: `completed`, previewbeeld aanwezig;
- historische referentievideo: `fc452c7590704259b401586417ea49ab`;
- vaste releasevoice: `Sharon` (`82601fe034ea4d18994b5211acff8d03`), Dutch/female.

### Alexander — canonical release identity
Vier completed private groepen met dezelfde historische naam waren aanwezig. Omdat de oude video-API niet kan bewijzen welke group bij de historische video hoorde, is geen ongefundeerde reconstructie gedaan.

Expliciet releasebesluit:
- canonical group: `578fb2b222dd3e125ebb5aced5a7c16c`;
- status: completed, previewbeeld aanwezig;
- superseded candidate groups: `4aa2719861f6a205038605b62393da12`, `80a9e52ebc22eb9eadd94183cf47c742`, `b353e09320772f74eb5199b4470d9fc9`;
- historische referentievideo: `c818fb2342c8406c9bc34d0753c5c56e`;
- vaste releasevoice: `Peter` (`05c3275ea199464fb7edbd10e91c7513`), Dutch/male.

### Voice proof
Beide gekozen voices zijn met echte Solution Architecture-zinnen via HeyGen speech synthesis gevalideerd in `nl-NL` en leverden geldige audio + woordtimings op.

## Pipeline-remediation
`scripts/verify-solution-architecture-experience.mjs` heeft nu een afzonderlijke `identity` mode. CI controleert daardoor vóór build:
- `avatar.status=ready`;
- geldig group-id;
- geldig voice-id;
- voiceName;
- expliciete selectionBasis;
- alle eerder gesloten design-/visual-contracten.

## Technische validatie
Definitieve identity commit voor CI: `2c20b09238d28b6c7b98414b87051aa5a95be6a2`.

Learning platform CI #630 / run `33446625783`: **PASS**.

Geslaagd:
- environment contract;
- adaptive route convergence;
- manifest export;
- Learning Experience Design contract;
- Visual Experience contract;
- canonical avatar identity contract;
- Next.js build;
- adaptive HTTP contracts;
- production hard-deny.

## Retrospective
**Doel:** één consistente Eva en Alexander plus vaste voices vastleggen.  
**Gedaan:** bestaande identities ontdekt/hergebruikt, duplicaten expliciet behandeld, voices geselecteerd en synthetisch gevalideerd, registry + CI aangepast.  
**Doel bereikt:** ja.  
**Afwijking:** de historische Alexander-group kon niet betrouwbaar uit oude video metadata worden gereconstrueerd. Daarom is een expliciet nieuw releasebesluit genomen.  
**Onnodige complexiteit:** geen nieuwe avatars of voice clones gemaakt.  
**Root cause van het duplicaatrisico:** eerdere HeyGen-prototyping had meerdere gelijknamige Alexander-groepen zonder canonical release-identitycontract.  
**Structurele verbetering:** identity wordt nu vóór video-assetproductie in CI gepind.  
**Pipelineverbetering:** afzonderlijke `identity` gate tussen visual experience en video asset production.  
**Kortste route:** ja.

## Foolproof UX/UI Review
`NO_DIRECT_UI_CHANGE`

- Consistent gezicht en stem verlagen cognitieve ruis voor de learner.
- Eva en Alexander houden een vaste rol/terminologie over alle modules.
- Voice selection wordt niet per clip opnieuw gekozen.
- Historische duplicaten lekken niet naar de learnerervaring.

## Architecture Product Review
- **Business:** twee herkenbare begeleiders ondersteunen de EAW-propositie als consistente leerervaring.
- **Solution:** persona identity blijft presentatieconfiguratie; runtime/progressarchitectuur blijft ongewijzigd.
- **Data:** één canonical group/voice-paar per persona in de release registry.
- **Techniek:** bestaande HeyGen assets worden hergebruikt; geen extra identity lifecycle.
- **Productbruikbaarheid:** visuele en auditieve continuïteit over Modules 1–10.
- **Herbruikbaarheid:** dezelfde persona-identities kunnen gecontroleerd in volgende EAW-learningproducten worden hergebruikt.
- **Onderhoudbaarheid:** CI detecteert ontbrekende/ongeldige identitymetadata.
- **Referentieprincipes:** single source of truth en no-duplicate-configuration zijn versterkt.

## Remediation
Alexander-duplicaten zijn uit de releasekeuze gehaald en expliciet als superseded candidates geregistreerd. Een aparte CI identity gate is toegevoegd.

## Retest
CI #630 volledig groen na identity- en pipelinewijziging.

## Gatebesluit
`GO`

## Doelcheck na de stap
**Wat ben ik nu aan het doen en draagt dit rechtstreeks bij aan de oorspronkelijke einddoelstelling?** Ja. De volgende juiste stap is Wave-1 video-assetproductie voor Modules 1, 4, 6 en 10, gevolgd door media-integratie, secure-media review en een fysieke learner-UX-review vóór de overige video-wave wordt opgeschaald.