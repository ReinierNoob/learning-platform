"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Question = { nr: number; vraag: string; opties: Record<string, string> };

export default function Quiz({ questions, assessmentItemId }: { questions: Question[]; assessmentItemId: string | null }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const complete = questions.length > 0 && questions.every((question) => answers[String(question.nr)]);

  async function submit() {
    if (!assessmentItemId || !complete) return;
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: assessmentItemId, answers }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "progress_rejected");
      const score = typeof body.score === "number" ? `${body.score}%` : "opgeslagen";
      setResult(`Zelftoets verwerkt: ${score}. Cursusvoortgang ${body.course_percentage ?? 0}%.`);
      router.refresh();
    } catch {
      setResult("De zelftoets kon niet worden opgeslagen. Probeer het opnieuw.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="quiz">
      <h2>Zelftoets</h2>
      {questions.map((question) => (
        <div className="question" key={question.nr}>
          <p><strong>{question.nr}. {question.vraag}</strong></p>
          {Object.entries(question.opties).map(([key, label]) => (
            <label className="option" key={key}>
              <input
                type="radio"
                name={`vraag-${question.nr}`}
                value={key}
                checked={answers[String(question.nr)] === key}
                onChange={() => setAnswers((current) => ({ ...current, [String(question.nr)]: key }))}
              /> {key}. {label}
            </label>
          ))}
        </div>
      ))}
      <p><button className="button" disabled={!complete || !assessmentItemId || pending} onClick={submit}>{pending ? "Verwerken…" : "Controleer antwoorden"}</button></p>
      {!assessmentItemId ? <p className="notice">Deze module heeft nog geen centrale assessment-koppeling.</p> : null}
      {result ? <p className="result" role="status">{result}</p> : null}
    </section>
  );
}
