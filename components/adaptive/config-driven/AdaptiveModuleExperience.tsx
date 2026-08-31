"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { AdaptiveModuleDefinition, AdaptiveRouteId } from "../../../lib/adaptive-module-definition";
import styles from "./adaptive-experience.module.css";

type Diagnosis = {
  route: AdaptiveRouteId;
  reasonCode: string;
  sequence: string[];
  evidence: { id: string; objectiveId: string; passed: boolean }[];
  misconceptions: string[];
};

type AssessmentResult = {
  correct: number;
  total: number;
  passed: boolean;
  remediationSequence: string[];
  platformProgress?: { status: string; completionPercentage: number | null };
};

type TutorObservation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
};

type Props = {
  definition: AdaptiveModuleDefinition;
  apiBase: string;
  caseIntro: string;
  courseHref?: string;
  renderVisual?: (visualMode: string | undefined) => ReactNode;
};

const routeCopy: Record<AdaptiveRouteId, { name: string; description: string }> = {
  A: { name: "Uitgebreide route", description: "We bouwen de kern stap voor stap op en controleren tussendoor je begrip." },
  B: { name: "Verkorte route", description: "Je beheerst de basis al; we gaan sneller naar toepassen en beoordelen." },
  C: { name: "Focusroute", description: "Je hebt relevante basiskennis, maar een paar denkpatronen verdienen gerichte aandacht." },
};

