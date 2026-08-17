"use client";

import { useMemo, useState } from "react";

type Question = { nr: number; vraag: string; opties: Record<string, string> };
type Message = { role: "user" | "assistant"; content: string };

type Result = { nr: number; correct: boolean; juisteAntwoord: string; uitleg: string };

export function LearningClient({ moduleId, questions }: { moduleId: number; questions: Question[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const [quizBusy, setQuizBusy] = useState(false);
  const complete = useMemo(() => questions.every((question) => answers[question.nr]), [answers, questions]);

  async function sendChat() {
    const value = input.trim();
    if (!value || chatBusy) return;
    const next = [...messages, { role: "user" as const, content: value }];
    setMessages(next); setInput(""); setChatBusy(true);
    try {
      const response = await fetch(`/api/chat/${moduleId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.reply ?? "De AI-instructeur is nu niet beschikbaar." }]);
    } finally { setChatBusy(false); }
  }

  async function gradeQuiz() {
    if (!complete || quizBusy) return;
    setQuizBusy(true);
    try {
      const response = await fetch(`/api/grade-quiz/${moduleId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ antwoorden: answers }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "grading_failed");
      setResults(data.resultaten ?? []);
    } finally { setQuizBusy(false); }
  }

  return <>
    <section className="chat"><h2>Chat met Alexander</h2><p className="meta">Je AI-instructeur voor deze module. Alexander begeleidt; de antwoordensleutel wordt nooit naar je browser gestuurd.</p><div className="messages">{messages.length === 0 ? <p className="meta">Stel Alexander een vraag over deze module.</p> : messages.map((message, index) => <div key={index} className={`bubble ${message.role}`}>{message.content}</div>)}</div><div className="inputRow"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendChat(); }} placeholder="Typ je vraag…"/><button className="button" onClick={() => void sendChat()} disabled={chatBusy}>{chatBusy ? "Alexander typt…" : "Verstuur"}</button></div></section>
    <section className="quiz"><h2>Zelftoets</h2>{questions.map((question) => { const result = results?.find((item) => item.nr === question.nr); return <div className="question" key={question.nr}><p><strong>{question.nr}. {question.vraag}</strong></p>{Object.entries(question.opties).map(([key, label]) => <label key={key}><input type="radio" name={`q-${question.nr}`} value={key} checked={answers[question.nr] === key} disabled={Boolean(results)} onChange={() => setAnswers((current) => ({ ...current, [question.nr]: key }))}/> {key}. {label}</label>)}{result ? <p className={result.correct ? "success" : "error"}>{result.correct ? "Goed. " : `Niet helemaal — het juiste antwoord is ${result.juisteAntwoord}. `}{result.uitleg}</p> : null}</div>; })}{!results ? <button className="button" disabled={!complete || quizBusy} onClick={() => void gradeQuiz()}>{quizBusy ? "Bezig…" : "Controleer antwoorden en registreer voortgang"}</button> : <p className="success"><strong>Je antwoorden zijn verwerkt in je voortgang.</strong></p>}</section>
  </>;
}
