"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule2 } from "../../../lib/solution-architecture-module-2";

function AssignmentCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;

  if (mode === "assignment-anatomy") {
    return <section className={styles.visual} aria-label="Onderdelen van een werkbare architectuuropdracht">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Opdrachtcheck</p><h3>Wat moet helder zijn vóór ontwerpen?</h3></div><span>nog geen oplossing</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Resultaat</strong><span>Welke uitkomst moet de verandering bereiken?</span></div>
        <div className={styles.visualCard}><strong>Scope</strong><span>Wat valt er wel, niet en later onder?</span></div>
        <div className={styles.visualCard}><strong>Randvoorwaarden</strong><span>Welke grenzen liggen daadwerkelijk vast?</span></div>
        <div className={styles.visualCard}><strong>Open punten</strong><span>Welke informatie of beslissing ontbreekt nog?</span></div>
      </div>
    </section>;
  }

  if (mode === "question-behind-question") {
    return <section className={styles.visual} aria-label="Vraag achter de vraag">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Doel versus middel</p><h3>Waarom wil Middelveen digitaliseren?</h3></div><span>onderzoek het werkelijke resultaat</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Middel</strong><span>Maak de aanvraag digitaal.</span></div>
        <div className={styles.visualCard}><strong>Mogelijk doel</strong><span>Minder telefoontjes naar het klantcontactcentrum.</span></div>
        <div className={styles.visualCard}><strong>Architectuurvraag</strong><span>Welke uitkomst moet de oplossing aantoonbaar ondersteunen?</span></div>
      </div>
    </section>;
  }

  if (mode === "scope-canvas") {
    return <section className={styles.visual} aria-label="Scope in uit en later">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Scopebord</p><h3>In · uit · later</h3></div><span>buiten scope verdwijnt niet</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>In</strong><span>Onderdeel van deze oplossingsopdracht.</span></div>
        <div className={styles.visualCard}><strong>Uit</strong><span>Bewust elders belegd, inclusief eigenaar en afhankelijkheid.</span></div>
        <div className={styles.visualCard}><strong>Later</strong><span>Niet nu oplossen, maar moment of voorwaarde voor vervolg vastleggen.</span></div>
      </div>
    </section>;
  }

  if (mode === "assumption-register") {
    return <section className={styles.visual} aria-label="Register voor aannames en open punten">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Aannamecheck</p><h3>Wat weten we nog niet zeker?</h3></div><span>expliciet maken vóór ontwerp</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Uitspraak</strong><span>“De burger volgt de status online.”</span></div>
        <div className={styles.visualCard}><strong>Verborgen aannames</strong><span>Status bestaat, digitaal kanaal bestaat en doelgroep kan het gebruiken.</span></div>
        <div className={styles.visualCard}><strong>Actie</strong><span>Bevestigen, corrigeren of als open beslissing beleggen.</span></div>
      </div>
    </section>;
  }

  return <section className={styles.visual} aria-label="Verschil tussen eis randvoorwaarde en aanname">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>Type uitspraak</p><h3>Eis · randvoorwaarde · aanname</h3></div><span>niet door elkaar halen</span></div>
    <div className={styles.alwaysCards}>
      <div className={styles.visualCard}><strong>Eis</strong><span>Waaraan moet de uitkomst of oplossing voldoen?</span></div>
      <div className={styles.visualCard}><strong>Randvoorwaarde</strong><span>Welke grens van de oplossingsruimte ligt vast?</span></div>
      <div className={styles.visualCard}><strong>Aanname</strong><span>Waar gaan we voorlopig van uit maar moet nog bevestigd worden?</span></div>
    </div>
  </section>;
}

export default function AdaptiveModule2Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule2}
    apiBase="/api/adaptive/solution-architecture-module-2"
    caseIntro="Je weet nu welke rol je als solution architect hebt. Middelveen geeft je vervolgens een veranderopgave. Voordat je gaat ontwerpen toets je of resultaat, scope, aannames, randvoorwaarden en ontbrekende beslissingen voldoende helder zijn."
    courseHref={courseHref}
    renderVisual={(mode) => <AssignmentCanvas mode={mode} />}
  />;
}
