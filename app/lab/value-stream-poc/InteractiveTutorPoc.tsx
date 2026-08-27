"use client";

import { useEffect, useMemo, useState } from "react";
import { valueStages, valueStreamContent, valueStreamLesson, type Speaker, type VisualState } from "./lesson-manifest";
import styles from "./poc.module.css";

const DEFAULT_VISUAL_STATE: VisualState = {
  visibleStages: 0,
  showCapabilities: false,
};

function speakerName(speaker: Speaker) {
  return speaker === "alexander" ? "Alexander" : "Interviewer";
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `0:${String(seconds).padStart(2, "0")}`;
}

export default function InteractiveTutorPoc() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(false);

  const scene = valueStreamLesson[sceneIndex];
  const progress = useMemo(
    () => Math.round(((sceneIndex + 1) / valueStreamLesson.length) * 100),
    [sceneIndex],
  );

  const visualState = useMemo(() => {
    let state = DEFAULT_VISUAL_STATE;
    for (const cue of scene.visualCues) {
      if (cue.atMs > elapsedMs) break;
      state = cue;
    }
    return state;
  }, [elapsedMs, scene]);

  useEffect(() => {
    if (!playing) return;

    const startedAt = Date.now() - elapsedMs;
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min(scene.durationMs, Date.now() - startedAt);
      setElapsedMs(nextElapsed);
      if (nextElapsed >= scene.durationMs) {
        window.clearInterval(timer);
        setPlaying(false);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [playing, scene.durationMs]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function go(index: number) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSceneIndex(Math.max(0, Math.min(valueStreamLesson.length - 1, index)));
    setAnswerIndex(null);
    setElapsedMs(0);
    setPlaying(false);
  }

  function speakTranscript() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(scene.transcript);
    utterance.lang = "nl-NL";
    utterance.rate = scene.speaker === "alexander" ? 0.92 : 1.02;
    utterance.pitch = scene.speaker === "alexander" ? 0.92 : 1.08;
    window.speechSynthesis.speak(utterance);
  }

  function playScene() {
    setElapsedMs(0);
    setPlaying(true);
    speakTranscript();
  }

  const currentSpeaker = speakerName(scene.speaker);
  const sceneProgress = Math.min(100, Math.round((elapsedMs / scene.durationMs) * 100));
  const exercise = scene.exercise;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.kicker}>EAW Learning Lab</p>
        <h1>{valueStreamContent.title}</h1>
        <p className={styles.meta}>Interactieve tutor · timeline PoC · {valueStreamContent.exampleLabel}</p>
        <div className={styles.progress} aria-label={`Lesvoortgang ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <nav className={styles.sceneNav} aria-label="Lesonderdelen">
          {valueStreamLesson.map((item, index) => (
            <button
              key={item.id}
              className={index === sceneIndex ? styles.active : undefined}
              onClick={() => go(index)}
              type="button"
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <span>{currentSpeaker}</span>
            <h2>{scene.title}</h2>
          </div>
          <div className={styles.playControls}>
            <span className={styles.timecode}>{formatTime(elapsedMs)} / {formatTime(scene.durationMs)}</span>
            <button onClick={playScene} type="button">{playing ? "Herstart scène" : "Speel scène"}</button>
          </div>
        </header>

        <div className={styles.sceneTimeline} aria-label={`Scènevoortgang ${sceneProgress}%`}>
          <span style={{ width: `${sceneProgress}%` }} />
        </div>

        <section className={styles.stageArea}>
          <div className={styles.avatarPanel}>
            <div className={styles.avatar}>{scene.speaker === "alexander" ? "A" : "I"}</div>
            <strong>{currentSpeaker}</strong>
            <small>Avatarvideo kan hier dezelfde timeline aansturen</small>
          </div>

          <div className={styles.canvas}>
            <p className={styles.exampleLabel}>{valueStreamContent.exampleLabel}</p>
            <div className={styles.trigger}>Trigger · {valueStreamContent.triggerLabel}</div>
            <div className={styles.flow}>
              {valueStages.map((stage, index) => (
                <div
                  key={stage.name}
                  className={`${styles.valueStage} ${index < visualState.visibleStages ? styles.visible : ""}`}
                >
                  <small>Value stage {index + 1}</small>
                  <strong>{stage.name}</strong>
                  {visualState.showCapabilities && stage.capability ? <span>{stage.capability}</span> : null}
                </div>
              ))}
            </div>
            <div className={styles.outcome}>Gewenste uitkomst · {valueStreamContent.outcomeLabel}</div>
          </div>
        </section>

        <section className={styles.dialogue}>
          <strong>{currentSpeaker}</strong>
          <p>{scene.transcript}</p>
        </section>

        {exercise ? (
          <section className={styles.quiz}>
            <h3>{exercise.question}</h3>
            {exercise.options.map((option, index) => (
              <button
                key={option}
                className={answerIndex === index ? styles.selected : undefined}
                onClick={() => setAnswerIndex(index)}
                type="button"
              >
                {option}
              </button>
            ))}
            {answerIndex !== null ? (
              <p className={`${styles.feedback} ${answerIndex !== exercise.correctIndex ? styles.incorrect : ""}`}>
                {answerIndex === exercise.correctIndex ? exercise.feedbackCorrect : exercise.feedbackIncorrect}
              </p>
            ) : null}
          </section>
        ) : null}

        <footer className={styles.controls}>
          <button disabled={sceneIndex === 0} onClick={() => go(sceneIndex - 1)} type="button">Vorige</button>
          <span>{sceneIndex + 1} / {valueStreamLesson.length}</span>
          <button disabled={sceneIndex === valueStreamLesson.length - 1} onClick={() => go(sceneIndex + 1)} type="button">Volgende</button>
        </footer>
      </main>
    </div>
  );
}
