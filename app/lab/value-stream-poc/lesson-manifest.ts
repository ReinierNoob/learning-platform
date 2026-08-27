import type {
  InteractiveLessonSingleChoiceExercise,
  InteractiveLessonSpeaker,
  InteractiveLessonVisualState,
  InteractiveTutorContentV1,
} from "../../../lib/learning-item-types";

export type Speaker = InteractiveLessonSpeaker;
export type VisualState = InteractiveLessonVisualState;

const triggerExercise: InteractiveLessonSingleChoiceExercise = {
  type: "single-choice",
  question: "Welke optie beschrijft het beste de trigger?",
  options: [
    "De zorgbehoefte ontstaat",
    "De behandeling wordt uitgevoerd",
    "De patiënt wordt ontslagen",
  ],
  correctIndex: 0,
  feedbackCorrect: "Correct. De trigger is de gebeurtenis of behoefte waardoor de waardestroom start.",
  feedbackIncorrect: "Niet helemaal. Deze gebeurtenis vindt binnen of na de waardestroom plaats en is dus niet de aanleiding waardoor de waardecreatie start.",
};

export const valueStreamContent: InteractiveTutorContentV1 = {
  renderer: "interactive_tutor_v1",
  schemaVersion: 1,
  lessonId: "value-stream-healthcare-example-v1",
  title: "Value Streams",
  discipline: "Business Architecture",
  exampleLabel: "Illustratief zorgvoorbeeld",
  triggerLabel: "Zorgbehoefte ontstaat",
  outcomeLabel: "Passende zorg ontvangen",
  valueStages: [
    { name: "Toegang tot zorg verkrijgen", capability: "Access Management" },
    { name: "Zorgvraag beoordelen", capability: "Assessment" },
    { name: "Passende zorg plannen", capability: "Care Planning" },
    { name: "Geplande zorg ontvangen", capability: "Care Delivery" },
    { name: "Uitkomst evalueren", capability: "Outcome Evaluation" },
  ],
  scenes: [
    {
      id: "question",
      speaker: "interviewer",
      title: "De kernvraag",
      transcript: "Wat is een value stream eigenlijk, en waarom is het niet gewoon een proces?",
      durationMs: 7000,
      visualCues: [{ atMs: 0, visibleStages: 0, showCapabilities: false }],
    },
    {
      id: "definition",
      speaker: "alexander",
      title: "Van trigger naar uitkomst",
      transcript: "Een value stream laat zien hoe waarde wordt gerealiseerd voor een stakeholder. We starten bij een trigger en eindigen bij een gewenste uitkomst.",
      durationMs: 9456,
      media: { assetId: "heygen:7f989484231d48ffbb12c141f41fbfff" },
      visualCues: [{ atMs: 0, visibleStages: 0, showCapabilities: false }],
    },
    {
      id: "stage-1",
      speaker: "alexander",
      title: "Value stage 1",
      transcript: "Na de trigger moet de stakeholder toegang tot passende zorg kunnen verkrijgen. Dat is onze eerste value stage.",
      durationMs: 9500,
      visualCues: [
        { atMs: 0, visibleStages: 0, showCapabilities: false },
        { atMs: 3600, visibleStages: 1, showCapabilities: false },
      ],
    },
    {
      id: "stage-2",
      speaker: "alexander",
      title: "Value stage 2",
      transcript: "Vervolgens wordt de zorgvraag beoordeeld, zodat duidelijk wordt welke behoefte daadwerkelijk moet worden geadresseerd.",
      durationMs: 9000,
      visualCues: [
        { atMs: 0, visibleStages: 1, showCapabilities: false },
        { atMs: 3300, visibleStages: 2, showCapabilities: false },
      ],
    },
    {
      id: "stage-3",
      speaker: "alexander",
      title: "Value stage 3",
      transcript: "Daarna wordt de passende zorg gepland. We blijven op waardestroomniveau en modelleren dus nog geen procesactiviteiten.",
      durationMs: 10000,
      visualCues: [
        { atMs: 0, visibleStages: 2, showCapabilities: false },
        { atMs: 3300, visibleStages: 3, showCapabilities: false },
      ],
    },
    {
      id: "stage-4",
      speaker: "alexander",
      title: "Value stage 4",
      transcript: "In de volgende value stage ontvangt de stakeholder de geplande zorg.",
      durationMs: 7000,
      visualCues: [
        { atMs: 0, visibleStages: 3, showCapabilities: false },
        { atMs: 2500, visibleStages: 4, showCapabilities: false },
      ],
    },
    {
      id: "stage-5",
      speaker: "alexander",
      title: "Value stage 5",
      transcript: "Tot slot wordt de bereikte uitkomst geëvalueerd. Daarmee kunnen we bepalen of de beoogde waarde daadwerkelijk is gerealiseerd.",
      durationMs: 10000,
      visualCues: [
        { atMs: 0, visibleStages: 4, showCapabilities: false },
        { atMs: 3200, visibleStages: 5, showCapabilities: false },
      ],
    },
    {
      id: "challenge",
      speaker: "interviewer",
      title: "Maar dit lijkt toch op een proces?",
      transcript: "Waar zit dan precies het verschil met een procesmodel?",
      durationMs: 6500,
      visualCues: [{ atMs: 0, visibleStages: 5, showCapabilities: false }],
    },
    {
      id: "capabilities",
      speaker: "alexander",
      title: "Koppel capabilities",
      transcript: "De value stream beschrijft de waardecreatie. Capabilities beschrijven wat de organisatie moet kunnen om iedere value stage mogelijk te maken.",
      durationMs: 10500,
      visualCues: [
        { atMs: 0, visibleStages: 5, showCapabilities: false },
        { atMs: 4500, visibleStages: 5, showCapabilities: true },
      ],
    },
    {
      id: "exercise",
      speaker: "alexander",
      title: "Nu jij",
      transcript: "Welke formulering beschrijft het beste de trigger voor deze illustratieve waardestroom?",
      durationMs: 7000,
      visualCues: [{ atMs: 0, visibleStages: 5, showCapabilities: true }],
      exercise: triggerExercise,
    },
  ],
};

export const valueStages = valueStreamContent.valueStages;
export const valueStreamLesson = valueStreamContent.scenes;
