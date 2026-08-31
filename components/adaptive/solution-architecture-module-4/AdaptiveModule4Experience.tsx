"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule4 } from "../../../lib/solution-architecture-module-4";

const qualityCharacteristics = [
  ["Functional suitability", "Past de functionaliteit bij het beoogde doel?"],
  ["Performance efficiency", "Tijd, capaciteit en middelen."],
  ["Compatibility", "Kan de oplossing naast en met andere producten werken?"],
  ["Interaction capability", "Kan de gebruiker de oplossing begrijpen en bedienen?"],
  ["Reliability", "Blijft de oplossing correct functioneren en herstellen?"],
  ["Security", "Beschermt de oplossing informatie en toegang?"],
  ["Maintainability", "Hoe goed is de oplossing te analyseren, wijzigen en testen?"],
  ["Flexibility", "Hoe goed kan de oplossing zich aanpassen of worden vervangen/overgezet?"],
  ["Safety", "Hoe beperkt de oplossing onaanvaardbare risico's op schade?"],
] as const;

function QualityAttributeCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;

  if (mode === "quality-vs-function") {
    return <section className={styles.visual} aria-label="Functie versus kwaliteitsattribuut">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Kwaliteitslens</p><h3>Wat moet het doen — en hoe goed?</h3></div><span>Module 4</span></div>
      <div className={styles.mobileCards}>
        <div className={styles.visualCard}><strong>Functioneel</strong><span>De burger kan de actuele status van zijn aanvraag bekijken.</span></div>
        <div className={styles.visualCard}><strong>Kwaliteit</strong><span>95% van de statuspagina's opent binnen 2 seconden bij de afgesproken piekbelasting.</span></div>
      </div>
    </section>;
  }

  if (mode === "quality-scenario-builder") {
    return <section className={styles.visual} aria-label="Meetbare kwaliteitseis">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Van wens naar norm</p><h3>Maak kwaliteit toetsbaar</h3></div><span>context + maat + norm</span></div>
      <div className={styles.mobileCards}>
        <div className={styles.visualCard}><strong>1 · Onderwerp</strong><span>Welke werking of eigenschap beoordeel je?</span></div>
        <div className={styles.visualCard}><strong>2 · Context</strong><span>Wanneer, voor wie of onder welke belasting geldt de eis?</span></div>
        <div className={styles.visualCard}><strong>3 · Maat</strong><span>Wat meet je: tijd, percentage, capaciteit, herstelduur…?</span></div>
        <div className={styles.visualCard}><strong>4 · Norm</strong><span>Welke grens maakt voldoende en onvoldoende onderscheidbaar?</span></div>
      </div>
    </section>;
  }

  if (mode === "quality-tension") {
    return <section className={styles.visual} aria-label="Spanning tussen kwaliteitsattributen">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Spanningsveld</p><h3>Langer ingelogd blijven</h3></div><span>geen automatische winnaar</span></div>
      <div className={styles.mobileCards}>
        <div className={styles.visualCard}><strong>Interaction capability ↑</strong><span>Minder onderbrekingen en minder herhaald inloggen.</span></div>
        <div className={styles.visualCard}><strong>Security-risico ↑</strong><span>Een onbeheerde sessie blijft langer bruikbaar voor misbruik.</span></div>
      </div>
    </section>;
  }

  if (mode === "quality-priority") {
    return <section className={styles.visual} aria-label="Prioriteren van kwaliteitsattributen">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Context bepaalt prioriteit</p><h3>Middelveen — ontwerpsturende kenmerken</h3></div><span>voorbeeld, geen vaste ranglijst</span></div>
      <div className={styles.mobileCards}>
        <div className={styles.visualCard}><strong>Security</strong><span>Gevoelige keuringsgegevens en autorisatie.</span></div>
        <div className={styles.visualCard}><strong>Reliability / availability</strong><span>Statusinzage en afhankelijkheid van gekoppelde systemen.</span></div>
        <div className={styles.visualCard}><strong>Performance efficiency</strong><span>Responsiviteit van online aanvraag en status.</span></div>
        <div className={styles.visualCard}><strong>Maintainability</strong><span>Wijzigbaarheid van koppelingen en oplossingsonderdelen.</span></div>
      </div>
    </section>;
  }

  return <section className={styles.visual} aria-label="ISO IEC 25010 2023 kwaliteitsmodel">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>ISO/IEC 25010:2023</p><h3>Negen hoofdkenmerken als begrippenkaart</h3></div><span>Edition 2</span></div>
    <div className={styles.mobileCards}>
      {qualityCharacteristics.map(([name, description]) => <div className={styles.visualCard} key={name}><strong>{name}</strong><span>{description}</span></div>)}
    </div>
  </section>;
}

export default function AdaptiveModule4Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule4}
    apiBase="/api/adaptive/solution-architecture-module-4"
    caseIntro="Gemeente Middelveen wil de digitale aanvraag en statusinzage goed ontwerpen. Jij maakt kwaliteitswensen expliciet, meetbaar en ontwerpsturend voordat je in latere modules modellen en trade-offs gaat beoordelen."
    courseHref={courseHref}
    renderVisual={(mode) => <QualityAttributeCanvas mode={mode} />}
  />;
}
