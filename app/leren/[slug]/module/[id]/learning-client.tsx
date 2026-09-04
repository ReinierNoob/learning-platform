"use client";

import { useMemo, useState } from "react";

type Question = { nr: number; vraag: string; opties: Record<string, string> };
type Message = { role: "user" | "assistant"; content: string };
type Result = { nr: number; correct: boolean; juisteAntwoord: string; uitleg: string; keuzeUitleg?: string };

export function ChatClient({ trainingId, moduleId }: { trainingId: string; moduleId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendChat() {
    const value = input.trim();
    if (!value || busy) return;
    const next = [...messages, { role: "user" as const, content: value }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const response = await fetch(`/api/chat/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingId, messages: next }),
      });
      const data = await response.json().catch(() => ({}));
      setMessages((current) => [...current, { role: "assistant", content: data.reply ?? "De AI-instructeur is nu niet beschikbaar." }]);
    } finally {
      setBusy(false);
    }
  }

  return <section className="chat">
    <h2>Chat met Alexander</h2>
    <p className="meta">Je AI-instructeur voor deze module. Alexander begeleidt je bij de stof; vertrouwelijke beoordelingsinformatie blijft server-side.</p>
    <div className="messages">{messages.length === 0 ? <p className="meta">Stel Alexander een vraag over deze module.</p> : messages.map((message, index) => <div key={index} className={`bubble ${message.role}`}>{message.content}</div>)}</div>
    <div className="inputRow"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendChat(); }} placeholder="Typ je vraag…" /><button className="button" onClick={() => void sendChat()} disabled={busy}>{busy ? "Alexander typt…" : "Verstuur"}</button></div>
  </section>;
}

export function QuizClient({ trainingId, moduleId, questions }: { trainingId: string; moduleId: number; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const complete = useMemo(() => questions.length > 0 && questions.every((question) => answers[question.nr]), [answers, questions]);

  async function gradeQuiz() {
    if (!complete || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/grade-quiz/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingId, antwoorden: answers }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "grading_failed");
      setResults(data.resultaten ?? []);
    } catch {
      setError("De zelftoets kon niet worden verwerkt. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="quiz">
    <h2>Zelftoets</h2>
    {questions.map((question) => {
      const result = results?.find((item) => item.nr === question.nr);
      return <div className="question" key={question.nr}><p><strong>{question.nr}. {question.vraag}</strong></p>{Object.entries(question.opties).map(([key, label]) => <label key={key}><input type="radio" name={`q-${question.nr}`} value={key} checked={answers[question.nr] === key} disabled={Boolean(results)} onChange={() => setAnswers((current) => ({ ...current, [question.nr]: key }))} /> {key}. {label}</label>)}{result ? <p className={result.correct ? "success" : "error"}>{result.keuzeUitleg ?? `${result.correct ? "Goed. " : `Niet helemaal — het juiste antwoord is ${result.juisteAntwoord}. `}${result.uitleg}`}</p> : null}</div>;
    })}
    {error ? <p className="error" role="alert">{error}</p> : null}
    {!results ? <button className="button" disabled={!complete || busy} onClick={() => void gradeQuiz()}>{busy ? "Bezig…" : "Controleer antwoorden en registreer voortgang"}</button> : <p className="success"><strong>Je antwoorden zijn verwerkt in je voortgang.</strong></p>}
  </section>;
}