export default function AdaptiveModuleExperience({ definition, apiBase, caseIntro, courseHref, renderVisual }: Props) {
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [routeOverride, setRouteOverride] = useState<AdaptiveRouteId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [promptResponses, setPromptResponses] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState<Record<string, TutorObservation>>({});
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRoute = routeOverride ?? diagnosis?.route ?? null;
  const sequence = useMemo(() => activeRoute ? [...definition.routes[activeRoute]] : [], [activeRoute, definition.routes]);
  const activeId = sequence[Math.min(stepIndex, Math.max(0, sequence.length - 1))];
  const intervention = activeId ? definition.interventions[activeId] : null;

  async function diagnose(nextAnswers = answers) {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBase}/diagnose`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: nextAnswers }) });
      if (!response.ok) throw new Error("diagnose_failed");
      setDiagnosis(await response.json() as Diagnosis);
      setRouteOverride(null); setStepIndex(0); setAssessment(null); setAssessmentAnswers({}); setObservations({}); setPromptResponses({});
    } catch { setError("De leerroute kon niet worden bepaald. Probeer het opnieuw."); }
    finally { setBusy(false); }
  }

  async function chooseRoute(route: AdaptiveRouteId | null) {
    if (!diagnosis) return;
    const target = route ?? diagnosis.route;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBase}/override`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ route: target }) });
      if (!response.ok) throw new Error("override_failed");
      setRouteOverride(route); setStepIndex(0); setAssessment(null); setAssessmentAnswers({}); setObservations({}); setPromptResponses({});
    } catch { setError("De gekozen leerroute kon niet worden vastgelegd."); }
    finally { setBusy(false); }
  }

  async function observe(interventionId: string) {
    const answer = promptResponses[interventionId]?.trim();
    if (!answer) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBase}/observe`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ interventionId, answer }) });
      if (!response.ok) throw new Error("observe_failed");
      setObservations((current) => ({ ...current, [interventionId]: await response.json() as TutorObservation }));
    } catch { setError("Je redenering kon niet worden beoordeeld. Probeer het opnieuw."); }
    finally { setBusy(false); }
  }

  async function assess() {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBase}/assess`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: assessmentAnswers, syncPlatformProgress: Boolean(courseHref) }) });
      if (!response.ok) throw new Error("assessment_failed");
      setAssessment(await response.json() as AssessmentResult);
    } catch { setError("De eindcheck kon niet worden beoordeeld. Probeer het opnieuw."); }
    finally { setBusy(false); }
  }

  if (!diagnosis) {
    const question = definition.diagnostics[diagnosticIndex];
    const finalQuestion = diagnosticIndex === definition.diagnostics.length - 1;
    const value = answers[question.id] ?? "";
    const progress = Math.round(((diagnosticIndex + 1) / definition.diagnostics.length) * 100);
    return <main className={styles.shell}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Solution Architecture · Module {definition.sourceModuleId}</p>
        <h1>{definition.title}</h1>
        <p>Eva stelt een paar korte vragen. Daarna krijg je een route die aansluit op wat je al beheerst.</p>
        <p className={styles.caseIntro}><strong>De casus:</strong> {caseIntro}</p>
      </section>
      <section className={styles.card} aria-labelledby="adaptive-eva-heading">
        <div className={styles.persona}><span aria-hidden="true">E</span><div><small>Interviewer</small><strong id="adaptive-eva-heading">Eva</strong></div></div>
        <div className={styles.progressText}>Vraag {diagnosticIndex + 1} van {definition.diagnostics.length} · {progress}%</div>
        <h2>{question.prompt}</h2>
        {question.kind === "single_choice" ? <fieldset className={styles.choices}>
          <legend className="sr-only">Kies één antwoord</legend>
          {question.options?.map((option) => <label key={option} className={styles.choice}><input type="radio" name={question.id} value={option} checked={value === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} /><span>{option}</span></label>)}
        </fieldset> : <textarea className={styles.textarea} rows={5} maxLength={1000} value={value} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Leg kort uit wat je ziet. Je hoeft het nog niet zeker te weten." />}
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} disabled={diagnosticIndex === 0 || busy} onClick={() => setDiagnosticIndex((current) => Math.max(0, current - 1))}>Vorige</button>
          <button type="button" className={styles.secondary} disabled={busy} onClick={() => {
            const next = { ...answers, [question.id]: "Ik weet dit nog niet." }; setAnswers(next);
            if (finalQuestion) void diagnose(next); else setDiagnosticIndex((current) => current + 1);
          }}>Ik weet dit nog niet</button>
          {finalQuestion ? <button type="button" className={styles.primary} disabled={!value.trim() || busy} onClick={() => void diagnose()}>{busy ? "Route bepalen…" : "Bepaal mijn route"}</button> : <button type="button" className={styles.primary} disabled={!value.trim()} onClick={() => setDiagnosticIndex((current) => current + 1)}>Volgende</button>}
        </div>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
      </section>
    </main>;
  }

  if (!activeRoute || !intervention) return null;
  const observation = observations[intervention.id];
  const hasPrompt = Boolean(intervention.prompt);
  const canProceed = !hasPrompt || observation?.canProceed === true;
  const last = stepIndex === sequence.length - 1;

  return <main className={styles.shell}>
    <section className={styles.routeHeader}>
      <div><p className={styles.kicker}>Module {definition.sourceModuleId} · {routeCopy[activeRoute].name}</p><h1>{definition.title}</h1><p>{routeCopy[activeRoute].description}</p></div>
      <div className={styles.routeActions}>
        {activeRoute !== "A" ? <button className={styles.secondary} type="button" disabled={busy} onClick={() => void chooseRoute("A")}>Toon volledige uitleg</button> : null}
        {routeOverride ? <button className={styles.secondary} type="button" disabled={busy} onClick={() => void chooseRoute(null)}>Terug naar aanbevolen route</button> : null}
      </div>
    </section>

    <div className={styles.learningGrid}>
      <section className={styles.card}>
        <div className={styles.persona}><span aria-hidden="true">{intervention.speaker === "interviewer" ? "E" : "A"}</span><div><small>{intervention.speaker === "interviewer" ? "Interviewer" : "Tutor"}</small><strong>{intervention.speaker === "interviewer" ? "Eva" : "Alexander"}</strong></div></div>
        <p className={styles.kicker}>{intervention.kind === "assessment" ? "Eindcheck" : `Stap ${stepIndex + 1} van ${sequence.length}`}</p>
        <h2>{intervention.title}</h2>
        <p>{intervention.body}</p>
        {renderVisual?.(intervention.visualMode)}

        {intervention.prompt ? <div className={styles.promptBox}>
          <label><strong>{intervention.prompt}</strong><textarea className={styles.textarea} rows={5} value={promptResponses[intervention.id] ?? ""} onChange={(event) => { const value = event.target.value; setPromptResponses((current) => ({ ...current, [intervention.id]: value })); setObservations((current) => { const next = { ...current }; delete next[intervention.id]; return next; }); }} /></label>
          <button className={styles.primary} disabled={busy || !(promptResponses[intervention.id]?.trim())} type="button" onClick={() => void observe(intervention.id)}>Laat mijn redenering beoordelen</button>
          {observation ? <div className={styles.feedback} role="status"><strong>{observation.level === "strong" ? "Dit is voldoende onderbouwd." : "Nog één stap scherper."}</strong><p>{observation.feedback}</p>{observation.followUp ? <p><strong>Vervolgvraag:</strong> {observation.followUp}</p> : null}</div> : null}
        </div> : null}

        {intervention.kind === "assessment" ? <div className={styles.assessment}>
          {definition.assessment.map((question, index) => <fieldset key={question.id} className={styles.assessmentQuestion}><legend>{index + 1}. {question.question}</legend>{question.options.map((option, optionIndex) => <label key={option} className={styles.choice}><input type="radio" name={question.id} checked={assessmentAnswers[question.id] === optionIndex} onChange={() => setAssessmentAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span>{option}</span></label>)}</fieldset>)}
          <button className={styles.primary} type="button" disabled={busy || Object.keys(assessmentAnswers).length !== definition.assessment.length} onClick={() => void assess()}>{busy ? "Beoordelen…" : "Beoordeel mijn eindcheck"}</button>
          {assessment ? <div className={assessment.passed ? styles.success : styles.feedback} role="status"><strong>{assessment.passed ? "Modulecheck afgerond" : `${assessment.correct} van ${assessment.total} goed`}</strong><p>{assessment.passed ? "Je hebt de verplichte leerdoelen aangetoond." : "Je krijgt alleen de onderdelen terug die nog aandacht vragen."}</p>{assessment.passed && courseHref ? <a className={styles.primaryLink} href={courseHref}>Terug naar de training</a> : null}</div> : null}
        </div> : null}

        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.actions}><button className={styles.secondary} type="button" disabled={stepIndex === 0 || busy} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>Vorige</button>{!last ? <button className={styles.primary} type="button" disabled={!canProceed || busy} onClick={() => setStepIndex((current) => Math.min(sequence.length - 1, current + 1))}>Volgende</button> : null}</div>
      </section>
    </div>
  </main>;
}
