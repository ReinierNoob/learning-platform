import type { AdaptiveModuleDefinition } from "./adaptive-module-definition";
import {
  assessmentQuestions,
  diagnosticQuestions,
  interventions,
  routeSequences,
} from "./solution-architecture-module-6";

const assessmentObjectiveByQuestion: Record<string, string> = {
  "m6-assess-01": "sa.m06.alternatieven-vergelijken",
  "m6-assess-02": "sa.m06.adr-onderdelen",
  "m6-assess-03": "sa.m06.adr-beoordelen",
};

export const solutionArchitectureModule6: AdaptiveModuleDefinition = {
  courseSlug: "solution-architectuur-ontwerppraktijk",
  sourceModuleId: 6,
  moduleSlug: "ontwerpkeuzes-en-trade-offs",
  title: "Ontwerpkeuzes en trade-offs",
  standardReferences: [
    {
      name: "ISO/IEC 25010",
      version: "2023",
      reference: "ISO/IEC 25010:2023, Edition 2 — Product quality model",
    },
    {
      name: "Architecture Decision Records",
      version: "classical Nygard form",
      reference: "Michael Nygard — Documenting Architecture Decisions",
    },
  ],
  objectives: [
    "sa.m06.dominante-attributen",
    "sa.m06.alternatieven-vergelijken",
    "sa.m06.waarom-alternatieven",
    "sa.m06.adr-onderdelen",
    "sa.m06.adr-beoordelen",
  ],
  misconceptions: [
    "sa.mc.trade-off-is-fout",
    "sa.mc.consequenties-alleen-positief",
    "sa.mc.adr-achteraf",
  ],
  diagnostics: diagnosticQuestions.map((item) => ({
    id: item.id,
    objectiveIds: [item.objectiveId],
    prompt: item.question,
    kind: "free_text" as const,
  })),
  interventions: Object.fromEntries(
    Object.entries(interventions).map(([id, item]) => [id, {
      id: item.id,
      objectiveId: item.objectiveId,
      speaker: item.speaker,
      title: item.title,
      kind: item.kind,
      body: item.body,
      prompt: item.prompt,
      // The visual plugin uses the intervention id to resolve the existing
      // Module 6 visual state. The client-safe definition still contains no
      // assessment answer key.
      visualMode: id,
    }]),
  ),
  routes: routeSequences,
  assessment: assessmentQuestions.map((item) => ({
    id: item.id,
    objectiveId: assessmentObjectiveByQuestion[item.id],
    question: item.question,
    options: item.options,
  })),
  mediaPolicy: {
    interviewerVideo: false,
    optionalTutorClipIds: [
      "m6-attributen-standard-v1",
      "m6-consequenties-standard-v1",
    ],
  },
};
