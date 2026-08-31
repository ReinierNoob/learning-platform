import "server-only";

import type { AdaptiveRouteId } from "./adaptive-module-definition";
import { solutionArchitectureModule4 } from "./solution-architecture-module-4";

export const module4ClassifierVersion = "module4-classifier-v1.1";
export const module4AssessmentVersion = "module4-assessment-v1";
export const module4OrchestratorVersion = "adaptive-orchestrator-v2.16";

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLocaleLowerCase("nl-NL").trim() : "";
}

function hasMeasureAndContext(text: string) {
  const hasNumber = /\d/.test(text);
  const hasUnit = /%|procent|seconde|minuut|uur|milliseconde|ms\b|per maand|per dag|gelijktijdige|requests?|aanvragen?/.test(text);
  const hasContext = /tijdens|bij |wanneer|onder |per |gelijktijdige|dienstperiode|kantooruren|piek|maand/.test(text);
  return hasNumber && hasUnit && hasContext;
}

export function diagnoseModule4(answers: Record<string, string>) {
  const q1 = normalize(answers["m4-diag-01"]);
  const q2 = normalize(answers["m4-diag-02"]);
  const q3 = normalize(answers["m4-diag-03"]);
  const q4 = normalize(answers["m4-diag-04"]);

  const evidence = [
    { id: "ev-m4-diag-01", objectiveId: "sa.m04.attributen-herkennen", passed: q1 === "security / confidentiality" },
    { id: "ev-m4-diag-02", objectiveId: "sa.m04.meetbaar-maken", passed: q2 === "een norm, meetwijze en relevante omstandigheden" },
    { id: "ev-m4-diag-03", objectiveId: "sa.m04.meetbaar-maken", passed: hasMeasureAndContext(q3) },
    { id: "ev-m4-diag-04", objectiveId: "sa.m04.spanning-analyseren", passed: q4 === "een spanning tussen interaction capability en security" },
  ];

  const misconceptions: string[] = [];
  if (q2 === "een technisch ontwerp" || q2 === "een architectuurdiagram") {
    misconceptions.push("sa.mc.kwaliteitsattribuut-is-oplossing");
  }
  if (q3 && /\d/.test(q3) && !hasMeasureAndContext(q3)) {
    misconceptions.push("sa.mc.getal-zonder-context-is-toetsbaar");
  }
  if (q4 === "alleen een securityprobleem" || q4 === "alleen een usabilityprobleem") {
    misconceptions.push("sa.mc.een-attribuut-altijd-dominant");
  }

  const passedCount = evidence.filter((item) => item.passed).length;
  let route: AdaptiveRouteId = "A";
  let reasonCode = "NO_PRIOR_EVIDENCE";
  if (misconceptions.length > 0 && passedCount >= 2) {
    route = "C";
    reasonCode = "ACTIVE_MISCONCEPTION";
  } else if (passedCount >= 3 && misconceptions.length === 0) {
    route = "B";
    reasonCode = "DEMONSTRATED_WITH_CHECK";
  }

  const conceptMastery: Record<string, string> = {
    "sa.m04.attributen-herkennen": evidence[0].passed ? "demonstrated" : "uncertain",
    "sa.m04.meetbaar-maken": evidence[1].passed && evidence[2].passed ? "demonstrated" : "uncertain",
    "sa.m04.spanning-analyseren": evidence[3].passed ? "demonstrated" : "uncertain",
    "sa.m04.context-prioriteren": "uncertain",
  };

  return {
    route,
    reasonCode,
    sequence: [...solutionArchitectureModule4.routes[route]],
    evidence,
    misconceptions,
    conceptMastery,
  };
}

type Observation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

