"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule1 } from "../../../lib/solution-architecture-module-1";

function RoleCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;

  if (mode === "role-map") {
    return <section className={styles.visual} aria-label="Architectuurrollen en hun focus">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Rolkaart</p><h3>Welke vraag hoort waar?</h3></div><span>werkmodel voor deze cursus</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Business</strong><span>Welke dienstverlening en welk businessvermogen zijn nodig?</span></div>
        <div className={styles.visualCard}><strong>Enterprise</strong><span>Welke richting en samenhang gelden voor het bredere landschap?</span></div>
        <div className={styles.visualCard}><strong>Solution</strong><span>Hoe vormt de veranderopgave één samenhangende oplossing over grenzen heen?</span></div>
        <div className={styles.visualCard}><strong>Software</strong><span>Hoe wordt de interne softwarestructuur ontworpen?</span></div>
      </div>
    </section>;
  }

  if (mode === "decision-boundary") {
    return <section className={styles.visual} aria-label="Beslisgrens van de solution architect">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Beslisgrens</p><h3>Van dienstverlening naar implementatiedetail</h3></div><span>zoek de oplossingsbrede keuze</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Businesskeuze</strong><span>Stoppen we met de papieren aanvraag?</span></div>
        <div className={styles.visualCard}><strong>Solutionkeuze</strong><span>Hoe wisselen systemen keuringsuitslag en status uit?</span></div>
        <div className={styles.visualCard}><strong>Teamkeuze</strong><span>Welk lokaal testframework gebruikt één ontwikkelteam?</span></div>
      </div>
    </section>;
  }

  if (mode === "mandate-influence") {
    return <section className={styles.visual} aria-label="Mandaat en invloed">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Mandaat ≠ invloed</p><h3>Niet beslissen betekent niet niets doen</h3></div><span>consequenties maken invloedbaar</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Gegeven kader</strong><span>Een landelijke voorziening is voorgeschreven.</span></div>
        <div className={styles.visualCard}><strong>Jouw analyse</strong><span>Maak impact, risico's, afhankelijkheden en haalbaarheid zichtbaar.</span></div>
        <div className={styles.visualCard}><strong>Terugleggen</strong><span>Breng onaanvaardbare knelpunten naar de eigenaar van de keuze.</span></div>
      </div>
    </section>;
  }

  return <section className={styles.visual} aria-label="Conflict tussen architectuurrollen">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>Belangenconflict</p><h3>Twee tijdshorizonnen</h3></div><span>maak gevolgen expliciet</span></div>
    <div className={styles.alwaysCards}>
      <div className={styles.visualCard}><strong>Project</strong><span>Binnen drie maanden aantoonbare waarde leveren.</span></div>
      <div className={styles.visualCard}><strong>Landschap</strong><span>Structurele samenhang en beheersbaarheid verbeteren.</span></div>
      <div className={styles.visualCard}><strong>Solution architect</strong><span>Laat zien wat elke richting nu én later veroorzaakt.</span></div>
    </div>
  </section>;
}

export default function AdaptiveModule1Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule1}
    apiBase="/api/adaptive/solution-architecture-module-1"
    caseIntro="Je stapt als solution architect in bij de fictieve Gemeente Middelveen. Voordat je een ontwerpvraag kunt oppakken, moet helder zijn welke beslissingen bij jouw rol horen, waar jouw mandaat stopt en hoe je invloed houdt wanneer andere architectuurrollen richting geven."
    courseHref={courseHref}
    renderVisual={(mode) => <RoleCanvas mode={mode} />}
  />;
}
