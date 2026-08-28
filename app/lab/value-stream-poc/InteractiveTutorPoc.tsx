"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { valueStages, valueStreamContent, valueStreamLesson, type Speaker, type VisualState } from "./lesson-manifest";
import styles from "./poc.module.css";

const DEFAULT_VISUAL_STATE: VisualState = {
  visibleStages: 0,
  showCapabilities: false,
};

function speakerName(speaker: Speaker) {
  return speaker === "alexander" ? "Alexander" : "Eva";
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `0:${String(seconds).padStart(2, "0")}`;
}

export default function InteractiveTutorPoc() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

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
    const controller = new AbortController();
    videoRef.current?.pause();
    setPlaying(false);
    setElapsedMs(0);
    setMediaSrc(null);
    setMediaError(null);

    if (!scene.media) return () => controller.abort();

    async function loadMedia() {
      try {
        const response = await fetch(`/api/lab/value-stream-video/${encodeURIComponent(scene.id)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || typeof data.url !== "string") {
          setMediaError("De beveiligde avatarvideo kon niet worden geladen.");
          return;
        }
        setMediaSrc(data.url);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMediaError("De beveiligde avatarvideo kon niet worden geladen.");
      }
    }

    void loadMedia();
    return () => controller.abort();
  }, [scene.id, scene.media]);

  useEffect(() => {
    if (!playing || !mediaSrc) return;

    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      if (!video) return;
      setElapsedMs(Math.min(scene.durationMs, video.currentTime * 1000));
      if (!video.paused && !video.ended) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing, mediaSrc, scene.durationMs]);

  useEffect(() => {
    if (!playing || scene.media) return;

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
  }, [playing, scene.durationMs, scene.media]);

  function go(index: number) {
    videoRef.current?.pause();
    setSceneIndex(Math.max(0, Math.min(valueStreamLesson.length - 1, index)));
    setAnswerIndex(null);
    setElapsedMs(0);
    setPlaying(false);
  }

  async function toggleScene() {
    if (!scene.media) {
      setElapsedMs(0);
      setPlaying((current) => !current);
      return;
    }

    const video = videoRef.current;
    if (!video || !mediaSrc) return;

    if (!video.paused && !video.ended) {
      video.pause();
      return;
    }

    if (video.ended || video.currentTime * 1000 >= scene.durationMs - 100) {
      video.currentTime = 0;
      setElapsedMs(0);
    }

    try {
      await video.play();
    } catch {
      setMediaError("De browser blokkeerde het afspelen van de video. Gebruik de afspeelknop in de videoplayer.");
    }
  }

  const currentSpeaker = speakerName(scene.speaker);
  const sceneProgress = Math.min(100, Math.round((elapsedMs / scene.durationMs) * 100));
  const exercise = scene.exercise;
  const mediaLoading = Boolean(scene.media && !mediaSrc && !mediaError);
  const resumable = elapsedMs > 150 && elapsedMs < scene.durationMs - 150;
  const playLabel = mediaLoading ? "Video laden…" : playing ? "Pauzeer" : resumable ? "Hervat" : "Speel scène";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.kicker}>EAW Learning Lab</p>
        <h1>{valueStreamContent.title}</h1>
        <p className={styles.meta}>Interactieve tutor · echte avatarvideo · {valueStreamContent.exampleLabel}</p>
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
            <button disabled={mediaLoading || Boolean(mediaError)} onClick={toggleScene} type="button">{playLabel}</button>
          </div>
        </header>

        <div className={styles.sceneTimeline} aria-label={`Scènevoortgang ${sceneProgress}%`}>
          <span style={{ width: `${sceneProgress}%` }} />
        </div>

        <section className={styles.stageArea}>
          <div className={styles.avatarPanel}>
            {mediaSrc ? (
              <video
                key={mediaSrc}
                ref={videoRef}
                className={styles.avatarVideo}
                controls
                playsInline
                preload="metadata"
                src={mediaSrc}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(event) => setElapsedMs(Math.min(scene.durationMs, event.currentTarget.currentTime * 1000))}
                onSeeked={(event) => setElapsedMs(Math.min(scene.durationMs, event.currentTarget.currentTime * 1000))}
                onEnded={() => {
                  setElapsedMs(scene.durationMs);
                  setPlaying(false);
                }}
                onError={() => setMediaError("De avatarvideo kan niet worden afgespeeld.")}
              >
                Je browser ondersteunt deze video niet.
              </video>
            ) : (
              <div className={styles.avatar}>{scene.speaker === "alexander" ? "A" : "E"}</div>
            )}
            <strong>{currentSpeaker}</strong>
            <small>{mediaLoading ? "Beveiligde video wordt geladen…" : "Video en visualisatie lopen op dezelfde tijdlijn."}</small>
            {mediaError ? <p className={styles.mediaError}>{mediaError}</p> : null}
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
