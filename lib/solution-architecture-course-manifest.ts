import "server-only";

import type { AdaptiveServerModuleContract } from "./adaptive-module-route-factory";
import { solutionArchitectureModule1Runtime } from "./solution-architecture-module-1-runtime";
import { solutionArchitectureModule2Runtime } from "./solution-architecture-module-2-runtime";
import { solutionArchitectureModule3Runtime } from "./solution-architecture-module-3-runtime";
import { solutionArchitectureModule4Runtime } from "./solution-architecture-module-4-runtime";
import { solutionArchitectureModule5Runtime } from "./solution-architecture-module-5-factory-runtime";
import { solutionArchitectureModule6Runtime } from "./solution-architecture-module-6-runtime";
import { solutionArchitectureModule7Runtime } from "./solution-architecture-module-7-runtime";
import { solutionArchitectureModule8Runtime } from "./solution-architecture-module-8-runtime";
import { solutionArchitectureModule9Runtime } from "./solution-architecture-module-9-runtime";
import { solutionArchitectureModule10Runtime } from "./solution-architecture-module-10-runtime";

const optionKeys = ["A", "B", "C", "D"] as const;

const runtimes: readonly AdaptiveServerModuleContract[] = [
  solutionArchitectureModule1Runtime,
  solutionArchitectureModule2Runtime,
  solutionArchitectureModule3Runtime,
  solutionArchitectureModule4Runtime,
  solutionArchitectureModule5Runtime,
  solutionArchitectureModule6Runtime,
  solutionArchitectureModule7Runtime,
  solutionArchitectureModule8Runtime,
  solutionArchitectureModule9Runtime,
  solutionArchitectureModule10Runtime,
];

export type SolutionArchitectureCourseManifest = {
  schemaVersion: "sa-course-manifest-v1";
  course: {
    slug: string;
    title: string;
    description: string;
  };
  modules: Array<{
    sourceModuleId: number;
    slug: string;
    title: string;
    contentVersion: string;
    quiz: Array<{
      nr: number;
      vraag: string;
      opties: Record<string, string>;
    }>;
    answerKeyLines: string[];
    items: readonly [
      { itemType: "content"; title: "Adaptief leerpad"; position: 1; isRequired: true },
      { itemType: "assessment"; title: "Eindcheck"; position: 2; isRequired: true },
    ];
  }>;
};

function moduleToManifest(runtime: AdaptiveServerModuleContract) {
  const { definition, answerKey, assessmentVersion } = runtime;
  if (!definition.assessment.length) {
    throw new Error(`solution_architecture_manifest_empty_assessment:${definition.sourceModuleId}`);
  }

  const quiz = definition.assessment.map((question, index) => {
    if (question.options.length < 2 || question.options.length > optionKeys.length) {
      throw new Error(`solution_architecture_manifest_option_count_out_of_range:${definition.sourceModuleId}:${question.id}:${question.options.length}`);
    }
    const answerIndex = answerKey[question.id];
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) {
      throw new Error(`solution_architecture_manifest_answer_key_mismatch:${definition.sourceModuleId}:${question.id}`);
    }
    const keys = optionKeys.slice(0, question.options.length);
    return {
      nr: index + 1,
      vraag: question.question,
      opties: Object.fromEntries(keys.map((key, optionIndex) => [key, question.options[optionIndex]])),
    };
  });

  const answerKeyLines = definition.assessment.map((question, index) => {
    const answerIndex = answerKey[question.id];
    const answer = optionKeys[answerIndex];
    const explanation = `Correcte optie: ${question.options[answerIndex]}`.replace(/\r?\n/g, " ");
    return `${index + 1}=${answer} (${explanation})`;
  });

  return {
    sourceModuleId: definition.sourceModuleId,
    slug: definition.moduleSlug,
    title: definition.title,
    contentVersion: assessmentVersion,
    quiz,
    answerKeyLines,
    items: [
      { itemType: "content" as const, title: "Adaptief leerpad" as const, position: 1 as const, isRequired: true as const },
      { itemType: "assessment" as const, title: "Eindcheck" as const, position: 2 as const, isRequired: true as const },
    ] as const,
  };
}

export function buildSolutionArchitectureCourseManifest(): SolutionArchitectureCourseManifest {
  const courseSlugs = new Set(runtimes.map((runtime) => runtime.definition.courseSlug));
  if (courseSlugs.size !== 1) throw new Error("solution_architecture_manifest_course_slug_mismatch");

  const modules = runtimes.map(moduleToManifest).sort((a, b) => a.sourceModuleId - b.sourceModuleId);
  const sourceIds = modules.map((module) => module.sourceModuleId);
  if (sourceIds.length !== 10 || sourceIds.some((id, index) => id !== index + 1)) {
    throw new Error(`solution_architecture_manifest_source_module_sequence:${sourceIds.join(",")}`);
  }
  if (new Set(modules.map((module) => module.slug)).size !== modules.length) {
    throw new Error("solution_architecture_manifest_duplicate_module_slug");
  }

  return {
    schemaVersion: "sa-course-manifest-v1",
    course: {
      slug: runtimes[0].definition.courseSlug,
      title: "Solution Architecture – Ontwerppraktijk",
      description: "Praktijkgerichte leerlijn Solution Architecture met adaptieve Modules 1–10 en een integrale eindcasus.",
    },
    modules,
  };
}
