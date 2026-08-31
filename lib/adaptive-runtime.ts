import "server-only";

import { solutionArchitectureModule1 } from "./solution-architecture-module-1";
import { solutionArchitectureModule2 } from "./solution-architecture-module-2";
import { solutionArchitectureModule3 } from "./solution-architecture-module-3";
import { solutionArchitectureModule4 } from "./solution-architecture-module-4";
import { solutionArchitectureModule5 } from "./solution-architecture-module-5";
import { solutionArchitectureModule6 } from "./solution-architecture-module-6-definition";

export const adaptiveSolutionArchitectureCourseSlug = solutionArchitectureModule1.courseSlug;
export const adaptiveModule1SourceModuleId = solutionArchitectureModule1.sourceModuleId;
export const adaptiveModule2SourceModuleId = solutionArchitectureModule2.sourceModuleId;
export const adaptiveModule3SourceModuleId = solutionArchitectureModule3.sourceModuleId;
export const adaptiveModule4SourceModuleId = solutionArchitectureModule4.sourceModuleId;
export const adaptiveModule5SourceModuleId = solutionArchitectureModule5.sourceModuleId;
export const adaptiveModule6CourseSlug = solutionArchitectureModule6.courseSlug;
export const adaptiveModule6SourceModuleId = solutionArchitectureModule6.sourceModuleId;
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
};

/**
 * Persistence remains explicitly preview-gated until the production release gate is approved.
 */
export function isAdaptivePersistenceEnabled() {
  return process.env.VERCEL_ENV !== "production"
    && process.env.EAW_ADAPTIVE_PERSISTENCE_ENABLED === "true";
}

/**
 * Adaptive presentation is allowlisted per course + module and hard-disabled in production.
 * The module definitions own course/module identity; this server-only registry owns preview flags.
 */
export function isAdaptiveLearningEnabled(courseSlug: string, sourceModuleId: number) {
  if (process.env.VERCEL_ENV === "production") return false;
  if (courseSlug !== adaptiveSolutionArchitectureCourseSlug) return false;

  const flag = adaptivePreviewFlagByModule[sourceModuleId];
  return Boolean(flag) && process.env[flag] === "true";
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
