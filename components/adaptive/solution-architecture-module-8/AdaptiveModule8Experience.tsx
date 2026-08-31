"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule8 } from "../../../lib/solution-architecture-module-8";

function GovernanceCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;

  if (mode === "principle-rule-standard" || mode === "principle-quality") {
    return <section className={styles.visual} aria-label="Principe regel en standaard vergelijken">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Toetsingskader</p><h3>Wat stuurt en wat schrijft voor?</h3></div><span>maak het verschil expliciet</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Principe</strong><span>Geeft richting bij ontwerpafwegingen en maakt voorkeursgedrag zichtbaar.</span></div>
        <div className={styles.visualCard}><strong>Regel</strong><span>Schrijft een uitkomst of grens veel directer voor.</span></div>
        <div className={styles.visualCard}><strong>Bruikbaarheid</strong><span>Kan een reviewer er daadwerkelijk een ontwerpkeuze mee toetsen?</span></div>
        <div className={styles.visualCard}><strong>Afwijking</strong><span>Welke onderbouwing is nodig wanneer context om een uitzondering vraagt?</span></div>
      </div>
    </section>;
  }

  if (mode === "review-flow") {
    return <section className={styles.visual} aria-label="Architectuurreview als toetsbaar gesprek">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Reviewflow</p><h3>Van bezwaar naar onderbouwd besluit</h3></div><span>geen stempelprocedure</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>1 · Kader</strong><span>Welke eis, regel of welk principe is relevant?</span></div>
        <div className={styles.visualCard}><strong>2 · Ontwerp</strong><span>Hoe gaat de voorgestelde oplossing met dat kader om?</span></div>
        <div className={styles.visualCard}><strong>3 · Onderbouwing</strong><span>Waarom is gekozen voor deze richting of afwijking?</span></div>
        <div className={styles.visualCard}><strong>4 · Consequenties</strong><span>Welke effecten en voorwaarden worden bewust geaccepteerd?</span></div>
      </div>
    </section>;
  }

  if (mode === "deviation-record") {
    return <section className={styles.visual} aria-label="Vastleggen van een architectuurafwijking">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Afwijkingsrecord</p><h3>Tijdelijk moet bestuurbaar blijven</h3></div><span>bewuste uitzondering</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Reden</strong><span>Waarom is volgen van het principe hier aantoonbaar onwerkbaar?</span></div>
        <div className={styles.visualCard}><strong>Consequenties</strong><span>Welke schuld, risico's of extra beheerlast accepteer je?</span></div>
        <div className={styles.visualCard}><strong>Voorwaarde</strong><span>Wanneer vervalt of verandert de reden voor de uitzondering?</span></div>
        <div className={styles.visualCard}><strong>Herbeoordeling</strong><span>Wie beoordeelt opnieuw en op welk moment?</span></div>
      </div>
    </section>;
  }

  return <section className={styles.visual} aria-label="Een ontwerp onderbouwd verdedigen">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>Ontwerpverdediging</p><h3>Geen voorkeur, maar toetsbare redenering</h3></div><span>kader · context · consequentie</span></div>
    <div className={styles.alwaysCards}>
      <div className={styles.visualCard}><strong>Kader</strong><span>Welke eis of welk principe stuurt de keuze?</span></div>
      <div className={styles.visualCard}><strong>Context</strong><span>Welke specifieke situatie maakt deze keuze relevant?</span></div>
      <div className={styles.visualCard}><strong>Alternatief</strong><span>Welke serieuze andere richting is overwogen?</span></div>
      <div className={styles.visualCard}><strong>Consequentie</strong><span>Waarom is deze trade-off verdedigbaar?</span></div>
    </div>
  </section>;
}

export default function AdaptiveModule8Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule8}
    apiBase="/api/adaptive/solution-architecture-module-8"
    caseIntro="Je hebt inmiddels ontwerp- en integratiekeuzes voor Middelveen onderbouwd. Nu verschuift je rol: je leert een ontwerp tegen expliciete principes en eisen te toetsen, een afwijking inhoudelijk te beoordelen en je eigen ontwerp zonder voorkeurstaal te verdedigen."
    courseHref={courseHref}
    renderVisual={(mode) => <GovernanceCanvas mode={mode} />}
  />;
}
