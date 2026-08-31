"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  platformProgress?: {
    status: "not_requested" | "not_passed" | "synced" | "not_configured" | "contract_mismatch" | "failed" | string;
    completionPercentage: number | null;
    score?: number | null;
  };
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
  const [customSequence, setCustomSequence] = useState<string[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [promptResponses, setPromptResponses] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState<Record<string, TutorObservation>>({});
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLElement | null>(null);
  const focusAfterTransitionRef = useRef(false);

  const activeRoute = routeOverride ?? diagnosis?.route ?? null;
  const routeSequence = useMemo(() => activeRoute ? [...definition.routes[activeRoute]] : [], [activeRoute, definition.routes]);
  const sequence = customSequence ?? routeSequence;
  const activeId = sequence[Math.min(stepIndex, Math.max(0, sequence.length - 1))];
  const intervention = activeId ? definition.interventions[activeId] : null;
  const assessmentStepId = useMemo(() => Object.values(definition.interventions).find((item) => item.kind === "assessment")?.id ?? null, [definition.interventions]);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const response = await fetch(`${apiBase}/state`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as { state?: Diagnosis | null };
        if (active && payload.state?.route) {
          setDiagnosis(payload.state);
          setStepIndex(0);
        }
      } catch {
        // Session-only mode and unavailable persistence are both safe fallbacks.
      } finally {
        if (active) setRestoring(false);
      }
    }
    void restore();
    return () => { active = false; };
  }, [apiBase]);

  useEffect(() => {
    if (!focusAfterTransitionRef.current) return;
    focusAfterTransitionRef.current = false;
    const frame = requestAnimationFrame(() => stepHeadingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [diagnosticIndex, diagnosis, routeOverride, customSequence, stepIndex]);

  function requestStepFocus() {
    focusAfterTransitionRef.current = true;
  }

  function resetLearningState() {
    setCustomSequence(null);
    setStepIndex(0);
    setAssessment(null);
    setAssessmentAnswers({});
    setObservations({});
    setPromptResponses({});
  }

  async function diagnose(nextAnswers = answers) {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBase}/diagnose`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: nextAnswers }) });
      if (!response.ok) throw new Error("diagnose_failed");
      requestStepFocus();
      setDiagnosis(await response.json() as Diagnosis);
      setRouteOverride(null); resetLearningState();
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
      requestStepFocus();
      setRouteOverride(route); resetLearningState();
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
      const observation = await response.json() as TutorObservation;
      setObservations((current) => ({ ...current, [interventionId]: observation }));
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

  function startRemediation() {
    if (!assessment?.remediationSequence.length || !assessmentStepId) return;
    requestStepFocus();
    setCustomSequence([...assessment.remediationSequence, assessmentStepId]);
    setRouteOverride(null);
    setStepIndex(0);
    setAssessment(null);
    setAssessmentAnswers({});
    setPromptResponses({});
    setObservations({});
  }

  function goDiagnostic(direction: -1 | 1) {
    requestStepFocus();
    setDiagnosticIndex((current) => Math.min(definition.diagnostics.length - 1, Math.max(0, current + direction)));
  }

  function goStep(direction: -1 | 1) {
    requestStepFocus();
    setStepIndex((current) => Math.min(sequence.length - 1, Math.max(0, current + direction)));
  }

  if (restoring && !diagnosis) {
    return <main className={styles.shell} aria-busy="true"><section className={styles.hero}><p className={styles.kicker}>Solution Architecture · Module {definition.sourceModuleId}</p><h1>{definition.title}</h1><p role="status">Je leerroute wordt geladen…</p></section></main>;
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
        <h2 ref={(node) => { stepHeadingRef.current = node; }} tabIndex={-1}>{question.prompt}</h2>
        {question.kind === "single_choice" ? <fieldset className={styles.choices}>
          <legend className={styles.srOnly}>Kies één antwoord</legend>
          {question.options?.map((option) => <label key={option} className={styles.choice}><input type="radio" name={question.id} value={option} checked={value === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} /><span>{option}</span></label>)}
        </fieldset> : <textarea className={styles.textarea} rows={5} maxLength={1000} value={value} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Leg kort uit wat je ziet. Je hoeft het nog niet zeker te weten." />}
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} disabled={diagnosticIndex === 0 || busy} onClick={() => goDiagnostic(-1)}>Vorige</button>
          <button type="button" className={styles.secondary} disabled={busy} onClick={() => {
            const next = { ...answers, [question.id]: "Ik weet dit nog niet." }; setAnswers(next);
            if (finalQuestion) void diagnose(next); else goDiagnostic(1);
          }}>Ik weet dit nog niet</button>
          {finalQuestion ? <button type="button" className={styles.primary} disabled={!value.trim() || busy} onClick={() => void diagnose()}>{busy ? "Route bepalen…" : "Bepaal mijn route"}</button> : <button type="button" className={styles.primary} disabled={!value.trim()} onClick={() => goDiagnostic(1)}>Volgende</button>}
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
  const platformProgressRequired = Boolean(courseHref);
  const platformProgressSynced = !platformProgressRequired || assessment?.platformProgress?.status === "synced";
  const masteryPassedButSyncOpen = Boolean(assessment?.passed && platformProgressRequired && !platformProgressSynced);

  return <main className={styles.shell}>
    <section className={styles.routeHeader}>
      <div><p className={styles.kicker}>Module {definition.sourceModuleId} · {customSequence ? "Extra oefenroute" : routeCopy[activeRoute].name}</p><h1 ref={(node) => { stepHeadingRef.current = node; }} tabIndex={-1}>{definition.title}</h1><p>{customSequence ? "Je oefent alleen de onderdelen die in de eindcheck nog aandacht vroegen." : routeCopy[activeRoute].description}</p></div>
      {!customSequence ? <div className={styles.routeActions}>
        {activeRoute !== "A" ? <button className={styles.secondary} type="button" disabled={busy} onClick={() => void chooseRoute("A")}>Toon volledige uitleg</button> : null}
        {routeOverride ? <button className={styles.secondary} type="button" disabled={busy} onClick={() => void chooseRoute(null)}>Terug naar aanbevolen route</button> : null}
      </div> : null}
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
          {assessment ? masteryPassedButSyncOpen ? <div className={styles.feedback} role="status">
            <strong>Eindcheck gehaald — voortgang nog niet bijgewerkt</strong>
            <p>Je hebt de verplichte leerdoelen aangetoond, maar EAW kon de officiële cursusvoortgang nog niet registreren.</p>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} disabled={busy} onClick={() => void assess()}>{busy ? "Opnieuw proberen…" : "Probeer voortgang opnieuw"}</button>
              {courseHref ? <a className={styles.secondary} href={courseHref}>Terug naar training zonder sync</a> : null}
            </div>
          </div> : <div className={assessment.passed ? styles.success : styles.feedback} role="status">
            <strong>{assessment.passed ? "Modulecheck afgerond" : `${assessment.correct} van ${assessment.total} goed`}</strong>
            <p>{assessment.passed ? (platformProgressRequired ? "Je hebt de verplichte leerdoelen aangetoond en je EAW-voortgang is bijgewerkt." : "Je hebt de verplichte leerdoelen aangetoond.") : "Je krijgt alleen de onderdelen terug die nog aandacht vragen."}</p>
            {!assessment.passed && assessment.remediationSequence.length ? <button type="button" className={styles.primary} onClick={startRemediation}>Oefen alleen wat nog aandacht vraagt</button> : null}
            {assessment.passed && courseHref ? <a className={styles.primaryLink} href={courseHref}>Terug naar de training</a> : null}
          </div> : null}
        </div> : null}

        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.actions}><button className={styles.secondary} type="button" disabled={stepIndex === 0 || busy} onClick={() => goStep(-1)}>Vorige</button>{!last ? <button className={styles.primary} type="button" disabled={!canProceed || busy} onClick={() => goStep(1)}>Volgende</button> : null}</div>
      </section>
    </div>
  </main>;
}
