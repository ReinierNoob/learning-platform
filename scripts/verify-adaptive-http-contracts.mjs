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

const routeProbes = {
  1: {
    B: { "m1-diag-01": "Business-architect", "m1-diag-02": "Ik laat dit bij het team zolang er geen bredere architectuurimpact is", "m1-diag-03": "Ik werk de consequenties uit en leg onaanvaardbare knelpunten terug", "m1-diag-04": "Projectresultaat op korte termijn versus landschapskwaliteit op langere termijn" },
    C: { "m1-diag-01": "Solution architect", "m1-diag-02": "Ik laat dit bij het team zolang er geen bredere architectuurimpact is", "m1-diag-03": "Ik werk de consequenties uit en leg onaanvaardbare knelpunten terug", "m1-diag-04": "Projectresultaat op korte termijn versus landschapskwaliteit op langere termijn" },
  },
  2: {
    B: { "m2-diag-01": "De vooraf gekozen oplossing", "m2-diag-02": "Wat betekent 'volledig' — alleen indiening of ook andere stappen en kanalen?", "m2-diag-03": "Als openstaand punt vastleggen en terugleggen bij de opdrachtgever", "m2-diag-04": "Het onderliggende doel kan werklastvermindering zijn; digitalisering is mogelijk het middel" },
    C: { "m2-diag-01": "De vooraf gekozen oplossing", "m2-diag-02": "Wat betekent 'volledig' — alleen indiening of ook andere stappen en kanalen?", "m2-diag-03": "Buiten scope zetten en vergeten", "m2-diag-04": "Het onderliggende doel kan werklastvermindering zijn; digitalisering is mogelijk het middel" },
  },
  3: {
    B: { "m3-diag-01": "De burger die namens een ander een aanvraag indient", "m3-diag-02": "Een volledige aanvraag levert binnen tien werkdagen een besluit op", "m3-diag-03": "Een reëel belangenconflict dat expliciete besluitvorming vraagt", "m3-diag-04": "Consequenties en opties voorleggen aan degene die de belangen mag prioriteren" },
    C: { "m3-diag-01": "De burger die namens een ander een aanvraag indient", "m3-diag-02": "Een volledige aanvraag levert binnen tien werkdagen een besluit op", "m3-diag-03": "Een reëel belangenconflict dat expliciete besluitvorming vraagt", "m3-diag-04": "Zelf de beste eis kiezen" },
  },
  4: {
    B: { "m4-diag-01": "Security / confidentiality", "m4-diag-02": "Een norm, meetwijze en relevante omstandigheden", "m4-diag-03": "99% beschikbaar per maand", "m4-diag-04": "Een spanning tussen interaction capability en security" },
    C: { "m4-diag-01": "Security / confidentiality", "m4-diag-02": "Een norm, meetwijze en relevante omstandigheden", "m4-diag-03": "99% beschikbaar per maand", "m4-diag-04": "Alleen een securityprobleem" },
  },
  5: {
    B: { "m5-diag-01": "System context", "m5-diag-02": "Systeem/containerinteracties", "m5-diag-03": "Een stakeholdergerichte view maken vanuit een passend viewpoint", "m5-diag-04": "Onduidelijk omdat de pijlen geen betekenis hebben" },
    C: { "m5-diag-01": "Component", "m5-diag-02": "Systeem/containerinteracties", "m5-diag-03": "Een stakeholdergerichte view maken vanuit een passend viewpoint", "m5-diag-04": "Onduidelijk omdat de pijlen geen betekenis hebben" },
  },
  6: {
    B: { "m6-diag-01": "Privacy en vertrouwelijkheid", "m6-diag-02": "Geen echte trade-off wanneer één optie objectief beter is", "m6-diag-03": "De nadelen ontbreken en de ADR is onvolledig", "m6-diag-04": "De afweging hoort vooraf, voor de bouw" },
    C: { "m6-diag-01": "Privacy en vertrouwelijkheid", "m6-diag-02": "Trade-off is een fout", "m6-diag-03": "De nadelen ontbreken en de ADR is onvolledig", "m6-diag-04": "De afweging hoort vooraf, voor de bouw" },
  },
  7: {
    B: { "m7-diag-01": "De verzender bepaalt wanneer relevante informatie wordt aangeboden", "m7-diag-02": "Pas als ook betekenis, eigenaarschap, wijziging en foutafhandeling zijn afgesproken", "m7-diag-03": "Een gebeurtenis per uitslag met bevestiging en logging", "m7-diag-04": "Omdat de bestaande koppeling een andere belofte kan hebben en oprekken bestaande afnemers kan raken" },
    C: { "m7-diag-01": "De verzender bepaalt wanneer relevante informatie wordt aangeboden", "m7-diag-02": "Zodra er HTTP 200 terugkomt", "m7-diag-03": "Een gebeurtenis per uitslag met bevestiging en logging", "m7-diag-04": "Omdat de bestaande koppeling een andere belofte kan hebben en oprekken bestaande afnemers kan raken" },
  },
  8: {
    B: { "m8-diag-01": "Een principe geeft richting bij afwegingen; een regel schrijft een uitkomst voor", "m8-diag-02": "Gegevens worden opgeslagen bij de bronhouder, tenzij aantoonbaar onwerkbaar", "m8-diag-03": "Het bezwaar is niet gekoppeld aan een principe, eis of ander toetsbaar kader", "m8-diag-04": "Onderbouwing, consequenties en voorwaarden van de afwijking beoordelen en vastleggen", "m8-diag-05": "De kwaliteit van ontwerp en onderbouwing toetsen aan expliciete eisen en principes" },
    C: { "m8-diag-01": "Een principe geeft richting bij afwegingen; een regel schrijft een uitkomst voor", "m8-diag-02": "Gegevens worden opgeslagen bij de bronhouder, tenzij aantoonbaar onwerkbaar", "m8-diag-03": "Het bezwaar is niet gekoppeld aan een principe, eis of ander toetsbaar kader", "m8-diag-04": "Automatisch afkeuren", "m8-diag-05": "De kwaliteit van ontwerp en onderbouwing toetsen aan expliciete eisen en principes" },
  },
  9: {
    B: { "m9-diag-01": "Dat de stap zelfstandig waarde levert en een stabiele basis voor vervolg vormt", "m9-diag-02": "Omdat je zonder vastgestelde identiteit niet verantwoord kunt bepalen wiens status je toont", "m9-diag-03": "Wanneer de tijdelijke extra kosten lager zijn dan de potentiële schade van een mislukte overgang", "m9-diag-04": "Dat criteria en herstelpad vooraf zijn bepaald zodat een mislukte overgang beheerst kan worden teruggedraaid" },
    C: { "m9-diag-01": "Dat de stap zelfstandig waarde levert en een stabiele basis voor vervolg vormt", "m9-diag-02": "Omdat je zonder vastgestelde identiteit niet verantwoord kunt bepalen wiens status je toont", "m9-diag-03": "Wanneer de tijdelijke extra kosten lager zijn dan de potentiële schade van een mislukte overgang", "m9-diag-04": "Dat het team weinig vertrouwen heeft" },
  },
};

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
  check(Array.isArray(assessment.body?.remediationSequence) && assessment.body.remediationSequence.length > 0, `Module ${moduleNumber}/assess: remediationSequence ontbreekt of is leeg`);
  check(assessment.body?.passed === false && assessment.body?.correct === 0, `Module ${moduleNumber}/assess: foutantwoord-grading wijkt af`);
  check(assessment.body?.persistence === "preview-session-only", `Module ${moduleNumber}/assess: persistence-disabled contract wijkt af`);
  check(assessment.body?.platformProgress?.status === "not_requested", `Module ${moduleNumber}/assess: platformprogress fail-closed/not-requested contract wijkt af`);
}

