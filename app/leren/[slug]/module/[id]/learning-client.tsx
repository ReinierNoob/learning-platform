"use client";

import { useMemo, useState, useId } from "react";
import { LessonMarkdown } from "../../../../../components/lesson-markdown";

type Question = { nr: number; vraag: string; opties: Record<string, string> };
type Message = { role: "user" | "assistant"; content: string };
type Result = { nr: number; correct: boolean; juisteAntwoord: string; uitleg: string };

export function ChatClient({ trainingId, moduleId, chapterId, contentVersion }: { trainingId: string; moduleId: number; chapterId?: string; contentVersion?: string }) {
  const inputId = useId();
  const [includeSavedWork, setIncludeSavedWork] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendChat() {
    const value = input.trim();
    if (!value || busy) return;
    const next = [...messages, { role: "user" as const, content: value }];
    setChatError(null);
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const response = await fetch(`/api/chat/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingId, chapterId, contentVersion, includeSavedWork, messages: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "ai_unavailable");
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setChatError(error instanceof Error && error.message === "content_changed" ? "De les is bijgewerkt. Kopieer je vraag en vernieuw deze pagina." : "Alexander kon niet antwoorden. Je vraag staat weer in het invoerveld; probeer opnieuw.");
      setMessages(messages);
      setInput(value);
    } finally {
      setBusy(false);
    }
  }

  return <section className="chat">
    <h2>Chat met Alexander</h2>
    <p className="meta">Vraag om uitleg, een uitgewerkt voorbeeld of feedback op je redenering. Alexander gebruikt de lesstof van deze module.</p>
    <div className="messages" role="log" aria-live="polite" aria-label="Gesprek met Alexander">{messages.length === 0 ? <p className="meta">Stel Alexander een vraag over deze module.</p> : messages.map((message, index) => <div key={index} className={`bubble ${message.role}`}><LessonMarkdown text={message.content} /></div>)}</div>
    <label htmlFor={inputId}>Je vraag aan Alexander</label>
    {contentVersion?.startsWith("refactor-") ? <label><input type="checkbox" checked={includeSavedWork} disabled={busy} onChange={(e) => setIncludeSavedWork(e.target.checked)} /> Gebruik mijn opgeslagen uitwerking uit deze module voor dit gesprek</label> : null}
    {chatError ? <p role="alert">{chatError}</p> : null}
    <div className="inputRow"><input id={inputId} disabled={busy} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendChat(); }} placeholder="Typ je vraag…" /><button className="button" onClick={() => void sendChat()} disabled={busy}>{busy ? "Alexander typt…" : "Verstuur"}</button></div>
  </section>;
}

export function QuizClient({ trainingId, moduleId, questions, contentVersion }: { trainingId: string; moduleId: number; questions: Question[]; contentVersion?: string }) {
  const [startedAt, setStartedAt] = useState<string | null>(null);
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
        body: JSON.stringify({ trainingId, contentVersion, antwoorden: answers, startedAt }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "grading_failed");
      setResults(data.resultaten ?? []);
    } catch (error) {
      setError(error instanceof Error && error.message === "content_changed" ? "De toets is bijgewerkt. Vernieuw de pagina om de nieuwe versie te maken." : "De zelftoets kon niet worden verwerkt. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="quiz">
    <h2>Zelftoets</h2>
    {questions.map((question) => {
      const result = results?.find((item) => item.nr === question.nr);
      return <fieldset className="question" key={question.nr}><legend>{question.nr}. {question.vraag}</legend>{Object.entries(question.opties).map(([key, label]) => <label key={key}><input type="radio" name={`q-${moduleId}-${question.nr}`} value={key} checked={answers[question.nr] === key} disabled={Boolean(results) || busy} onChange={() => { setStartedAt((current) => current ?? new Date().toISOString()); setAnswers((current) => ({ ...current, [question.nr]: key })); }} /> {key}. {label}</label>)}{result ? <p className={result.correct ? "success" : "error"}>{result.correct ? "Goed. " : `Niet helemaal — het juiste antwoord is ${result.juisteAntwoord}. `}{result.uitleg}</p> : null}</fieldset>;
    })}
    {error ? <p className="error" role="alert">{error}</p> : null}
    {!results ? <button className="button" disabled={!complete || busy} onClick={() => void gradeQuiz()}>{busy ? "Bezig…" : "Controleer antwoorden en registreer voortgang"}</button> : <div role="status"><p className="success"><strong>Je antwoorden zijn verwerkt in je voortgang.</strong></p><button className="button secondary" onClick={() => { setResults(null); setAnswers({}); setStartedAt(null); }}>Opnieuw oefenen</button></div>}
  </section>;
}
