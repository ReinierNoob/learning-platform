import "server-only";

export const adaptiveModule6CourseSlug = "solution-architectuur-ontwerppraktijk";
export const adaptiveModule6SourceModuleId = 6;
export const adaptiveSchemaVersion = "v2.3";
export const adaptiveModule6ClassifierVersion = "module6-classifier-v1.1";
export const adaptiveModule6AssessmentVersion = "module6-assessment-v1";
export const adaptiveModule6OrchestratorVersion = "adaptive-orchestrator-v2.3";

export function isAdaptivePersistenceEnabled() {
  return process.env.VERCEL_ENV !== "production"
    && process.env.EAW_ADAPTIVE_PERSISTENCE_ENABLED === "true";
}

export function adaptiveAccessStatus(code: string) {
  if (code === "authentication_required") return 401;
  if (code === "entitlement_required") return 403;
  if (code === "course_not_found" || code === "module_not_found") return 404;
  return 500;
}
