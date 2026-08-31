"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import styles from "./pilot-v2.module.css";

type Diagnosis = {
  route: RouteId;
  reasonCode: string;
  sequence: string[];
  evidence: { id: string; objectiveId: string; passed: boolean }[];
  misconceptions: string[];
  profile: {
    conceptMastery: Record<string, string>;
    routeHistory: unknown[];
    persistence: string;
    transitionIds?: unknown;
  };
};

type AssessmentResult = {
  correct: number;
  total: number;
  passed: boolean;
  remediationSequence: string[];
  profileUpdate: Record<string, string>;
  persistence?: string;
  transitionIds?: unknown;
};

type TutorObservation = {
  level: "strong" | "partial" | "needs_work";
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
  objectiveId: string;
  persistence?: string;
  transitionIds?: unknown;
};

const emptyVisual: VisualState = {
  visibleAlternatives: 0,
  visibleAttributes: 0,
  showTradeoffs: false,
  adrSectionsVisible: [],
  highlightWeakLink: null,
};

const kindLabel = {
  explanation: "Uitleg",
  repair: "Gericht herstel",
  check: "Korte check",
  practice: "Oefening",
  assessment: "Eindcheck",
} as const;

function speakerName(speaker: "interviewer" | "alexander") {
  return speaker === "interviewer" ? "Eva" : "Alexander";
}

