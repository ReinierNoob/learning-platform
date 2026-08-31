import "server-only";

import { assessmentQuestions } from "./solution-architecture-module-6";
import { getLearningAccess, getModuleItems, recordProgress } from "./platform";
import type { AdaptiveLearningContext } from "./adaptive-service";

export type AdaptivePlatformProgressStatus =
  | "synced"
  | "not_configured"
  | "contract_mismatch"
  | "failed";

export type AdaptivePlatformProgressResult = {
  status: AdaptivePlatformProgressStatus;
  completionPercentage: number | null;
  score: number | null;
};

function normalize(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function validateAssessmentContract(context: AdaptiveLearningContext) {
  const quiz = Array.isArray(context.module.quiz) ? context.module.quiz : [];
  if (quiz.length !== assessmentQuestions.length) return false;

  return assessmentQuestions.every((expected, index) => {
    const configured = quiz[index];
    if (!configured || Number(configured.nr) !== index + 1) return false;
    if (normalize(configured.vraag) !== normalize(expected.question)) return false;
    const configuredOptions = Object.values(configured.opties ?? {}).map(normalize);
    const expectedOptions = [...expected.options].map(normalize);
    return configuredOptions.length === expectedOptions.length
      && configuredOptions.every((option, optionIndex) => option === expectedOptions[optionIndex]);
  });
}

/**
 * Synchronizes a passed adaptive mastery check with the existing EAW progress
 * mechanism. This deliberately reuses record-progress / complete_module_item
 * instead of creating a second completion model.
 *
 * Fail closed: if the published Module 6 assessment contract differs from the
 * adaptive assessment, no platform completion is written.
 */
export async function syncAdaptiveModule6PlatformProgress(
  context: AdaptiveLearningContext,
  adaptiveAnswers: Record<string, number>,
): Promise<AdaptivePlatformProgressResult> {
  try {
    if (!validateAssessmentContract(context)) {
      return { status: "contract_mismatch", completionPercentage: null, score: null };
    }

    const items = await getModuleItems(context.module.id, context.token);
    const requiredContent = items.filter((item) => item.item_type === "content" && item.is_required);
    const assessmentItems = items.filter((item) => item.item_type === "assessment" && item.is_required);

    if (assessmentItems.length !== 1) {
      return { status: "not_configured", completionPercentage: null, score: null };
    }

    // The adaptive route replaces the fixed chapter sequence. Once the learner
    // demonstrates all mandatory Module 6 objectives, all required content
    // items in the same published module may be completed through the existing
    // progress endpoint before the canonical assessment item is recorded.
    for (const item of requiredContent) {
      await recordProgress(context.token, { itemId: item.id });
    }

    const configuredQuiz = context.module.quiz;
    const platformAnswers: Record<string, string> = {};
    for (let index = 0; index < assessmentQuestions.length; index += 1) {
      const adaptiveQuestion = assessmentQuestions[index];
      const selectedIndex = adaptiveAnswers[adaptiveQuestion.id];
      const configured = configuredQuiz[index];
      const optionKeys = Object.keys(configured.opties ?? {});
      const selectedKey = optionKeys[selectedIndex];
      if (!selectedKey) {
        return { status: "contract_mismatch", completionPercentage: null, score: null };
      }
      platformAnswers[String(configured.nr)] = selectedKey;
    }

    const graded = await recordProgress(context.token, {
      itemId: assessmentItems[0].id,
      answers: platformAnswers,
      startedAt: new Date().toISOString(),
    });

    if (graded.score !== 100) {
      return { status: "contract_mismatch", completionPercentage: null, score: graded.score };
    }

    const access = await getLearningAccess(context.course.id, context.token);
    const percentage = access.completion_percentage == null
      ? null
      : Number(access.completion_percentage);

    return {
      status: "synced",
      completionPercentage: Number.isFinite(percentage) ? percentage : null,
      score: graded.score,
    };
  } catch (error) {
    console.error("adaptive_platform_progress_sync_failed", error);
    return { status: "failed", completionPercentage: null, score: null };
  }
}