export function observeModule4Reasoning(interventionId: string, rawAnswer: unknown): Observation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m4-meetbaar-practice-v1") {
    const number = /\d/.test(answer);
    const unit = /%|procent|seconde|minuut|uur|milliseconde|ms\b|gelijktijdige|requests?|aanvragen?/.test(answer);
    const context = /tijdens|bij |wanneer|onder |per |dienstperiode|kantooruren|piek|maand/.test(answer);
    const indicators = [number ? "numeric_threshold" : "", unit ? "measure_unit" : "", context ? "measurement_context" : ""].filter(Boolean);
    if (number && unit && context) return { level: "strong", canProceed: true, feedback: "Je formulering bevat een grens, een meetbare maat en omstandigheden waaronder de norm geldt.", followUp: null, indicators };
    if ((number && unit) || (number && context)) return { level: "partial", canProceed: false, feedback: "Je hebt al een normelement, maar nog niet duidelijk genoeg wanneer of hoe die norm wordt gemeten.", followUp: "Voeg de ontbrekende meetcontext of maat toe.", indicators };
    return { level: "needs_work", canProceed: false, feedback: "De formulering is nog vooral kwalitatief. Maak zichtbaar waaraan je straks objectief kunt zien of Middelveen voldoet.", followUp: "Welke concrete grenswaarde, maat en gebruikssituatie horen erbij?", indicators };
  }

  if (interventionId === "m4-tension-practice-v1") {
    const interaction = /gebruik|frict|gemak|interactie|inlog|onderbrek|user|burger/.test(answer);
    const security = /security|beveilig|misbruik|sessie|toegang|vertrouw|risico/.test(answer);
    const tension = /maar|terwijl|ten koste|nadeel|spanning|afweging|trade.?off|daartegenover/.test(answer);
    const indicators = [interaction ? "interaction_capability" : "", security ? "security" : "", tension ? "explicit_tension" : ""].filter(Boolean);
    if (interaction && security && tension) return { level: "strong", canProceed: true, feedback: "Je benoemt beide kwaliteitskanten én de spanning ertussen.", followUp: null, indicators };
    if (interaction && security) return { level: "partial", canProceed: false, feedback: "Je noemt beide kwaliteitsgebieden, maar de winst en het verlies zijn nog niet expliciet tegenover elkaar gezet.", followUp: "Wat wint de burger en welk risico neemt Middelveen daarvoor extra?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Je antwoord maakt nog niet zichtbaar welke twee kwaliteitskenmerken hier tegenover elkaar staan.", followUp: "Denk aan gebruiksgemak/interactie aan de ene kant en beveiligingsrisico aan de andere.", indicators };
  }

  if (interventionId === "m4-prioriteit-practice-v1") {
    const count = (answer.match(/,| en |;|\n/g) ?? []).length >= 2;
    const context = /omdat|vanwege|risico|burger|keurings|gegevens|status|koppeling|dienstverlening|stakeholder|doel/.test(answer);
    const qualityWords = /security|vertrouw|beschikbaar|reliab|performance|snel|onderhoud|maintain|interaction|flexib|compatib|safety|veilig/.test(answer);
    const indicators = [count ? "multiple_priorities" : "", context ? "context_reasoning" : "", qualityWords ? "quality_language" : ""].filter(Boolean);
    if (count && context && qualityWords) return { level: "strong", canProceed: true, feedback: "Je kiest meerdere relevante kwaliteitskenmerken en koppelt ze aan de casus in plaats van aan persoonlijke voorkeur.", followUp: null, indicators };
    if (qualityWords && context) return { level: "partial", canProceed: false, feedback: "De redenering is contextgebonden, maar maak je top drie en de reden per keuze explicieter.", followUp: "Welke drie staan bovenaan, en welk concreet casusrisico of doel motiveert elk kenmerk?", indicators };
    return { level: "needs_work", canProceed: false, feedback: "Een prioriteit is pas bruikbaar als duidelijk is waarom dit kwaliteitskenmerk juist in deze context ontwerpsturend is.", followUp: "Koppel je keuzes aan gevoelige gegevens, online statusinzage of afhankelijkheden in het landschap.", indicators };
  }

  if (interventionId === "m4-adjectief-repair-v1") {
    const measure = /norm|grens|percentage|meten|meetwijze|wanneer|periode|tijd|beschikbaar/.test(answer);
    return measure
      ? { level: "strong", canProceed: true, feedback: "Juist: er ontbreken meetcriteria en omstandigheden waarmee je kunt vaststellen of 'betrouwbaar' is gerealiseerd.", followUp: null, indicators: ["measurement_gap"] }
      : { level: "needs_work", canProceed: false, feedback: "Zoek niet naar een oplossing, maar naar wat je nodig hebt om objectief te kunnen toetsen.", followUp: "Welke norm, meetwijze en meetcontext ontbreken?", indicators: [] };
  }

  if (interventionId === "m4-maximaliseren-repair-v1") {
    const priority = /priorit|context|keuze|afweging|spanning|trade.?off|kosten|risico|doel|randvoorwaarde/.test(answer);
    return priority
      ? { level: "strong", canProceed: true, feedback: "Juist: een absolute prioriteit is alleen bruikbaar wanneer de context of eis duidelijk maakt waarom die hard is; anders heb je expliciete afweging en prioritering nodig.", followUp: null, indicators: ["priority_reasoning"] }
      : { level: "partial", canProceed: false, feedback: "Je benoemt nog niet waarom absolute kwaliteitsprioriteit zonder context onvoldoende ontwerpsturing geeft.", followUp: "Wat gebeurt er wanneer twee kwaliteitskenmerken in een concreet ontwerp botsen?", indicators: [] };
  }

  return null;
}

export const module4AnswerKey: Record<string, number> = {
  "m4-assess-01": 1,
  "m4-assess-02": 2,
  "m4-assess-03": 1,
  "m4-assess-04": 2,
  "m4-assess-05": 3,
};

export const module4RemediationByQuestion: Record<string, string[]> = {
  "m4-assess-01": ["m4-kwaliteit-vs-functie-standard-v1", "m4-iso25010-standard-v1"],
  "m4-assess-02": ["m4-meetbaar-standard-v1", "m4-meetbaar-practice-v1"],
  "m4-assess-03": ["m4-iso25010-standard-v1"],
  "m4-assess-04": ["m4-spanning-standard-v1", "m4-tension-practice-v1"],
  "m4-assess-05": ["m4-prioriteren-standard-v1", "m4-prioriteit-practice-v1"],
};
