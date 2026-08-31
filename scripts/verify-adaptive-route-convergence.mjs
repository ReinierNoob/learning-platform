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

if (failures.length > 0) {
  console.error("Adaptive route convergence: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Adaptive route convergence: PASS (${modules.length} modules, ${modules.length * endpoints.length} endpoints)`);
