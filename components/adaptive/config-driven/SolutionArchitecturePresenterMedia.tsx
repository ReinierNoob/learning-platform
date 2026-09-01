"use client";

import {
  getSolutionArchitecturePresenterTranscript,
  type SolutionArchitecturePresenterPersona,
} from "../../../lib/solution-architecture-presenter-transcripts";
import styles from "./presenter-media.module.css";

type Props = {
  moduleId: number;
  persona: SolutionArchitecturePresenterPersona;
};

export default function SolutionArchitecturePresenterMedia({ moduleId, persona }: Props) {
  const presenter = getSolutionArchitecturePresenterTranscript(moduleId, persona);
  if (!presenter) return null;

  const name = persona === "eva" ? "Eva" : "Alexander";
  const videoSrc = `/api/presenter-media/${moduleId}/${persona}`;
  const captionsSrc = `/api/presenter-media/${moduleId}/${persona}?type=captions`;
  const headingId = `presenter-${moduleId}-${persona}-heading`;

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>{presenter.role}</p>
          <h2 id={headingId}>{name}</h2>
        </div>
        <p className={styles.note}>Video is aanvullend. De essentiële leerstof staat ook als tekst in de module.</p>
      </div>

      <div className={styles.videoFrame}>
        <video className={styles.video} controls playsInline preload="metadata">
          <source src={videoSrc} type="video/mp4" />
          <track kind="captions" src={captionsSrc} srcLang="nl" label="Nederlands" default />
          Je browser ondersteunt deze video niet. Gebruik het transcript hieronder.
        </video>
      </div>

      <details className={styles.transcript}>
        <summary>Lees transcript van {name}</summary>
        <p>{presenter.transcript}</p>
      </details>
    </section>
  );
}
