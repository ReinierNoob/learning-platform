"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule9 } from "../../../lib/solution-architecture-module-9";

function MigrationCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;

  if (mode === "migration-states") {
    return <section className={styles.visual} aria-label="Migratie van huidige situatie via waardevolle tussenstappen naar doel">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Migratiepad</p><h3>Elke toestand moet bestuurbaar zijn</h3></div><span>waarde per stap</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Huidig</strong><span>De bestaande dienstverlening en afhandeling blijven de vertrekbasis.</span></div>
        <div className={styles.visualCard}><strong>Stap 1</strong><span>Bijvoorbeeld digitale indiening met ongewijzigde interne afhandeling.</span></div>
        <div className={styles.visualCard}><strong>Stap 2</strong><span>Een volgende afgeronde capability zodra afhankelijkheden gereed zijn.</span></div>
        <div className={styles.visualCard}><strong>Doel</strong><span>Het volledige eindbeeld wanneer waarde, risico en afhankelijkheden dat toelaten.</span></div>
      </div>
    </section>;
  }

  if (mode === "dependency-sequence") {
    return <section className={styles.visual} aria-label="Afhankelijkheden bepalen migratievolgorde">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Volgorde</p><h3>Wat moet betrouwbaar werken vóór de volgende stap?</h3></div><span>dependency first</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Identiteit</strong><span>Wie is de burger die toegang vraagt?</span></div>
        <div className={styles.visualCard}><strong>Autorisatie</strong><span>Welke status of gegevens mag die identiteit zien?</span></div>
        <div className={styles.visualCard}><strong>Statusinzage</strong><span>Pas bruikbaar wanneer identiteit en toegang betrouwbaar zijn.</span></div>
        <div className={styles.visualCard}><strong>Isolatie</strong><span>Kleine stappen maken storingsoorzaken en herstel beter te bepalen.</span></div>
      </div>
    </section>;
  }

  if (mode === "parallel-run") {
    return <section className={styles.visual} aria-label="Oud en nieuw tijdelijk parallel laten draaien">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Dubbeldraaien</p><h3>Tijdelijke kosten tegenover overgangsrisico</h3></div><span>bewuste risicokeuze</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Extra kosten</strong><span>Beheer, support, synchronisatie en mogelijk dubbele verwerking.</span></div>
        <div className={styles.visualCard}><strong>Bescherming</strong><span>De oude route blijft beschikbaar wanneer de nieuwe route faalt.</span></div>
        <div className={styles.visualCard}><strong>Eindvoorwaarde</strong><span>Leg vast wanneer voldoende vertrouwen bestaat om oud uit te zetten.</span></div>
      </div>
    </section>;
  }

  return <section className={styles.visual} aria-label="Rollbackbesluit vooraf ontwerpen">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>Rollbackgate</p><h3>Niet op gevoel beslissen tijdens een incident</h3></div><span>drempel · impact · herstel</span></div>
    <div className={styles.alwaysCards}>
      <div className={styles.visualCard}><strong>Drempel</strong><span>Welke meetbare foutgraad of beschikbaarheidsgrens is onacceptabel?</span></div>
      <div className={styles.visualCard}><strong>Impact</strong><span>Welke schade ontstaat voor burgers of dienstverlening?</span></div>
      <div className={styles.visualCard}><strong>Herstelpad</strong><span>Hoe keer je veilig terug en wat gebeurt er met tussentijdse gegevens?</span></div>
      <div className={styles.visualCard}><strong>Besluit</strong><span>Wie mag de vooraf afgesproken rollback activeren?</span></div>
    </div>
  </section>;
}

export default function AdaptiveModule9Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule9}
    apiBase="/api/adaptive/solution-architecture-module-9"
    caseIntro="Het Middelveen-ontwerp is nu inhoudelijk onderbouwd en gereviewd. Module 9 gaat over realisatie: hoe vertaal je het eindbeeld naar zelfstandig waardevolle tussenstappen, laat je afhankelijkheden de volgorde bepalen en ontwerp je dubbeldraaien en rollback als bewuste risicobeheersing?"
    courseHref={courseHref}
    renderVisual={(mode) => <MigrationCanvas mode={mode} />}
  />;
}
