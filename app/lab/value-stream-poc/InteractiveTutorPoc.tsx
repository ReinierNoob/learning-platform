"use client";

import { useMemo, useState } from "react";
import styles from "./poc.module.css";

type Speaker = "Interviewer" | "Tutor";
type Scene = {
  id: string;
  speaker: Speaker;
  title: string;
  text: string;
  visibleStages: number;
  showCapabilities?: boolean;
  quiz?: boolean;
};

const scenes: Scene[] = [
  { id: "question", speaker: "Interviewer", title: "De kernvraag", text: "Wat is een value stream eigenlijk, en waarom is het niet gewoon een proces?", visibleStages: 0 },
  { id: "definition", speaker: "Tutor", title: "Van trigger naar uitkomst", text: "Een value stream laat zien hoe waarde wordt gerealiseerd voor een stakeholder, vanaf een trigger tot een gewenste uitkomst.", visibleStages: 1 },
  { id: "construction", speaker: "Tutor", title: "Bouw de waardestroom", text: "We voegen nu de value stages toe. Dit zijn betekenisvolle stappen in de realisatie van waarde, geen gedetailleerde procesactiviteiten.", visibleStages: 5 },
  { id: "challenge", speaker: "Interviewer", title: "Maar dit lijkt toch op een proces?", text: "Waar zit dan precies het verschil met een procesmodel?", visibleStages: 5 },
  { id: "capabilities", speaker: "Tutor", title: "Koppel capabilities", text: "De value stream beschrijft de waardecreatie. Capabilities beschrijven wat de organisatie moet kunnen om iedere value stage mogelijk te maken.", visibleStages: 5, showCapabilities: true },
  { id: "exercise", speaker: "Tutor", title: "Nu jij", text: "Welke formulering beschrijft het beste de trigger voor deze waardestroom?", visibleStages: 5, showCapabilities: true, quiz: true },
];

const stages = [
  { name: "Behoefte ontstaat", capability: "Access Management" },
  { name: "Zorgvraag verhelderen", capability: "Assessment" },
  { name: "Zorg plannen", capability: "Care Planning" },
  { name: "Zorg leveren", capability: "Care Delivery" },
  { name: "Uitkomst evalueren", capability: "Outcome Evaluation" },
];

const options = ["De zorgbehoefte ontstaat", "De behandeling wordt uitgevoerd", "De patiënt wordt ontslagen"];

export default function InteractiveTutorPoc() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const scene = scenes[sceneIndex];
  const progress = useMemo(() => Math.round(((sceneIndex + 1) / scenes.length) * 100), [sceneIndex]);

  function go(index: number) {
    setSceneIndex(Math.max(0, Math.min(scenes.length - 1, index)));
    setAnswer(null);
  }

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(scene.text);
    utterance.lang = "nl-NL";
    utterance.rate = scene.speaker === "Tutor" ? 0.92 : 1.02;
    utterance.pitch = scene.speaker === "Tutor" ? 0.92 : 1.08;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.kicker}>EAW Learning Lab</p>
        <h1>Value Streams</h1>
        <p className={styles.meta}>Interactieve tutor · proof of concept</p>
        <div className={styles.progress} aria-label={`Voortgang ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
        <nav className={styles.sceneNav} aria-label="Lesonderdelen">
          {scenes.map((item, index) => (
            <button key={item.id} className={index === sceneIndex ? styles.active : undefined} onClick={() => go(index)}>
              <small>{String(index + 1).padStart(2, "0")}</small><span>{item.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div><span>{scene.speaker}</span><h2>{scene.title}</h2></div>
          <button onClick={speak}>Luister</button>
        </header>

        <section className={styles.stageArea}>
          <div className={styles.avatarPanel}>
            <div className={styles.avatar}>{scene.speaker === "Tutor" ? "T" : "I"}</div>
            <strong>{scene.speaker}</strong>
            <small>Definitieve avatarvideo komt hier</small>
          </div>

          <div className={styles.canvas}>
            <div className={styles.trigger}>Trigger</div>
            <div className={styles.flow}>
              {stages.map((stage, index) => (
                <div key={stage.name} className={`${styles.valueStage} ${index < scene.visibleStages ? styles.visible : ""}`}>
                  <small>Value stage {index + 1}</small>
                  <strong>{stage.name}</strong>
                  {scene.showCapabilities ? <span>{stage.capability}</span> : null}
                </div>
              ))}
            </div>
            <div className={styles.outcome}>Gewenste uitkomst</div>
          </div>
        </section>

        <section className={styles.dialogue}>
          <strong>{scene.speaker}</strong><p>{scene.text}</p>
        </section>

        {scene.quiz ? (
          <section className={styles.quiz}>
            <h3>Welke optie beschrijft het beste de trigger?</h3>
            {options.map((option) => (
              <button key={option} className={answer === option ? styles.selected : undefined} onClick={() => setAnswer(option)}>{option}</button>
            ))}
            {answer ? (
              <p className={`${styles.feedback} ${answer !== options[0] ? styles.incorrect : ""}`}>
                {answer === options[0]
                  ? "Correct. De trigger is de gebeurtenis of behoefte waardoor de waardestroom start."
                  : "Niet helemaal. Deze gebeurtenis vindt binnen of na de waardestroom plaats en is dus niet de aanleiding waardoor de waardecreatie start."}
              </p>
            ) : null}
          </section>
        ) : null}

        <footer className={styles.controls}>
          <button disabled={sceneIndex === 0} onClick={() => go(sceneIndex - 1)}>Vorige</button>
          <span>{sceneIndex + 1} / {scenes.length}</span>
          <button disabled={sceneIndex === scenes.length - 1} onClick={() => go(sceneIndex + 1)}>Volgende</button>
        </footer>
      </main>
    </div>
  );
}
