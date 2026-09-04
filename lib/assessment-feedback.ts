const feedbackPrefix = "FEEDBACK_V1 ";

export type AssessmentFeedback = Record<number, Record<string, string>>;

export function encodeAssessmentFeedback(feedback: AssessmentFeedback) {
  return `${feedbackPrefix}${Buffer.from(JSON.stringify(feedback), "utf8").toString("base64url")}`;
}

export function parseAssessmentFeedback(systemInstruction: string | null | undefined): AssessmentFeedback {
  const encoded = String(systemInstruction ?? "")
    .split("\n")
    .find((line) => line.startsWith(feedbackPrefix))
    ?.slice(feedbackPrefix.length)
    .trim();
  if (!encoded) return {};

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const feedback: AssessmentFeedback = {};
    for (const [questionNumber, options] of Object.entries(parsed)) {
      const nr = Number(questionNumber);
      if (!Number.isInteger(nr) || !options || typeof options !== "object" || Array.isArray(options)) continue;
      feedback[nr] = Object.fromEntries(
        Object.entries(options).filter(([option, value]) => /^[A-D]$/.test(option) && typeof value === "string"),
      ) as Record<string, string>;
    }
    return feedback;
  } catch {
    return {};
  }
}