export default function AdaptiveModule6PilotV3() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [routeOverride, setRouteOverride] = useState<RouteId | null>(null);
  const [customSequence, setCustomSequence] = useState<string[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [promptResponses, setPromptResponses] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState<Record<string, TutorObservation>>({});
  const [submitting, setSubmitting] = useState(false);
  const [observing, setObserving] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    async function restoreState() {
      try {
        const response = await fetch("/api/lab/solution-architecture-module-6/state", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { enabled?: boolean; state?: Diagnosis | null };
        if (active && data.state?.route) {
          setDiagnosis(data.state);
          setStepIndex(0);
          setMaxReached(0);
        }
      } catch {
        // Best-effort while persistence is disabled. Runtime writes remain fail-closed.
      } finally {
        if (active) setRestoring(false);
      }
    }
    void restoreState();
    return () => { active = false; };
  }, []);

  const activeRoute = routeOverride ?? diagnosis?.route ?? null;
  const sequence = customSequence ?? (activeRoute ? routeSequences[activeRoute] : []);
  const intervention = sequence.length ? interventions[sequence[Math.min(stepIndex, sequence.length - 1)]] : null;
  const visual = intervention?.visual ?? emptyVisual;
  const profile = useMemo(() => ({
    ...(diagnosis?.profile.conceptMastery ?? {}),
    ...(assessment?.profileUpdate ?? {}),
  }), [diagnosis, assessment]);

  function focusLearningStep() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function openStep(index: number) {
    if (index > maxReached) return;
    setStepIndex(index);
    setError(null);
    focusLearningStep();
  }

  function resetRouteState() {
    setCustomSequence(null);
    setStepIndex(0);
    setMaxReached(0);
    setAssessment(null);
    setAssessmentAnswers({});
    setPromptResponses({});
    setObservations({});
  }

  async function diagnose() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/lab/solution-architecture-module-6/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        if (response.status === 401) throw new Error("authentication_required");
        if (response.status === 403) throw new Error("entitlement_required");
        throw new Error(payload.error ?? "diagnose_failed");
      }
      const data = await response.json() as Diagnosis;
      setDiagnosis(data);
      setRouteOverride(null);
      resetRouteState();
      focusLearningStep();
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "diagnose_failed";
      setError(code === "authentication_required"
        ? "Log eerst in als testcursist om deze preview te gebruiken."
        : code === "entitlement_required"
          ? "Deze testcursist heeft geen actieve toegang tot deze preview."
          : "De leerroute kon niet worden bepaald. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitObservation(interventionId: string) {
    const answer = promptResponses[interventionId]?.trim() ?? "";
    if (!answer) return;

    setObserving(interventionId);
    setError(null);
    try {
      const response = await fetch("/api/lab/solution-architecture-module-6/observe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ interventionId, answer }),
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error("authentication_required");
        if (response.status === 403) throw new Error("entitlement_required");
        throw new Error("observation_failed");
      }
      const observation = await response.json() as TutorObservation;
      setObservations((current) => ({ ...current, [interventionId]: observation }));
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "observation_failed";
      setError(code === "authentication_required"
        ? "Log eerst in als testcursist om je redenering te laten beoordelen."
        : code === "entitlement_required"
          ? "Deze testcursist heeft geen actieve toegang tot deze preview."
          : "Je redenering kon niet worden beoordeeld. Probeer het opnieuw.");
    } finally {
      setObserving(null);
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
      setError("De eindcheck kon niet worden beoordeeld of opgeslagen. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  async function chooseRouteOverride(route: RouteId | null) {
    if (!diagnosis) return;
    const targetRoute = route ?? diagnosis.route;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/lab/solution-architecture-module-6/override", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ route: targetRoute }),
      });
      if (!response.ok) throw new Error("override_failed");
      setRouteOverride(route);
      resetRouteState();
      focusLearningStep();
    } catch {
      setError("De gekozen leerroute kon niet worden vastgelegd. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  function startRemediation() {
    if (!assessment?.remediationSequence.length) return;
    setCustomSequence([...assessment.remediationSequence, "m6-adr-beoordelen-assessment-v1"]);
    setRouteOverride(null);
    setStepIndex(0);
    setMaxReached(0);
    setAssessment(null);
    setAssessmentAnswers({});
    setPromptResponses({});
    setObservations({});
    focusLearningStep();
  }

  function nextStep() {
    if (!sequence.length || stepIndex >= sequence.length - 1) return;
    const next = stepIndex + 1;
    setMaxReached((current) => Math.max(current, next));
    setStepIndex(next);
    setError(null);
    focusLearningStep();
  }

  function previousStep() {
    if (stepIndex === 0) return;
    setStepIndex((current) => current - 1);
    setError(null);
    focusLearningStep();
  }

  if (restoring && !diagnosis) {
    return <main className={styles.diagnosticShell} aria-busy="true">
      <section className={styles.intro}>
        <p className={styles.kicker}>Solution Architecture · Module 6</p>
        <h1>Ontwerpkeuzes en trade-offs</h1>
        <p role="status">Je bestaande leerroute wordt geladen…</p>
      </section>
    </main>;
  }

  if (!diagnosis) {
    const currentQuestion = diagnosticQuestions[diagnosticIndex];
    const currentAnswer = answers[currentQuestion.id] ?? "";
    const finalQuestion = diagnosticIndex === diagnosticQuestions.length - 1;
    const progress = Math.round(((diagnosticIndex + 1) / diagnosticQuestions.length) * 100);

    return <main className={styles.diagnosticShell}>
      <section className={styles.intro}>
        <p className={styles.kicker}>Solution Architecture · Module 6</p>
        <h1>Ontwerpkeuzes en trade-offs</h1>
        <p>Eva stelt vier korte vragen, één voor één. Op basis van je antwoorden krijg je meer uitleg, een verkorte route of gericht herstel waar dat nodig is.</p>
        <p className={styles.privacyNote}>Je vrije intake-antwoorden worden niet als leerbewijs bewaard; alleen het afgeleide leerresultaat kan worden opgeslagen.</p>
      </section>
      <section className={styles.diagnosticCard} aria-labelledby="eva-heading">
        <div className={styles.persona}><span aria-hidden="true">E</span><div><small>Interviewer</small><strong id="eva-heading">Eva</strong></div></div>
        <div className={styles.diagnosticProgress}>
          <span>Vraag {diagnosticIndex + 1} van {diagnosticQuestions.length}</span>
          <div className={styles.progressTrack} role="progressbar" aria-label="Voortgang intake" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
        <label className={styles.question} key={currentQuestion.id}>
          <span aria-hidden="true">{String(diagnosticIndex + 1).padStart(2, "0")}</span>
          <strong>{currentQuestion.question}</strong>
          <textarea autoFocus value={currentAnswer} onChange={(event) => setAnswers((current) => ({ ...current, [currentQuestion.id]: event.target.value }))} rows={5} maxLength={1000} />
        </label>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.diagnosticActions}>
          <button className={styles.secondary} disabled={diagnosticIndex === 0 || submitting} onClick={() => setDiagnosticIndex((current) => Math.max(0, current - 1))} type="button">Vorige vraag</button>
          {finalQuestion ? (
            <button className={styles.primary} disabled={submitting || !currentAnswer.trim()} onClick={diagnose} type="button">
              {submitting ? "Leerroute bepalen…" : "Bepaal mijn leerroute"}
            </button>
          ) : (
            <button className={styles.primary} disabled={!currentAnswer.trim()} onClick={() => setDiagnosticIndex((current) => Math.min(diagnosticQuestions.length - 1, current + 1))} type="button">Volgende vraag</button>
          )}
        </div>
      </section>
    </main>;
  }

  if (!intervention || !activeRoute) return null;

  const progress = Math.round(((stepIndex + 1) / sequence.length) * 100);
  const decisionCode = customSequence ? "ASSESSMENT_REMEDIATION" : routeOverride ? "LEARNER_OVERRIDE" : diagnosis.reasonCode;
  const routeTitle = customSequence ? "Gerichte herstelroute" : routeMetadata[activeRoute].name;
  const routeDescription = customSequence
    ? "Je eindcheck wees één of meer zwakke concepten aan. Je herhaalt alleen wat nodig is en doet daarna opnieuw de eindcheck."
    : routeMetadata[activeRoute].description;
  const promptAnswer = intervention.prompt ? (promptResponses[intervention.id] ?? "") : "";
  const observation = intervention.prompt ? observations[intervention.id] : undefined;
  const promptComplete = !intervention.prompt || observation?.canProceed === true;
  const isAssessment = intervention.kind === "assessment";
  const canGoNext = !isAssessment && promptComplete && stepIndex < sequence.length - 1;

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <p className={styles.kicker}>Module 6 · Adaptieve leerroute</p>
      <h1>Solution Architecture</h1>
      <div className={styles.routeCard}>
        <small>Jouw route</small>
        <strong>{routeTitle}</strong>
        <p>{routeDescription}</p>
      </div>
      <div className={styles.progressTrack} role="progressbar" aria-label="Voortgang leerroute" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <i style={{ width: `${progress}%` }} />
      </div>
      <details className={styles.routeSteps} open>
        <summary>Bekijk leerstappen</summary>
        <nav className={styles.stepNav} aria-label="Leerstappen in jouw route">
          {sequence.map((id, index) => {
            const locked = index > maxReached;
            return <button
              className={index === stepIndex ? styles.active : ""}
              key={`${decisionCode}-${id}-${index}`}
              onClick={() => openStep(index)}
              type="button"
              disabled={locked}
              aria-current={index === stepIndex ? "step" : undefined}
              aria-label={`${index + 1}. ${interventions[id].title}${locked ? ", nog niet beschikbaar" : ""}`}
            >
              <small>{String(index + 1).padStart(2, "0")}</small><span>{interventions[id].title}</span>
            </button>;
          })}
        </nav>
      </details>
      {!customSequence && activeRoute !== "A" ? <button className={styles.fullRoute} disabled={submitting} onClick={() => void chooseRouteOverride("A")} type="button">Ik wil toch de volledige uitleg</button> : null}
      {!customSequence && routeOverride ? <button className={styles.fullRoute} disabled={submitting} onClick={() => void chooseRouteOverride(null)} type="button">Terug naar mijn geadviseerde route</button> : null}
      {customSequence ? <button className={styles.fullRoute} onClick={() => { setCustomSequence(null); setRouteOverride(null); setStepIndex(0); setMaxReached(0); setAssessment(null); setAssessmentAnswers({}); setPromptResponses({}); setObservations({}); focusLearningStep(); }} type="button">Terug naar mijn leerroute</button> : null}
    </aside>

    <main className={styles.main}>
      <header className={styles.topbar}>
        <div><span>{speakerName(intervention.speaker)}</span><h2 ref={headingRef} tabIndex={-1}>{intervention.title}</h2></div>
        <div className={styles.personaMini}><b aria-hidden="true">{intervention.speaker === "interviewer" ? "E" : "A"}</b><small>{intervention.speaker === "interviewer" ? "stelt vragen en daagt uit" : "legt uit en laat je oefenen"}</small></div>
      </header>

      <section className={styles.learningArea}>
        <div className={styles.visualPanel}>
          <p className={styles.panelLabel}>Afwegingsbord · Gemeente Middelveen</p>
          <div className={styles.matrixDesktop} role="region" aria-label="Afwegingsmatrix">
            <div className={styles.matrixHeader}><span>Alternatief</span>{attributes.slice(0, visual.visibleAttributes).map((attribute) => <strong key={attribute}>{attribute}</strong>)}</div>
            {alternatives.slice(0, visual.visibleAlternatives).map((alternative, row) => <div className={styles.matrixRow} key={alternative}>
              <span>{row + 1}. {alternative}</span>
              {attributes.slice(0, visual.visibleAttributes).map((attribute) => <em key={attribute}>{visual.showTradeoffs ? "te beoordelen" : "—"}</em>)}
            </div>)}
            {visual.visibleAlternatives === 0 ? <div className={styles.emptyState}>De afweging wordt tijdens deze stap opgebouwd.</div> : null}
          </div>
          <div className={styles.matrixMobile} aria-label="Afweging per alternatief">
            {alternatives.slice(0, visual.visibleAlternatives).map((alternative, row) => <article key={alternative}>
              <strong>{row + 1}. {alternative}</strong>
              <dl>{attributes.slice(0, visual.visibleAttributes).map((attribute) => <div key={attribute}><dt>{attribute}</dt><dd>{visual.showTradeoffs ? "te beoordelen" : "—"}</dd></div>)}</dl>
            </article>)}
            {visual.visibleAlternatives === 0 ? <p className={styles.emptyState}>De afweging wordt tijdens deze stap opgebouwd.</p> : null}
          </div>
          {visual.showTradeoffs ? <p className={styles.validationNote}>De alternatieven en kwaliteitsattributen zijn onderdeel van de oefening. De waardering per cel vul je pas in wanneer de afweging inhoudelijk is onderbouwd.</p> : null}
          <div className={styles.adrCard}>
            <small>ADR-kaart</small>
            {adrSections.map((section) => <div className={`${styles.adrSection} ${visual.adrSectionsVisible.includes(section) ? styles.visible : ""} ${visual.highlightWeakLink === section ? styles.weak : ""}`} key={section}>
              <strong>{section}</strong><span>{visual.adrSectionsVisible.includes(section) ? "opgebouwd" : "komt later"}</span>
            </div>)}
          </div>
        </div>

        <div className={styles.lessonPanel}>
          <p className={styles.panelLabel}>{kindLabel[intervention.kind]}</p>
          <p className={styles.lessonText}>{intervention.body}</p>

          {intervention.prompt ? <div className={styles.prompt}>
            <strong>{speakerName(intervention.speaker)} vraagt</strong>
            <p>{intervention.prompt}</p>
            <label>
              <span>Jouw redenering</span>
              <textarea
                rows={4}
                value={promptAnswer}
                maxLength={1200}
                onChange={(event) => {
                  const value = event.target.value;
                  setPromptResponses((current) => ({ ...current, [intervention.id]: value }));
                  setObservations((current) => {
                    if (!current[intervention.id]) return current;
                    const next = { ...current };
                    delete next[intervention.id];
                    return next;
                  });
                }}
                placeholder="Schrijf kort op hoe je tot je antwoord komt…"
              />
            </label>
            <button
              className={styles.primary}
              disabled={promptAnswer.trim().length < 3 || observing === intervention.id}
              onClick={() => void submitObservation(intervention.id)}
              type="button"
            >
              {observing === intervention.id ? "Redenering bekijken…" : `Laat ${speakerName(intervention.speaker)} reageren`}
            </button>
            {observation ? <div className={observation.canProceed ? styles.pass : styles.remediate} role="status" aria-live="polite">
              <strong>{observation.canProceed ? "Je kunt door" : "Scherp je antwoord nog aan"}</strong>
              <p>{observation.feedback}</p>
              {observation.followUp ? <p><strong>Vervolgvraag:</strong> {observation.followUp}</p> : null}
              {!observation.canProceed ? <p>Pas je redenering hierboven aan en laat {speakerName(intervention.speaker)} opnieuw reageren.</p> : null}
            </div> : null}
          </div> : null}

          {isAssessment ? <section className={styles.assessment} aria-labelledby="assessment-heading">
            <h3 id="assessment-heading">Verplichte eindcheck</h3>
            {assessmentQuestions.map((question, questionIndex) => <fieldset className={styles.assessmentQuestion} key={question.id}>
              <legend>{questionIndex + 1}. {question.question}</legend>
              {question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={assessmentAnswers[question.id] === optionIndex} onChange={() => setAssessmentAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /> <span>{option}</span></label>)}
            </fieldset>)}
            <button className={styles.primary} disabled={submitting || assessmentQuestions.some((item) => assessmentAnswers[item.id] === undefined)} onClick={submitAssessment} type="button">Beoordeel mijn antwoorden</button>
            {assessment ? <div className={assessment.passed ? styles.pass : styles.remediate} role="status" aria-live="polite">
              <strong>{assessment.correct}/{assessment.total} correct</strong>
              <p>{assessment.passed ? "Je hebt de gecontroleerde concepten aangetoond. Deze modulecheck is afgerond." : "Minstens één concept vraagt nog aandacht. Je krijgt alleen de herstelstappen die daarbij horen."}</p>
              {!assessment.passed && assessment.remediationSequence.length > 0 ? <button className={styles.primary} onClick={startRemediation} type="button">Start mijn gerichte herstelroute</button> : null}
            </div> : null}
          </section> : null}
        </div>
      </section>

      <details className={styles.debugPanel}>
        <summary>Pilotdetails voor reviewers</summary>
        <div className={styles.debugGrid}>
          <div><small>Routebesluit</small><strong>{decisionCode}</strong><p>{diagnosis.evidence.map((item) => `${item.id}:${item.passed ? "pass" : "uncertain"}`).join(" · ")}</p></div>
          <div><small>Misconcepties</small><strong>{diagnosis.misconceptions.length}</strong><p>{diagnosis.misconceptions.join(" · ") || "geen actieve misconceptie gedetecteerd"}</p></div>
          <div><small>Learner model</small><strong>{diagnosis.profile.persistence}</strong><p>{Object.entries(profile).map(([key, value]) => `${key}: ${value}`).join(" · ")}</p></div>
        </div>
      </details>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <footer className={styles.controls}>
        <button disabled={stepIndex === 0 || submitting || Boolean(observing)} onClick={previousStep} type="button">Vorige</button>
        <span aria-live="polite">Stap {stepIndex + 1} van {sequence.length}</span>
        <button disabled={!canGoNext || submitting || Boolean(observing)} onClick={nextStep} type="button">Volgende</button>
      </footer>
    </main>
  </div>;
}
