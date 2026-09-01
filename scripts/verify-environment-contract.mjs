import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const runtimeRoots = ["app", "components", "lib"];
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const legacyMediaSecretPath = "app/api/video-url/[id]/[chapter]/route.ts";

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
  if (/VIDEO_SUPABASE_SERVICE_ROLE_KEY/.test(source) && file !== legacyMediaSecretPath) {
    failures.push(`${file}: media service-role secret is alleen tijdelijk toegestaan in de bestaande legacy video-url route`);
  }
}

const presenterRoutePath = "app/api/presenter-media/[id]/[persona]/route.ts";
if (!existsSync(presenterRoutePath)) {
  failures.push("presenter media route ontbreekt");
} else if (readFileSync(presenterRoutePath, "utf8").includes("VIDEO_SUPABASE_SERVICE_ROLE_KEY")) {
  failures.push("presenter media route mag geen media service-role secret gebruiken");
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
  ["preview", ".github/workflows/vercel-preview.yml", "Verify required preview secret configuration"],
  ["production", ".github/workflows/vercel-production.yml", "Verify required production environment keys"],
]) {
  if (!existsSync(workflowPath)) {
    failures.push(`${label} workflow ontbreekt`);
    continue;
  }
  const workflow = readFileSync(workflowPath, "utf8");
  if (!workflow.includes(preflightName)) failures.push(`${label} workflow mist environment preflight`);
  for (const key of ["EAW_SUPABASE_URL", "EAW_SUPABASE_PUBLISHABLE_KEY", "EAW_ACCOUNT_URL", "VIDEO_SUPABASE_URL", "VIDEO_SUPABASE_SERVICE_ROLE_KEY"]) {
    if (!workflow.includes(key)) failures.push(`${label} workflow preflight mist ${key}`);
  }
  if (/(^|[^A-Z0-9_])SUPABASE_SERVICE_ROLE_KEY([^A-Z0-9_]|$)/m.test(workflow.replaceAll("VIDEO_SUPABASE_SERVICE_ROLE_KEY", ""))) {
    failures.push(`${label} workflow accepteert nog generieke SUPABASE_SERVICE_ROLE_KEY als mediafallback`);
  }
}

if (failures.length) {
  console.error("Environment contract: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Environment contract: PASS (Vercel target env is runtime SoT; new presenter media uses media-edge signing; legacy video-url secret remains explicitly isolated; no hardcoded Supabase runtime credentials/URLs)");
