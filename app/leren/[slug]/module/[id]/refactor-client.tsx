"use client";

import { useEffect, useId, useState } from "react";
import { LessonMarkdown } from "../../../../../components/lesson-markdown";

type Practice = { assignment: string; criteria: string[]; worked_example: string };
type SavedWork = { id: string; content_version: string; text: string; created_at: string };

export function ModelDemonstration({ model }: { model: { title: string; steps: Array<{ label: string; text: string }> } }) {
  const [visible, setVisible] = useState(1);
  return <section className="modelDemo" aria-label={model.title}>
    <h3>{model.title}</h3><p>Doorloop de redenering. Elke stap voegt een modelkeuze en de reden daarvoor toe.</p>
    <ol className="modelSteps" aria-live="polite">{model.steps.slice(0, visible).map((step, index) => <li key={index}><strong>{step.label}</strong><p>{step.text}</p></li>)}</ol>
    <div className="practiceActions"><button className="button" disabled={visible >= model.steps.length} onClick={() => setVisible(visible + 1)}>Volgende modelkeuze</button><button className="button secondary" disabled={visible === 1} onClick={() => setVisible(1)}>Opnieuw doorlopen</button></div>
  </section>;
}

export function PracticeClient({ trainingId, moduleId, contentVersion, practice }: { trainingId: string; moduleId: number; contentVersion: string; practice: Practice }) {
  const id = useId();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState<SavedWork | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const url = `/api/practice/${moduleId}?trainingId=${encodeURIComponent(trainingId)}`;
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal }).then(async (r) => {
      if (!r.ok) throw new Error("load_failed");
      const data = await r.json();
      if (controller.signal.aborted) return;
      setSaved(data.work ?? null); setText(data.work?.text ?? ""); setLoaded(true);
    }).catch(() => { if (!controller.signal.aborted) setMessage("Je eerdere werk kon niet worden geladen. Vernieuw de pagina om opnieuw te proberen."); });
    return () => controller.abort();
  }, [url]);
  async function save() {
    if (!loaded || busy) return;
    setBusy(true); setMessage("");
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentVersion, text, expectedId: saved?.id ?? null }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "save_failed");
      setSaved(data.work); setMessage("Je uitwerking is opgeslagen. Opslaan is geen inhoudelijke beoordeling.");
    } catch (error) {
      setMessage(error instanceof Error && error.message === "work_conflict" ? "Er is intussen een andere versie opgeslagen. Download eerst je huidige tekst en vernieuw daarna de pagina." : error instanceof Error && error.message === "content_changed" ? "De les is bijgewerkt. Download je huidige tekst en vernieuw de pagina." : "Opslaan is niet gelukt. Je tekst staat nog in het veld. Probeer opnieuw of download je werk.");
    } finally { setBusy(false); }
  }
  function download() {
    const blob = new Blob([`# Mijn uitwerking — module ${moduleId}\n\nLesversie: ${contentVersion}\n\n${text}\n`], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = href; a.download = `mijn-uitwerking-module-${moduleId}.md`; a.click(); setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  return <section className="practiceWork"><h3>Zelf aan de slag</h3><LessonMarkdown text={practice.assignment} />
    <h4>Beoordelingscriteria</h4><ul>{practice.criteria.map((item) => <li key={item}>{item}</li>)}</ul>
    {saved && saved.content_version !== contentVersion ? <p>Je eerdere werk hoort bij lesversie {saved.content_version}. Controleer het tegen de huidige opdracht voordat je het opnieuw opslaat.</p> : null}
    <label htmlFor={id}>Je model en onderbouwing</label><textarea id={id} value={text} disabled={!loaded || busy} maxLength={24000} onChange={(e) => setText(e.target.value)} aria-describedby={`${id}-status`} />
    <p id={`${id}-status`} role="status">{message || (!loaded ? "Eerder werk laden…" : text !== (saved?.text ?? "") ? "Wijzigingen zijn nog niet opgeslagen." : saved ? "Deze uitwerking is opgeslagen." : "Nog geen uitwerking opgeslagen.")}</p>
    <div className="practiceActions"><button className="button" disabled={!loaded || busy || !text.trim()} onClick={() => void save()}>{busy ? "Opslaan…" : "Uitwerking opslaan"}</button><button className="button secondary" disabled={!text} onClick={download}>Eigen werk downloaden</button></div>
    <details><summary>Bekijk een mogelijke uitwerking</summary><LessonMarkdown text={practice.worked_example} /><p>Andere modelkeuzes kunnen goed zijn als je ze met de criteria onderbouwt.</p></details>
  </section>;
}
