import { readdirSync } from "node:fs";

const baseUrl = process.env.EAW_ADAPTIVE_BASE_URL ?? "http://127.0.0.1:3000";
const productionDeny = process.env.EAW_ADAPTIVE_EXPECT_PRODUCTION_DENY === "1";
const labRoot = "app/lab";
const modules = readdirSync(labRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^solution-architecture-module-\d+$/.test(entry.name))
  .map((entry) => Number(entry.name.match(/\d+$/)?.[0]))
  .filter(Number.isInteger)
  .sort((a, b) => a - b);

const failures = [];

for (const moduleNumber of modules) {
  const response = await fetch(`${baseUrl}/lab/solution-architecture-module-${moduleNumber}`, {
    redirect: "manual",
  });

  if (productionDeny) {
    if (response.status !== 404) {
      failures.push(`Module ${moduleNumber} QA-lab: production verwacht 404, kreeg ${response.status}`);
    }
    continue;
  }

  if (response.status !== 200) {
    failures.push(`Module ${moduleNumber} QA-lab: preview verwacht 200, kreeg ${response.status}`);
    continue;
  }

  const html = await response.text();
  if (!html.includes("Solution Architecture") || !html.includes(`Module ${moduleNumber}`)) {
    failures.push(`Module ${moduleNumber} QA-lab: verwachte leerervaring ontbreekt in server-rendered HTML`);
  }
}

if (failures.length > 0) {
  console.error(`Adaptive QA lab HTTP: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(productionDeny
  ? `Adaptive QA lab production deny: PASS (${modules.length} lab routes)`
  : `Adaptive QA lab HTTP: PASS (${modules.length} server-rendered lab routes)`);
