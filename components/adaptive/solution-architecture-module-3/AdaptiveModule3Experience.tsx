"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule3 } from "../../../lib/solution-architecture-module-3";

function StakeholderCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;

  if (mode === "stakeholder-radar") {
    return <section className={styles.visual} aria-label="Stakeholderradar">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Stakeholderradar</p><h3>Kijk verder dan de vergadertafel</h3></div><span>invloed · gebruik · beheer · gevolgen</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Aan tafel</strong><span>Opdrachtgever, klantcontactcentrum, keuringsinstantie, privacy en IT.</span></div>
        <div className={styles.visualCard}><strong>Niet vanzelf aanwezig</strong><span>Bijvoorbeeld de burger of gemachtigde die de dienst daadwerkelijk gebruikt.</span></div>
        <div className={styles.visualCard}><strong>Controle</strong><span>Wie gebruikt, beheert, beïnvloedt of ondervindt gevolgen van de oplossing?</span></div>
      </div>
    </section>;
  }

  if (mode === "wish-to-requirement") {
    return <section className={styles.visual} aria-label="Van stakeholderwens naar toetsbare eis">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Eisenkaart</p><h3>Van wens naar controleerbaar criterium</h3></div><span>Module 4 verdiept kwaliteit</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Wens</strong><span>“De aanvraag moet snel gaan.”</span></div>
        <div className={styles.visualCard}><strong>Meetobject</strong><span>Wat wordt beoordeeld: bijvoorbeeld doorlooptijd van een volledige aanvraag.</span></div>
        <div className={styles.visualCard}><strong>Norm</strong><span>Welke grens maakt duidelijk of aan de eis is voldaan?</span></div>
        <div className={styles.visualCard}><strong>Context</strong><span>Wanneer begint/eindigt de meting of onder welke omstandigheden geldt hij?</span></div>
      </div>
    </section>;
  }

  if (mode === "interest-conflict") {
    return <section className={styles.visual} aria-label="Botsende stakeholderbelangen">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Belangenconflict</p><h3>Meer informatie versus minder gegevensdeling</h3></div><span>conflict zichtbaar maken</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Klantcontactcentrum</strong><span>Wil voldoende statusdetails om burgers te helpen.</span></div>
        <div className={styles.visualCard}><strong>Privacy</strong><span>Wil gegevensdeling beperken tot wat noodzakelijk is.</span></div>
        <div className={styles.visualCard}><strong>Architect</strong><span>Maakt opties en gevolgen expliciet; claimt niet automatisch de businessprioriteit.</span></div>
      </div>
    </section>;
  }

  return <section className={styles.visual} aria-label="Beslisbare patstelling">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>Beslisroute</p><h3>Maak een patstelling beslisbaar</h3></div><span>niet stil oplossen</span></div>
    <div className={styles.alwaysCards}>
      <div className={styles.visualCard}><strong>1 · Botsing</strong><span>Welke twee legitieme eisen sluiten elkaar uit?</span></div>
      <div className={styles.visualCard}><strong>2 · Opties</strong><span>Welke oplossingsrichtingen zijn nog mogelijk?</span></div>
      <div className={styles.visualCard}><strong>3 · Consequenties</strong><span>Wat wint en verliest iedere stakeholder per optie?</span></div>
      <div className={styles.visualCard}><strong>4 · Besliseigenaar</strong><span>Wie heeft het mandaat om de belangen te prioriteren?</span></div>
    </div>
  </section>;
}

export default function AdaptiveModule3Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule3}
    apiBase="/api/adaptive/solution-architecture-module-3"
    caseIntro="De opdracht van Middelveen is nu scherper. Je brengt vervolgens in beeld wie door de oplossing wordt geraakt, vertaalt stakeholderwensen naar toetsbare eisen en maakt botsende belangen beslisbaar. Module 4 verdiept daarna welke kwaliteitsattributen achter zulke eisen kunnen liggen."
    courseHref={courseHref}
    renderVisual={(mode) => <StakeholderCanvas mode={mode} />}
  />;
}
