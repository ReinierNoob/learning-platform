import "server-only";

import { solutionArchitectureModule1 } from "./solution-architecture-module-1";
import { solutionArchitectureModule2 } from "./solution-architecture-module-2";
import { solutionArchitectureModule3 } from "./solution-architecture-module-3";
import { solutionArchitectureModule4 } from "./solution-architecture-module-4";
import { solutionArchitectureModule5 } from "./solution-architecture-module-5";
import { solutionArchitectureModule6 } from "./solution-architecture-module-6-definition";
import { solutionArchitectureModule7 } from "./solution-architecture-module-7";
import { solutionArchitectureModule8 } from "./solution-architecture-module-8";
import { solutionArchitectureModule9 } from "./solution-architecture-module-9";
import { solutionArchitectureModule10 } from "./solution-architecture-module-10";

export const adaptiveSolutionArchitectureCourseSlug = solutionArchitectureModule1.courseSlug;
export const adaptiveModule1SourceModuleId = solutionArchitectureModule1.sourceModuleId;
export const adaptiveModule2SourceModuleId = solutionArchitectureModule2.sourceModuleId;
export const adaptiveModule3SourceModuleId = solutionArchitectureModule3.sourceModuleId;
export const adaptiveModule4SourceModuleId = solutionArchitectureModule4.sourceModuleId;
export const adaptiveModule5SourceModuleId = solutionArchitectureModule5.sourceModuleId;
export const adaptiveModule6CourseSlug = solutionArchitectureModule6.courseSlug;
export const adaptiveModule6SourceModuleId = solutionArchitectureModule6.sourceModuleId;
export const adaptiveModule7SourceModuleId = solutionArchitectureModule7.sourceModuleId;
export const adaptiveModule8SourceModuleId = solutionArchitectureModule8.sourceModuleId;
export const adaptiveModule9SourceModuleId = solutionArchitectureModule9.sourceModuleId;
export const adaptiveModule10SourceModuleId = solutionArchitectureModule10.sourceModuleId;
export const adaptiveSchemaVersion = "v2.3";
export const adaptiveModule6ClassifierVersion = "module6-classifier-v1.1";
export const adaptiveModule6AssessmentVersion = "module6-assessment-v1";
export const adaptiveModule6OrchestratorVersion = "adaptive-orchestrator-v2.3";

const adaptivePreviewFlagByModule: Readonly<Record<number, string>> = {
  [adaptiveModule1SourceModuleId]: "EAW_ADAPTIVE_MODULE1_IN_LEARNING",
  [adaptiveModule2SourceModuleId]: "EAW_ADAPTIVE_MODULE2_IN_LEARNING",
  [adaptiveModule3SourceModuleId]: "EAW_ADAPTIVE_MODULE3_IN_LEARNING",
  [adaptiveModule4SourceModuleId]: "EAW_ADAPTIVE_MODULE4_IN_LEARNING",
  [adaptiveModule5SourceModuleId]: "EAW_ADAPTIVE_MODULE5_IN_LEARNING",
  [adaptiveModule6SourceModuleId]: "EAW_ADAPTIVE_MODULE6_IN_LEARNING",
  [adaptiveModule7SourceModuleId]: "EAW_ADAPTIVE_MODULE7_IN_LEARNING",
  [adaptiveModule8SourceModuleId]: "EAW_ADAPTIVE_MODULE8_IN_LEARNING",
  [adaptiveModule9SourceModuleId]: "EAW_ADAPTIVE_MODULE9_IN_LEARNING",
  [adaptiveModule10SourceModuleId]: "EAW_ADAPTIVE_MODULE10_IN_LEARNING",
};

export function isAdaptiveSolutionArchitectureProductionEnabled() {
  return process.env.VERCEL_ENV === "production"
    && process.env.EAW_SOLUTION_ARCHITECTURE_PRODUCTION_ENABLED === "true";
}

/**
 * Persistence is explicit in every environment. Production additionally requires
 * the Solution Architecture release flag so rollback remains fail-closed.
 */
export function isAdaptivePersistenceEnabled() {
  if (process.env.VERCEL_ENV === "production") {
    return isAdaptiveSolutionArchitectureProductionEnabled()
      && process.env.EAW_ADAPTIVE_PERSISTENCE_ENABLED === "true";
  }
  return process.env.EAW_ADAPTIVE_PERSISTENCE_ENABLED === "true";
}

/**
 * Adaptive presentation is allowlisted per course + module in preview.
 * Production is enabled only for the released Solution Architecture course and
 * only when its explicit production release flag is present.
 */
export function isAdaptiveLearningEnabled(courseSlug: string, sourceModuleId: number) {
  if (courseSlug !== adaptiveSolutionArchitectureCourseSlug) return false;

  const flag = adaptivePreviewFlagByModule[sourceModuleId];
  if (!flag) return false;

  if (process.env.VERCEL_ENV === "production") {
    return isAdaptiveSolutionArchitectureProductionEnabled();
  }

  return process.env[flag] === "true";
}

/** Backwards-compatible helper while Module 6-specific server files are still present. */
export function isAdaptiveModule6LearningEnabled(courseSlug: string, sourceModuleId: number) {
  return sourceModuleId === adaptiveModule6SourceModuleId
    && isAdaptiveLearningEnabled(courseSlug, sourceModuleId);
}

export function adaptiveAccessStatus(code: string) {
  if (code === "authentication_required") return 401;
  if (code === "entitlement_required") return 403;
  if (code === "course_not_found" || code === "module_not_found") return 404;
  return 500;
}
