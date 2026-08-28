export type InteractiveLessonSpeaker = "interviewer" | "alexander";

export type InteractiveLessonVisualState = {
  visibleStages: number;
  showCapabilities: boolean;
};

export type InteractiveLessonVisualCue = InteractiveLessonVisualState & {
  atMs: number;
};

export type InteractiveLessonSingleChoiceExercise = {
  type: "single-choice";
  question: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
};

export type InteractiveLessonScene = {
  id: string;
  speaker: InteractiveLessonSpeaker;
  title: string;
  transcript: string;
  durationMs: number;
  media?: {
    /** Logical asset reference only. Never persist a temporary signed URL here. */
    assetId: string;
  };
  visualCues: InteractiveLessonVisualCue[];
  exercise?: InteractiveLessonSingleChoiceExercise;
};

export type InteractiveTutorContentV1 = {
  renderer: "interactive_tutor_v1";
  schemaVersion: 1;
  lessonId: string;
  title: string;
  discipline: string;
  exampleLabel?: string;
  triggerLabel: string;
  outcomeLabel: string;
  valueStages: Array<{
    name: string;
    capability?: string;
  }>;
  scenes: InteractiveLessonScene[];
};

export function isInteractiveTutorContentV1(value: unknown): value is InteractiveTutorContentV1 {
  if (!value || typeof value !== "object") return false;
  const content = value as Partial<InteractiveTutorContentV1>;
  return (
    content.renderer === "interactive_tutor_v1" &&
    content.schemaVersion === 1 &&
    typeof content.lessonId === "string" &&
    typeof content.title === "string" &&
    typeof content.triggerLabel === "string" &&
    typeof content.outcomeLabel === "string" &&
    Array.isArray(content.valueStages) &&
    Array.isArray(content.scenes)
  );
}
