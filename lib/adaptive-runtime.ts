import "server-only";

export const adaptiveSolutionArchitectureCourseSlug = "solution-architectuur-ontwerppraktijk";
export const adaptiveModule5SourceModuleId = 5;
export const adaptiveModule6CourseSlug = adaptiveSolutionArchitectureCourseSlug;
export const adaptiveModule6SourceModuleId = 6;
export const adaptiveSchemaVersion = "v2.3";
export const adaptiveModule6ClassifierVersion = "module6-classifier-v1.1";
export const adaptiveModule6AssessmentVersion = "module6-assessment-v1";
export const adaptiveModule6OrchestratorVersion = "adaptive-orchestrator-v2.3";

/**
 * Persistence remains explicitly preview-gated until the production release gate is approved.
 */
export function isAdaptivePersistenceEnabled() {
  return process.env.VERCEL_ENV !== "production"
    && process.env.EAW_ADAPTIVE_PERSISTENCE_ENABLED === "true";
}

/**
 * Adaptive presentation is allowlisted per course + module and hard-disabled in production.
 * Each module has its own preview flag so rollout can be reversed independently.
 */
export function isAdaptiveLearningEnabled(courseSlug: string, sourceModuleId: number) {
  if (process.env.VERCEL_ENV === "production") return false;
  if (courseSlug !== adaptiveSolutionArchitectureCourseSlug) return false;

  if (sourceModuleId === adaptiveModule5SourceModuleId) {
    return process.env.EAW_ADAPTIVE_MODULE5_IN_LEARNING === "true";
  }
  if (sourceModuleId === adaptiveModule6SourceModuleId) {
    return process.env.EAW_ADAPTIVE_MODULE6_IN_LEARNING === "true";
  }
  return false;
}

/** Backwards-compatible helper while Module 6-specific files are still present. */
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
