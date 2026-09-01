export type AdaptiveRouteId = "A" | "B" | "C";

export type AdaptiveSpeaker = "interviewer" | "alexander";

export type AdaptiveDiagnosticQuestion = {
  id: string;
  objectiveIds: string[];
  prompt: string;
  kind: "single_choice" | "free_text";
  options?: readonly string[];
};

export type AdaptiveIntervention = {
  id: string;
  objectiveId: string;
  speaker: AdaptiveSpeaker;
  title: string;
  kind: "explanation" | "repair" | "check" | "practice" | "assessment";
  body: string;
  prompt?: string;
  visualMode?: string;
};

export type AdaptiveAssessmentQuestion = {
  id: string;
  objectiveId: string;
  question: string;
  options: readonly string[];
};

export type AdaptiveModuleDefinition = {
  courseSlug: string;
  sourceModuleId: number;
  moduleSlug: string;
  title: string;
  standardReferences: readonly {
    name: string;
    version: string;
    reference: string;
  }[];
  objectives: readonly string[];
  misconceptions: readonly string[];
  diagnostics: readonly AdaptiveDiagnosticQuestion[];
  interventions: Readonly<Record<string, AdaptiveIntervention>>;
  routes: Readonly<Record<AdaptiveRouteId, readonly string[]>>;
  assessment: readonly AdaptiveAssessmentQuestion[];
  mediaPolicy: {
    interviewerVideo: boolean;
    optionalTutorClipIds: readonly string[];
  };
};
