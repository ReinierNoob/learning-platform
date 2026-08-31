const baseUrl = process.env.EAW_ADAPTIVE_BASE_URL ?? "http://127.0.0.1:3000";
const productionDeny = process.env.EAW_ADAPTIVE_EXPECT_PRODUCTION_DENY === "1";
const modules = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const failures = [];

async function request(moduleNumber, endpoint, init) {
  const response = await fetch(`${baseUrl}/api/adaptive/solution-architecture-module-${moduleNumber}/${endpoint}`, init);
  let body = null;
  try { body = await response.json(); } catch { /* 404 hard deny has no JSON body */ }
  return { response, body };
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

for (const moduleNumber of modules) {
  if (productionDeny) {
    for (const [endpoint, method] of [["diagnose", "POST"], ["observe", "POST"], ["override", "POST"], ["state", "GET"], ["assess", "POST"]]) {
      const { response } = await request(moduleNumber, endpoint, method === "GET" ? undefined : {
        method,
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      check(response.status === 404, `Module ${moduleNumber}/${endpoint}: production hard deny verwacht 404, kreeg ${response.status}`);
    }
    continue;
  }

  const diagnose = await request(moduleNumber, "diagnose", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ answers: {} }),
  });
  check(diagnose.response.status === 200, `Module ${moduleNumber}/diagnose: verwacht 200, kreeg ${diagnose.response.status}`);
  check(["A", "B", "C"].includes(diagnose.body?.route), `Module ${moduleNumber}/diagnose: ongeldige route`);
  check(Array.isArray(diagnose.body?.sequence), `Module ${moduleNumber}/diagnose: sequence ontbreekt`);
  check(Array.isArray(diagnose.body?.evidence), `Module ${moduleNumber}/diagnose: evidence ontbreekt`);
  check(Array.isArray(diagnose.body?.misconceptions), `Module ${moduleNumber}/diagnose: misconceptions ontbreekt`);
  check(diagnose.body?.profile?.persistence === "preview-session-only", `Module ${moduleNumber}/diagnose: persistence-disabled contract wijkt af`);

  const state = await request(moduleNumber, "state");
  check(state.response.status === 200, `Module ${moduleNumber}/state: verwacht 200, kreeg ${state.response.status}`);
  check(state.body?.enabled === false && state.body?.state === null, `Module ${moduleNumber}/state: persistence-disabled restore contract wijkt af`);

  const override = await request(moduleNumber, "override", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ route: "A" }),
  });
  check(override.response.status === 200, `Module ${moduleNumber}/override: verwacht 200, kreeg ${override.response.status}`);
  check(override.body?.route === "A" && override.body?.persistence === "preview-session-only", `Module ${moduleNumber}/override: response shape wijkt af`);

  const invalidOverride = await request(moduleNumber, "override", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ route: "Z" }),
  });
  check(invalidOverride.response.status === 400 && invalidOverride.body?.error === "invalid_route", `Module ${moduleNumber}/override: invalid-route contract wijkt af`);

  const unsupportedObservation = await request(moduleNumber, "observe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ interventionId: "__contract_probe__", answer: "probe" }),
  });
  check(unsupportedObservation.response.status === 400 && unsupportedObservation.body?.error === "observation_not_supported", `Module ${moduleNumber}/observe: unsupported-observation contract wijkt af`);

  const assessment = await request(moduleNumber, "assess", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ answers: {}, syncPlatformProgress: false }),
  });
  check(assessment.response.status === 200, `Module ${moduleNumber}/assess: verwacht 200, kreeg ${assessment.response.status}`);
  check(Number.isInteger(assessment.body?.total) && assessment.body.total > 0, `Module ${moduleNumber}/assess: total ontbreekt of is leeg`);
  check(Array.isArray(assessment.body?.results) && assessment.body.results.length === assessment.body?.total, `Module ${moduleNumber}/assess: results shape wijkt af`);
  check(Array.isArray(assessment.body?.remediationSequence), `Module ${moduleNumber}/assess: remediationSequence ontbreekt`);
  check(assessment.body?.persistence === "preview-session-only", `Module ${moduleNumber}/assess: persistence-disabled contract wijkt af`);
  check(assessment.body?.platformProgress?.status === "not_requested", `Module ${moduleNumber}/assess: platformprogress fail-closed/not-requested contract wijkt af`);
}

if (failures.length > 0) {
  console.error(`Adaptive HTTP contracts: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(productionDeny
  ? `Adaptive HTTP production deny: PASS (${modules.length * 5} endpoint checks)`
  : `Adaptive HTTP contracts: PASS (${modules.length} modules)`);
