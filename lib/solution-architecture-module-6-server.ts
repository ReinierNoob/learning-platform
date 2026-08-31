import "server-only";

export const module6AnswerKey: Readonly<Record<string, number>> = {
  "m6-assess-01": 1,
  "m6-assess-02": 1,
  "m6-assess-03": 1,
};

export const module6ObjectiveByQuestion: Readonly<Record<string, string>> = {
  "m6-assess-01": "sa.m06.alternatieven-vergelijken",
  "m6-assess-02": "sa.m06.adr-onderdelen",
  "m6-assess-03": "sa.m06.adr-beoordelen",
};

export const module6RemediationByQuestion: Readonly<Record<string, readonly string[]>> = {
  "m6-assess-01": ["m6-trade-off-repair-v1", "m6-attributen-standard-v1"],
  "m6-assess-02": ["m6-adr-anatomie-standard-v1"],
  "m6-assess-03": ["m6-consequenties-repair-v1"],
};
