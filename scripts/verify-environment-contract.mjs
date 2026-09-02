import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const runtimeRoots = ["app", "components", "lib"];
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const adaptivePreviewKeys = Array.from({ length: 10 }, (_, index) => `EAW_ADAPTIVE_MODULE${index + 1}_IN_LEARNING`);

function extension(path) {
  const index = path.lastIndexOf(".");
  return index >= 0 ? path.slice(index) : "";
}

function walk(root) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...walk(path));
    else if (sourceExtensions.has(extension(path))) files.push(path);
  }
  return files;
}

for (const file of runtimeRoots.flatMap(walk)) {
  const source = readFileSync(file, "utf8");
  if (/sb_publishable_[A-Za-z0-9_-]+/.test(source)) {
    failures.push(`${file}: hardcoded Supabase publishable key in runtime source`);
  }
  if (/https:\/\/[a-z0-9]{20}\.supabase\.co/i.test(source)) {
    failures.push(`${file}: hardcoded Supabase project URL in runtime source`);
  }
  if (/process\.env\.SUPABASE_(?:URL|SERVICE_ROLE_KEY)\b/.test(source)) {
    failures.push(`${file}: legacy generic SUPABASE_* runtime fallback aangetroffen`);
  }
  if (/VIDEO_SUPABASE_SERVICE_ROLE_KEY/.test(source)) {
    failures.push(`${file}: media service-role secret mag niet in de Vercel runtime worden gebruikt`);
  }
}

const presenterRoutePath = "app/api/presenter-media/[id]/[persona]/route.ts";
if (!existsSync(presenterRoutePath)) {
  failures.push("presenter media route ontbreekt");
} else if (readFileSync(presenterRoutePath, "utf8").includes("VIDEO_SUPABASE_SERVICE_ROLE_KEY")) {
  failures.push("presenter media route mag geen media service-role secret gebruiken");
}

const courseVideoRoutePath = "app/api/video-url/[id]/[chapter]/route.ts";
if (!existsSync(courseVideoRoutePath)) {
  failures.push("course video route ontbreekt");
} else {
  const courseVideo = readFileSync(courseVideoRoutePath, "utf8");
  if (!courseVideo.includes("functions/v1/secure-video-url")) {
    failures.push("course video route delegeert signing niet aan secure-video-url edge");
  }
  if (!courseVideo.includes("x-eaw-publishable-key")) {
    failures.push("course video route stuurt de publishable-key contractheader niet naar secure-video-url");
  }
  if (courseVideo.includes("VIDEO_SUPABASE_SERVICE_ROLE_KEY")) {
    failures.push("course video route bevat nog een Vercel media service-role dependency");
  }
}

const platformPath = "lib/platform.ts";
if (!existsSync(platformPath)) {
  failures.push("lib/platform.ts ontbreekt");
} else {
  const platform = readFileSync(platformPath, "utf8");
  if (!platform.includes("Missing EAW_SUPABASE_URL or EAW_SUPABASE_PUBLISHABLE_KEY")) {
    failures.push("platform runtime vereist URL + publishable key niet fail-fast uit environment");
  }
}

const ciPath = ".github/workflows/ci.yml";
if (!existsSync(ciPath)) {
  failures.push("CI workflow ontbreekt");
} else {
  const ci = readFileSync(ciPath, "utf8");
  if (/\.supabase\.co/.test(ci) || /sb_publishable_/.test(ci)) {
    failures.push("basis-CI bevat live Supabase projectbinding; integratie hoort in aparte preview/releasegate");
  }
  if (!ci.includes("https://ci.invalid") || !ci.includes("ci_publishable_key_not_used")) {
    failures.push("basis-CI gebruikt geen expliciete hermetische Supabase placeholders");
  }
}

for (const [label, workflowPath, preflightName] of [
  ["preview", ".github/workflows/vercel-preview.yml", "Verify required preview configuration"],
  ["production", ".github/workflows/vercel-production.yml", "Verify required production environment keys"],
]) {
  if (!existsSync(workflowPath)) {
    failures.push(`${label} workflow ontbreekt`);
    continue;
  }
  const workflow = readFileSync(workflowPath, "utf8");
  if (!workflow.includes(preflightName)) failures.push(`${label} workflow mist environment preflight`);
  for (const key of ["EAW_SUPABASE_URL", "EAW_SUPABASE_PUBLISHABLE_KEY", "EAW_ACCOUNT_URL", "VIDEO_SUPABASE_URL"]) {
    if (!workflow.includes(key)) failures.push(`${label} workflow preflight mist ${key}`);
  }
  if (/VIDEO_SUPABASE_SERVICE_ROLE_KEY/.test(workflow)) {
    failures.push(`${label} workflow bevat nog een media service-role dependency`);
  }
  if (/(^|[^A-Z0-9_])SUPABASE_SERVICE_ROLE_KEY([^A-Z0-9_]|$)/m.test(workflow)) {
    failures.push(`${label} workflow accepteert generieke SUPABASE_SERVICE_ROLE_KEY als runtimefallback`);
  }
  if (/EAW_SUPABASE_URL:\s*https:\/\//.test(workflow)) {
    failures.push(`${label} workflow hardcodet EAW_SUPABASE_URL en schendt Vercel target env SoT`);
  }
  if (/EAW_SUPABASE_PUBLISHABLE_KEY:\s*sb_publishable_/.test(workflow)) {
    failures.push(`${label} workflow hardcodet EAW_SUPABASE_PUBLISHABLE_KEY en schendt Vercel target env SoT`);
  }
  if (!workflow.includes("decrypt=true")) {
    failures.push(`${label} workflow leest de concrete Vercel targetwaarden niet voor contractvalidatie`);
  }
  if (!workflow.includes("rest/v1/courses?select=id&limit=1")) {
    failures.push(`${label} workflow valideert de EAW Supabase URL/key-combinatie niet live vóór deployment`);
  }
  if (label === "preview") {
    for (const key of adaptivePreviewKeys) {
      if (!workflow.includes(key)) failures.push(`preview workflow mist branch-scoped adaptive flag ${key}`);
    }
    if (!workflow.includes("gitBranch")) failures.push("preview workflow borgt adaptive previewflags niet per gitBranch");
  }
}

const physicalUxWorkflowPath = ".github/workflows/solution-architecture-physical-ux-e2e.yml";
if (!existsSync(physicalUxWorkflowPath)) {
  failures.push("physical UX workflow ontbreekt");
} else {
  const physical = readFileSync(physicalUxWorkflowPath, "utf8");
  for (const key of adaptivePreviewKeys) {
    if (!physical.includes(key)) failures.push(`physical UX workflow mist adaptive previewflag ${key}`);
  }
  if (!physical.includes("gitBranch")) failures.push("physical UX workflow configureert adaptive flags niet branch-scoped");
  if (!physical.includes("PR_HEAD_SHA") || !physical.includes("PR_HEAD_REF")) failures.push("physical UX workflow bindt deployment niet expliciet aan PR head sha/ref");
}

if (failures.length) {
  console.error("Environment contract: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Environment contract: PASS (Vercel target env is runtime SoT; preview and production validate the concrete EAW Supabase URL/key pair before deployment; preview is no longer an EAW Supabase config writer; course and presenter media signing stay inside Supabase edge functions; no media service-role secret is present in Vercel runtime; Solution Architecture adaptive preview flags are branch-scoped; physical UX binds an exact PR-head preview; no hardcoded Supabase runtime credentials/URLs)");
