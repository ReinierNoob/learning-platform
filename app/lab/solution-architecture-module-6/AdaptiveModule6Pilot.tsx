"use client";

import { useMemo, useState } from "react";
import {
  adrSections,
  alternatives,
  assessmentQuestions,
  attributes,
  diagnosticQuestions,
  interventions,
  routeMetadata,
  routeSequences,
  type RouteId,
  type VisualState,
} from "../../../lib/solution-architecture-module-6";
import styles from "./pilot.module.css";

type Diagnosis = {
  route: RouteId;
  reasonCode: string;
  sequence: string[];
  evidence: { id: string; objectiveId: string; passed: boolean }[];
  misconceptions: string[];
  profile: { conceptMastery: Record<string, string>; routeHistory: unknown[]; persistence: string };
};

type AssessmentResult = {
  correct: number;
  total: number;
  passed: boolean;
  profileUpdate: Record<string, string>;
};

const emptyVisual: VisualState = {
  visibleAlternatives: 0,
  visibleAttributes: 0,
  showTradeoffs: false,
  adrSectionsVisible: [],
  highlightWeakLink: null,
};

function speakerName(speaker: "interviewer" | "alexander") {
  return speaker === "interviewer" ? "Eva" : "Alexander";
}

export default function AdaptiveModule6Pilot() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [routeOverride, setRouteOverride] = useState<RouteId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);

  const activeRoute = routeOverride ?? diagnosis?.route ?? null;
  const sequence = activeRoute ? routeSequences[activeRoute] : [];
  const intervention = sequence.length ? interventions[sequence[Math.min(stepIndex, sequence.length - 1)]] : null;
  const visual = intervention?.visual ?? emptyVisual;
  const profile = useMemo(() => ({
    ...(diagnosis?.profile.conceptMastery ?? {}),
    ...(assessment?.profileUpdate ?? {}),
  }), [diagnosis, assessment]);

  async function diagnose() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/lab/solution-architecture-module-6/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error("diagnose_failed");
      const data = await response.json() as Diagnosis;
      setDiagnosis(data);
      setRouteOverride(null);
      setStepIndex(0);
      setAssessment(null);
    } catch {
      setError("De diagnostiek kon niet worden uitgevoerd.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAssessment() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/lab/solution-architecture-module-6/assess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: assessmentAnswers }),
      });
      if (!response.ok) throw new Error("assessment_failed");
      setAssessment(await response.json() as AssessmentResult);
    } catch {
      setError("De eindcheck kon niet worden beoordeeld.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!diagnosis) {
    return <main className={styles.diagnosticShell}>
      <section className={styles.intro}>
        <p className={styles.kicker}>EAW Learning Lab · preview only</p>
        <h1>Module 6 — Ontwerpkeuzes en trade-offs</h1>
        <p>Eva stelt vier korte diagnostische vragen. Je antwoorden worden server-side geïnterpreteerd om een leerroute te kiezen. De casus Gemeente Middelveen is fictief.</p>
      </section>
      <section className={styles.diagnosticCard}>
        <div className={styles.persona}><span>E</span><div><small>Interviewer</small><strong>Eva</strong></div></div>
        {diagnosticQuestions.map((item, index) => <label className={styles.question} key={item.id}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item.question}</strong>
          <textarea value={answers[item.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))} rows={3} />
        </label>)}
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.primary} disabled={submitting || diagnosticQuestions.some((item) => !(answers[item.id] ?? "").trim())} onClick={diagnose} type="button">
          {submitting ? "Route bepalen…" : "Bepaal mijn leerroute"}
        </button>
      </section>
    </main>;
  }

  if (!intervention || !activeRoute) return null;
  const progress = Math.round(((stepIndex + 1) / sequence.length) * 100);

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <p className={styles.kicker}>Adaptive Learning v2 · Module 6</p>
      <h1>Solution Architecture</h1>
      <div className={styles.routeCard}>
        <small>Gekozen route</small>
        <strong>{activeRoute} · {routeMetadata[activeRoute].name}</strong>
        <p>{routeMetadata[activeRoute].description}</p>
        <code>{routeOverride ? "LEARNER_OVERRIDE" : diagnosis.reasonCode}</code>
      </div>
      <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>
      <nav className={styles.stepNav} aria-label="Adaptieve route">
        {sequence.map((id, index) => <button className={index === stepIndex ? styles.active : ""} key={`${activeRoute}-${id}`} onClick={() => setStepIndex(index)} type="button">
          <small>{String(index + 1).padStart(2, "0")}</small><span>{interventions[id].title}</span>
        </button>)}
      </nav>
      {activeRoute !== "A" ? <button className={styles.fullRoute} onClick={() => { setRouteOverride("A"); setStepIndex(0); setAssessment(null); }} type="button">Toon volledige basisroute</button> : null}
      {routeOverride ? <button className={styles.fullRoute} onClick={() => { setRouteOverride(null); setStepIndex(0); setAssessment(null); }} type="button">Terug naar geadviseerde route</button> : null}
    </aside>

    <main className={styles.main}>
      <header className={styles.topbar}>
        <div><span>{speakerName(intervention.speaker)}</span><h2>{intervention.title}</h2></div>
        <div className={styles.personaMini}><b>{intervention.speaker === "interviewer" ? "E" : "A"}</b><small>{intervention.speaker === "interviewer" ? "diagnoseert en challenget" : "legt uit en oefent"}</small></div>
      </header>

      <section className={styles.learningArea}>
        <div className={styles.visualPanel}>
          <p className={styles.panelLabel}>Afwegingsbord · Gemeente Middelveen (fictief)</p>
          <div className={styles.matrix}>
            <div className={styles.matrixHeader}><span>Alternatief</span>{attributes.slice(0, visual.visibleAttributes).map((attribute) => <strong key={attribute}>{attribute}</strong>)}</div>
            {alternatives.slice(0, visual.visibleAlternatives).map((alternative, row) => <div className={styles.matrixRow} key={alternative}>
              <span>{row + 1}. {alternative}</span>
              {attributes.slice(0, visual.visibleAttributes).map((attribute) => <em key={attribute}>{visual.showTradeoffs ? "afwegen" : "—"}</em>)}
            </div>)}
            {visual.visibleAlternatives === 0 ? <div className={styles.emptyState}>De afweging wordt tijdens de interventie opgebouwd.</div> : null}
          </div>
          <div className={styles.adrCard}>
            <small>ADR-kaart</small>
            {adrSections.map((section) => <div className={`${styles.adrSection} ${visual.adrSectionsVisible.includes(section) ? styles.visible : ""} ${visual.highlightWeakLink === section ? styles.weak : ""}`} key={section}>
              <strong>{section}</strong><span>{visual.adrSectionsVisible.includes(section) ? "zichtbaar" : "nog niet opgebouwd"}</span>
            </div>)}
          </div>
        </div>

        <div className={styles.lessonPanel}>
          <p className={styles.panelLabel}>{intervention.kind} · {intervention.objectiveId}</p>
          <p className={styles.lessonText}>{intervention.body}</p>
          {intervention.prompt ? <div className={styles.prompt}><strong>{speakerName(intervention.speaker)} vraagt</strong><p>{intervention.prompt}</p></div> : null}

          {intervention.kind === "assessment" ? <section className={styles.assessment}>
            <h3>Verplichte eindcheck</h3>
            {assessmentQuestions.map((question, questionIndex) => <div className={styles.assessmentQuestion} key={question.id}>
              <strong>{questionIndex + 1}. {question.question}</strong>
              {question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={assessmentAnswers[question.id] === optionIndex} onChange={() => setAssessmentAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /> {option}</label>)}
            </div>)}
            <button className={styles.primary} disabled={submitting || assessmentQuestions.some((item) => assessmentAnswers[item.id] === undefined)} onClick={submitAssessment} type="button">Beoordeel eindcheck</button>
            {assessment ? <div className={assessment.passed ? styles.pass : styles.remediate}><strong>{assessment.correct}/{assessment.total} correct</strong><p>{assessment.passed ? "De drie gecontroleerde concepten zijn aangetoond." : "Minstens één concept vraagt nog gerichte remediation; het learner model is bijgewerkt."}</p></div> : null}
          </section> : null}
        </div>
      </section>

      <section className={styles.evidencePanel}>
        <div><small>Decision log</small><strong>{diagnosis.reasonCode}</strong><p>{diagnosis.evidence.map((item) => `${item.id}:${item.passed ? "pass" : "uncertain"}`).join(" · ")}</p></div>
        <div><small>Misconcepties</small><strong>{diagnosis.misconceptions.length || 0}</strong><p>{diagnosis.misconceptions.join(" · ") || "geen actieve misconceptie gedetecteerd"}</p></div>
        <div><small>Learner model</small><strong>session-only</strong><p>{Object.entries(profile).map(([key, value]) => `${key}: ${value}`).join(" · ")}</p></div>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}
      <footer className={styles.controls}>
        <button disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))} type="button">Vorige</button>
        <span>{stepIndex + 1} / {sequence.length}</span>
        <button disabled={stepIndex === sequence.length - 1} onClick={() => setStepIndex((current) => Math.min(sequence.length - 1, current + 1))} type="button">Volgende</button>
      </footer>
    </main>
  </div>;
}
