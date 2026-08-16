"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Question = { nr: number; vraag: string; opties: Record<string, string> };

export default function ModuleActions({ contentItemId, assessmentItemId, questions }: { contentItemId?: string; assessmentItemId?: string; questions: Question[] }) {
  const router = useRouter(); const [answers, setAnswers] = useState<Record<string, string>>({}); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function record(body: object) {
    setBusy(true); setMessage("");
    const response = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setMessage("Voortgang kon niet worden opgeslagen. Controleer of je toegang nog actief is."); return; }
    setMessage(result.score == null ? "Leerinhoud voltooid en opgeslagen." : `Toets opgeslagen. Score: ${String(result.score).replace(".", ",")}% · poging ${result.attempt_number}.`);
    router.refresh();
  }
  return <section className="module-actions">
    {contentItemId && <div className="complete-block"><h2>Leerinhoud doorlopen?</h2><p>Markeer dit onderdeel pas wanneer je alle verplichte hoofdstukken hebt doorgenomen.</p><button disabled={busy} onClick={() => record({ itemId: contentItemId })}>Leerinhoud voltooien</button></div>}
    {assessmentItemId && questions.length > 0 && <form onSubmit={(event) => { event.preventDefault(); record({ itemId: assessmentItemId, answers, startedAt: new Date().toISOString() }); }}><div className="quiz-heading"><p className="kicker">Zelftoets</p><h2>Controleer je begrip.</h2><p>Er is geen minimale score. Het maken van de toets is voldoende; opnieuw proberen mag onbeperkt.</p></div>{questions.map((question) => <fieldset key={question.nr}><legend>{question.nr}. {question.vraag}</legend>{Object.entries(question.opties).map(([key, value]) => <label key={key}><input type="radio" name={`question-${question.nr}`} value={key} checked={answers[String(question.nr)] === key} onChange={() => setAnswers((current) => ({ ...current, [String(question.nr)]: key }))} required /> <span><strong>{key}</strong> {value}</span></label>)}</fieldset>)}<button disabled={busy}>{busy ? "Opslaan…" : "Toets afronden"}</button></form>}
    {message && <p className="status-message" role="status">{message}</p>}
  </section>;
}
