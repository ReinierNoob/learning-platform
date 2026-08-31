import { readFileSync, existsSync, readdirSync } from "node:fs";

const adaptiveApiRoot = "app/api/adaptive";
const modules = readdirSync(adaptiveApiRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^solution-architecture-module-\d+$/.test(entry.name))
  .map((entry) => Number(entry.name.match(/\d+$/)?.[0]))
  .filter(Number.isInteger)
  .sort((a, b) => a - b);

const endpoints = [
  ["diagnose", "createAdaptiveDiagnoseHandler", "POST"],
  ["observe", "createAdaptiveObserveHandler", "POST"],
  ["override", "createAdaptiveOverrideHandler", "POST"],
  ["state", "createAdaptiveStateHandler", "GET"],
  ["assess", "createAdaptiveAssessHandler", "POST"],
];

const failures = [];

const architectureDecisionPath = "docs/adaptive-architecture-decision-a.md";
if (!existsSync(architectureDecisionPath)) {
  failures.push("Pre-scaling architecture decision ontbreekt");
} else {
  const decision = readFileSync(architectureDecisionPath, "utf8");
  if (!decision.includes("**Status:** ACCEPTED") || !decision.includes("generic server-side route factory") || !decision.includes("Pre-scaling architecture decision gate")) {
    failures.push("Pre-scaling architecture decision is niet ACCEPTED of mist het factorydoelpatroon");
  }
}

if (modules.length === 0) failures.push("Geen adaptive Solution Architecture modules gevonden");

const learningHostPath = "app/leren/[slug]/module/[id]/page.tsx";
const learningHost = existsSync(learningHostPath) ? readFileSync(learningHostPath, "utf8") : "";
if (!learningHost) failures.push("Centrale learning host ontbreekt");

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
    const routePath = `${adaptiveApiRoot}/solution-architecture-module-${moduleNumber}/${endpoint}/route.ts`;
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

  const componentPath = `components/adaptive/solution-architecture-module-${moduleNumber}/AdaptiveModule${moduleNumber}Experience.tsx`;
  if (!existsSync(componentPath)) {
    failures.push(`Module ${moduleNumber}: adaptive clientcomponent ontbreekt (${componentPath})`);
  }

  const labPath = `app/lab/solution-architecture-module-${moduleNumber}/page.tsx`;
  if (!existsSync(labPath)) {
    failures.push(`Module ${moduleNumber}: preview QA-lab ontbreekt (${labPath})`);
  } else {
    const lab = readFileSync(labPath, "utf8");
    if (!lab.includes('process.env.VERCEL_ENV === "production"') || !lab.includes("notFound()")) {
      failures.push(`Module ${moduleNumber}: QA-lab is niet hard-denied in productie`);
    }
  }

  const hostWrapperPath = `app/leren/[slug]/module/[id]/adaptive-module${moduleNumber}-experience.tsx`;
  if (!existsSync(hostWrapperPath)) {
    failures.push(`Module ${moduleNumber}: learning-host wrapper ontbreekt (${hostWrapperPath})`);
  }

  if (learningHost && (!learningHost.includes(`AdaptiveModule${moduleNumber}LearningExperience`) || !learningHost.includes(`sourceModuleId === ${moduleNumber}`))) {
    failures.push(`Module ${moduleNumber}: centrale learning host routeert niet aantoonbaar naar de adaptive ervaring`);
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

console.log(`Adaptive route convergence: PASS (${modules.length} discovered modules, ${modules.length * endpoints.length} endpoints, architecture decision + API + client + lab + learning-host integration + anti-lockout + fail-closed progress guards)`);
