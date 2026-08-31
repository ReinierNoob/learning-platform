import { readFileSync, existsSync } from "node:fs";

const modules = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const endpoints = [
  ["diagnose", "createAdaptiveDiagnoseHandler", "POST"],
  ["observe", "createAdaptiveObserveHandler", "POST"],
  ["override", "createAdaptiveOverrideHandler", "POST"],
  ["state", "createAdaptiveStateHandler", "GET"],
  ["assess", "createAdaptiveAssessHandler", "POST"],
];

const failures = [];

for (const moduleNumber of modules) {
  const runtimePath = moduleNumber === 5
    ? "lib/solution-architecture-module-5-factory-runtime.ts"
    : `lib/solution-architecture-module-${moduleNumber}-runtime.ts`;

  if (!existsSync(runtimePath)) {
    failures.push(`Module ${moduleNumber}: runtime contract ontbreekt (${runtimePath})`);
  } else {
    const runtime = readFileSync(runtimePath, "utf8");
    if (!runtime.includes("AdaptiveServerModuleContract")) {
      failures.push(`Module ${moduleNumber}: runtime implementeert AdaptiveServerModuleContract niet expliciet`);
    }
  }

  for (const [endpoint, factoryHandler, method] of endpoints) {
    const routePath = `app/api/adaptive/solution-architecture-module-${moduleNumber}/${endpoint}/route.ts`;
    if (!existsSync(routePath)) {
      failures.push(`Module ${moduleNumber}: endpoint ontbreekt (${endpoint})`);
      continue;
    }

    const route = readFileSync(routePath, "utf8");
    if (!route.includes(factoryHandler)) {
      failures.push(`Module ${moduleNumber}/${endpoint}: gebruikt ${factoryHandler} niet`);
    }
    if (!route.includes(`export const ${method} =`)) {
      failures.push(`Module ${moduleNumber}/${endpoint}: verwacht ${method}-export`);
    }
    for (const forbidden of ["NextResponse", "persistAdaptiveTransitionForLearner", "requireAdaptiveLearningContext", "getAdaptiveStateForLearner"]) {
      if (route.includes(forbidden)) {
        failures.push(`Module ${moduleNumber}/${endpoint}: duplicerende serverlogica aangetroffen (${forbidden})`);
      }
    }
  }
}

const clientRuntime = readFileSync("components/adaptive/config-driven/AdaptiveModuleExperience.tsx", "utf8");
if (!clientRuntime.includes("attempts >= 2")) {
  failures.push("Generic client runtime: anti-lockout na twee tutor-observations ontbreekt");
}
if (!clientRuntime.includes("observation?.canProceed === true") || !clientRuntime.includes("const canProceed")) {
  failures.push("Generic client runtime: tutor-observation proceed gate ontbreekt");
}

const progressRuntime = readFileSync("lib/adaptive-platform-progress.ts", "utf8");
const firstProgressWrite = progressRuntime.indexOf("await recordProgress");
const questionGuard = progressRuntime.indexOf("!validateQuestionContract");
const answerKeyGuard = progressRuntime.indexOf("validateConfiguredAnswerKey");
const mismatchReturn = progressRuntime.indexOf('return { status: "contract_mismatch"');
if (firstProgressWrite < 0 || questionGuard < 0 || answerKeyGuard < 0 || mismatchReturn < 0) {
  failures.push("Platformprogress: fail-closed contractguards of progresswrite ontbreken");
} else if (!(questionGuard < firstProgressWrite && answerKeyGuard < firstProgressWrite && mismatchReturn < firstProgressWrite)) {
  failures.push("Platformprogress: progresswrite kan plaatsvinden vóór volledige assessmentcontractvalidatie");
}

if (failures.length > 0) {
  console.error("Adaptive route convergence: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Adaptive route convergence: PASS (${modules.length} modules, ${modules.length * endpoints.length} endpoints, anti-lockout + fail-closed progress guards)`);