if (!productionDeny) {
  for (const moduleNumber of modules) {
    for (const expectedRoute of ["B", "C"]) {
      const diagnosis = await request(moduleNumber, "diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: routeProbes[moduleNumber][expectedRoute] }),
      });
      check(diagnosis.response.status === 200, `Module ${moduleNumber}/diagnose ${expectedRoute}: verwacht 200, kreeg ${diagnosis.response.status}`);
      check(diagnosis.body?.route === expectedRoute, `Module ${moduleNumber}/diagnose: verwacht route ${expectedRoute}, kreeg ${diagnosis.body?.route}`);
      if (expectedRoute === "C") {
        check(diagnosis.body?.reasonCode === "ACTIVE_MISCONCEPTION", `Module ${moduleNumber}/diagnose C: reasonCode wijkt af`);
        check(Array.isArray(diagnosis.body?.misconceptions) && diagnosis.body.misconceptions.length > 0, `Module ${moduleNumber}/diagnose C: misconceptiondetectie ontbreekt`);
      }
    }
  }

  const supportedObservation = await request(2, "observe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      interventionId: "m2-scope-practice-v1",
      answer: "Eerst maak ik de scope van volledig expliciet: indiening, overige stappen en kanalen, vóórdat ik een oplossing ontwerp.",
    }),
  });
  check(supportedObservation.response.status === 200, `Tutor-observation: verwacht 200, kreeg ${supportedObservation.response.status}`);
  check(supportedObservation.body?.level === "strong" && supportedObservation.body?.canProceed === true, "Tutor-observation: strong/canProceed contract wijkt af");

  const module1PassAnswers = {
    "m1-assess-01": 0, "m1-assess-02": 2, "m1-assess-03": 1,
    "m1-assess-04": 1, "m1-assess-05": 1, "m1-assess-06": 1,
  };
  const module1Pass = await request(1, "assess", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ answers: module1PassAnswers, syncPlatformProgress: false }),
  });
  check(module1Pass.body?.passed === true && module1Pass.body?.correct === module1Pass.body?.total, "Module 1 assessment-pass grading wijkt af");
  check(Array.isArray(module1Pass.body?.remediationSequence) && module1Pass.body.remediationSequence.length === 0, "Module 1 assessment-pass bevat onverwachte remediation");

  const module6PassAnswers = { "m6-assess-01": 1, "m6-assess-02": 1, "m6-assess-03": 1 };
  const module6Pass = await request(6, "assess", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ answers: module6PassAnswers, syncPlatformProgress: false }),
  });
  check(module6Pass.body?.passed === true && module6Pass.body?.correct === module6Pass.body?.total, "Module 6 assessment-pass grading wijkt af");
  check(Array.isArray(module6Pass.body?.remediationSequence) && module6Pass.body.remediationSequence.length === 0, "Module 6 assessment-pass bevat onverwachte remediation");

  const module5Legacy = await request(5, "diagnose", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: {} }),
  });
  check(module5Legacy.body?.mastery && !Object.prototype.hasOwnProperty.call(module5Legacy.body ?? {}, "conceptMastery"), "Module 5 diagnose: legacy mastery response contract niet behouden");

  const module6Legacy = await request(6, "diagnose", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: {} }),
  });
  check(module6Legacy.body?.profile?.module === 6, "Module 6 diagnose: legacy profile.module ontbreekt");
  check(Array.isArray(module6Legacy.body?.profile?.routeHistory) && module6Legacy.body.profile.routeHistory.length === 1, "Module 6 diagnose: legacy routeHistory ontbreekt");
  check(!Object.prototype.hasOwnProperty.call(module6Legacy.body ?? {}, "conceptMastery"), "Module 6 diagnose: nieuw top-level conceptMastery lekt in legacy contract");
}

if (failures.length > 0) {
  console.error(`Adaptive HTTP contracts: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(productionDeny
  ? `Adaptive HTTP production deny: PASS (${modules.length * 5} endpoint checks)`
  : `Adaptive HTTP contracts: PASS (${modules.length} modules, routes A/B/C, misconceptions, observation, assessment pass/remediation, legacy response compatibility)`);
