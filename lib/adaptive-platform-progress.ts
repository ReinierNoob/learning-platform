import "server-only";

import { assessmentQuestions as module6AssessmentQuestions } from "./solution-architecture-module-6";
import { module6AnswerKey } from "./solution-architecture-module-6-server";
import {
  eawPublishableKey,
  eawSupabaseUrl,
  getLearningAccess,
  getModuleItems,
  recordProgress,
} from "./platform";
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

export type AdaptiveAssessmentQuestion = {
  id: string;
  question: string;
  options: readonly string[];
};

function normalize(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function shouldSyncAdaptivePlatformProgress(
  request: Request,
  explicitFlag?: boolean,
) {
  if (explicitFlag === true) return true;
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).pathname.startsWith("/leren/");
  } catch {
    return false;
  }
}

function validateQuestionContract(
  context: AdaptiveLearningContext,
  assessmentQuestions: readonly AdaptiveAssessmentQuestion[],
) {
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

async function validateConfiguredAnswerKey(
  context: AdaptiveLearningContext,
  assessmentQuestions: readonly AdaptiveAssessmentQuestion[],
  adaptiveAnswerKey: Readonly<Record<string, number>>,
) {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?id=eq.${encodeURIComponent(context.module.id)}&select=system_instruction&limit=1`,
    {
      headers: {
        apikey: eawPublishableKey,
        Authorization: `Bearer ${context.token}`,
      },
      cache: "no-store",
    },
  );
  if (!response.ok) return false;
  const [row] = await response.json() as Array<{ system_instruction?: string | null }>;
  if (!row) return false;

  const configuredKey = new Map<number, string>();
  for (const match of String(row.system_instruction ?? "").matchAll(/(?:^|\n)\s*(\d+)\s*=\s*([A-D])\s*\(([^\n]+)\)/g)) {
    configuredKey.set(Number(match[1]), match[2]);
  }

  if (configuredKey.size < assessmentQuestions.length) return false;

  return assessmentQuestions.every((question, index) => {
    const configured = context.module.quiz[index];
    const optionKeys = Object.keys(configured.opties ?? {});
    const expectedIndex = adaptiveAnswerKey[question.id];
    const expectedKey = optionKeys[expectedIndex];
    return Boolean(expectedKey) && configuredKey.get(Number(configured.nr)) === expectedKey;
  });
}

/**
 * Synchronizes a passed adaptive mastery check with the existing EAW progress
 * mechanism. The host platform remains the owner of official course progress.
 *
 * Fail closed: question text, options AND the central configured answer key
 * must match before any standard platform progress is written.
 */
export async function syncAdaptiveModulePlatformProgress(
  context: AdaptiveLearningContext,
  assessmentQuestions: readonly AdaptiveAssessmentQuestion[],
  adaptiveAnswerKey: Readonly<Record<string, number>>,
  adaptiveAnswers: Record<string, number>,
): Promise<AdaptivePlatformProgressResult> {
  try {
    if (
      !validateQuestionContract(context, assessmentQuestions)
      || !(await validateConfiguredAnswerKey(context, assessmentQuestions, adaptiveAnswerKey))
    ) {
      return { status: "contract_mismatch", completionPercentage: null, score: null };
    }

    const items = await getModuleItems(context.module.id, context.token);
    const requiredContent = items.filter((item) => item.item_type === "content" && item.is_required);
    const assessmentItems = items.filter((item) => item.item_type === "assessment" && item.is_required);

    if (assessmentItems.length !== 1) {
      return { status: "not_configured", completionPercentage: null, score: null };
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

    for (const item of requiredContent) {
      await recordProgress(context.token, { itemId: item.id });
    }

    const graded = await recordProgress(context.token, {
      itemId: assessmentItems[0].id,
      answers: platformAnswers,
      startedAt: new Date().toISOString(),
    });

    if (graded.score !== 100) {
      console.error("adaptive_platform_progress_unexpected_score", graded.score);
      return { status: "failed", completionPercentage: null, score: graded.score };
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

/** Backwards-compatible Module 6 wrapper. */
export function syncAdaptiveModule6PlatformProgress(
  context: AdaptiveLearningContext,
  adaptiveAnswers: Record<string, number>,
) {
  return syncAdaptiveModulePlatformProgress(
    context,
    module6AssessmentQuestions,
    module6AnswerKey,
    adaptiveAnswers,
  );
}
