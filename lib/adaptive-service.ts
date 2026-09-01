import "server-only";

import {
  getAccessToken,
  getCourseBySlug,
  getLearningAccess,
  getPublishedModule,
  getSessionUser,
  type Course,
  type CourseModule,
  type LearningAccess,
  type SessionUser,
} from "./platform";
import {
  getAdaptiveState,
  recordAdaptiveTransition,
  type AdaptiveState,
  type AdaptiveTransitionInput,
  type AdaptiveTransitionResult,
} from "./adaptive-store";

export type AdaptiveLearningContext = {
  token: string;
  user: SessionUser;
  course: Course;
  access: LearningAccess;
  module: CourseModule;
};

export class AdaptiveAccessError extends Error {
  constructor(public readonly code: "authentication_required" | "course_not_found" | "entitlement_required" | "module_not_found") {
    super(code);
  }
}

/**
 * Resolves the same identity, course, entitlement and published-module context
 * used by the standard /leren flow. Adaptive learning must never create a
 * parallel authorization path.
 */
export async function requireAdaptiveLearningContext(
  courseSlug: string,
  sourceModuleId: number,
  suppliedToken?: string | null,
): Promise<AdaptiveLearningContext> {
  const token = suppliedToken ?? await getAccessToken();
  if (!token) throw new AdaptiveAccessError("authentication_required");

  const user = await getSessionUser(token);
  if (!user) throw new AdaptiveAccessError("authentication_required");

  const course = await getCourseBySlug(courseSlug, token);
  if (!course) throw new AdaptiveAccessError("course_not_found");

  const access = await getLearningAccess(course.id, token);
  if (!access.can_access || !access.enrollment_id) {
    throw new AdaptiveAccessError("entitlement_required");
  }

  const module = await getPublishedModule(course.id, sourceModuleId, token);
  if (!module) throw new AdaptiveAccessError("module_not_found");

  return { token, user, course, access, module };
}

export async function persistAdaptiveTransitionForLearner(
  context: AdaptiveLearningContext,
  transition: Omit<AdaptiveTransitionInput, "profile"> & {
    profile: Omit<AdaptiveTransitionInput["profile"], "userId" | "courseId">;
  },
): Promise<AdaptiveTransitionResult> {
  return recordAdaptiveTransition({
    profile: {
      ...transition.profile,
      userId: context.user.id,
      courseId: context.course.id,
    },
    evidence: transition.evidence.map((item) => ({
      ...item,
      moduleId: item.moduleId ?? context.module.id,
    })),
    decision: {
      ...transition.decision,
      moduleId: transition.decision.moduleId ?? context.module.id,
    },
  });
}

export async function getAdaptiveStateForLearner(context: AdaptiveLearningContext): Promise<AdaptiveState> {
  return getAdaptiveState(context.user.id, context.course.id);
}
