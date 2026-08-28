# Interactive tutor PoC

## Doel

Deze PoC valideert een nieuwe EAW-lesvorm: interviewer → Alexander → gesynchroniseerde visuele modelopbouw → oefening → feedback. De implementatie staat op een featurebranch en wijzigt de bestaande productieflow onder `/leren/[slug]/module/[id]` niet.

## Architectuurprincipes

1. **Inhoud en presentatie scheiden.** Een les wordt beschreven in een scene-manifest. De React-player rendert de scène, spreker, tekst en visualisatie.
2. **Visualisaties blijven native.** Value Streams, capabilities en andere architectuurmodellen worden als HTML/CSS/React opgebouwd, niet ingebakken in een video. Daardoor blijven ze scherp, responsive en later interactief te maken.
3. **Video is een mediolaag.** Een avatarvideo van Alexander of de interviewer kan per scène worden toegevoegd zonder de modellogica te wijzigen.
4. **Tijdcodes sturen de visualisatie.** Een scène bevat `visualCues` met een tijdstip in milliseconden. De player vertaalt de mediaklok naar de juiste zichtbare modelstatus.
5. **Bestaande beveiligde video-architectuur hergebruiken.** De huidige learning-platform vraagt een tijdelijke video-URL op via `/api/video-url/...`. De avatarvideo's moeten via hetzelfde beveiligingsprincipe worden ontsloten; geen publieke media-URL's in de lesdefinitie.
6. **Toetsing blijft platform-native.** Oefeningen en voortgang worden niet in de avatarvideo ingebakken, zodat de bestaande quiz- en voortgangslogica herbruikbaar blijft.

## Persistencestrategie voor de PoC

De bestaande tabel `module_items` heeft al een generiek `content jsonb`-veld, maar de databaseconstraint op `item_type` staat alleen `content`, `video`, `exercise` en `assessment` toe. Voor de PoC wordt daarom **geen productieconstraint aangepast**.

De interactieve les past voorlopig in het bestaande contract als:

```json
{
  "item_type": "content",
  "content": {
    "renderer": "interactive_tutor_v1",
    "schemaVersion": 1,
    "lessonId": "value-stream-healthcare-example-v1"
  }
}
```

De volledige TypeScript-contractdefinitie staat in `lib/learning-item-types.ts`. De discriminator `renderer` en `schemaVersion` maken het mogelijk nieuwe renderers of toekomstige manifestversies gecontroleerd naast elkaar te ondersteunen. Als interactieve lessen later een structureel zelfstandig module-item worden, kan een expliciet `interactive_lesson`-type alsnog via een gecontroleerde database-migratie worden toegevoegd.

## Scene-manifest

```ts
type VisualCue = {
  atMs: number;
  visibleStages: number;
  showCapabilities: boolean;
};

type LessonScene = {
  id: string;
  speaker: "interviewer" | "alexander";
  title: string;
  transcript: string;
  durationMs: number;
  media?: {
    assetId: string;
  };
  visualCues: VisualCue[];
  exercise?: {
    type: "single-choice";
    question: string;
    options: string[];
    correctIndex: number;
    feedbackCorrect: string;
    feedbackIncorrect: string;
  };
};
```

De `assetId` is bewust geen openbare URL. In productie wordt die via de bestaande geautoriseerde mediaflow omgezet naar een tijdelijke afspeel-URL.

## PoC-les Value Streams

Het zorgvoorbeeld is uitsluitend illustratief. De trigger is **zorgbehoefte ontstaat** en staat buiten de value stages. De voorbeeldstages zijn:

1. Toegang tot zorg verkrijgen
2. Zorgvraag beoordelen
3. Passende zorg plannen
4. Geplande zorg ontvangen
5. Uitkomst evalueren

Capabilities worden pas in een latere scène zichtbaar gemaakt, zodat value stream en capability eerst afzonderlijk worden uitgelegd.

## Technische fasering

- **Fase 1 — gerealiseerd:** scene-navigatie, browser-spraak, native Value Stream-opbouw en oefening.
- **Fase 2 — gerealiseerd:** tijdlijn uit een versieerbaar manifest; visual cues worden op milliseconden getriggerd. De PoC gebruikt een interne klok.
- **Fase 3 — eerstvolgend:** één echte Alexander-scène als beveiligd media-asset; `video.currentTime` vervangt de interne klok zonder het manifest te wijzigen.
- **Fase 4 — hoofdstukintegratie:** de nieuwe renderer als optionele `content.renderer = interactive_tutor_v1` binnen de bestaande hoofdstuk-/moduleflow.
- **Fase 5 — productiecontent:** vaste EAW Visual Teaching Language voor Value Streams, capabilities en andere Business Architecture-artefacten.

## Niet doen in deze PoC

- De bestaande `/leren`-routes of toegangscontrole vervangen.
- Publieke videolinks opslaan in lescontent.
- AI vrij een architectuurmodel laten improviseren zonder vooraf gevalideerd scene-manifest.
- De huidige quizregistratie dupliceren in een externe videotool.
- De productieconstraint op `module_items.item_type` wijzigen voordat de leervorm is gevalideerd.
