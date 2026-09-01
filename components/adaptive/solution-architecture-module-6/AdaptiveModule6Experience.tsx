"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule6 } from "../../../lib/solution-architecture-module-6-definition";
import {
  adrSections,
  alternatives,
  attributes,
  interventions,
} from "../../../lib/solution-architecture-module-6";

type Props = {
  courseHref?: string;
  showReviewDetails?: boolean;
};

function Module6DecisionCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;
  const visual = interventions[mode]?.visual;
  if (!visual) return null;

  const visibleAlternatives = alternatives.slice(0, visual.visibleAlternatives);
  const visibleAttributes = attributes.slice(0, visual.visibleAttributes);

  return <section className={styles.visual} aria-label="Afwegingsbord Gemeente Middelveen">
    <div className={styles.visualHeader}>
      <div><p className={styles.kicker}>Afwegingsbord</p><h3>Alternatieven en besliscriteria</h3></div>
      <span>Module 6</span>
    </div>

    {visibleAlternatives.length ? <>
      <div className={styles.visualGrid}>
        {visibleAlternatives.map((alternative, index) => <article className={styles.visualCard} key={alternative}>
          <strong>{index + 1}. {alternative}</strong>
          <p>{visibleAttributes.length
            ? `${visibleAttributes.join(" · ")} — ${visual.showTradeoffs ? "te beoordelen" : "wordt later afgewogen"}`
            : "De relevante besliscriteria worden in deze stap verder opgebouwd."}</p>
        </article>)}
      </div>
      <div className={styles.mobileCards}>
        {visibleAlternatives.map((alternative, index) => <article className={styles.visualCard} key={alternative}>
          <strong>{index + 1}. {alternative}</strong>
          {visibleAttributes.map((attribute) => <p key={attribute}><b>{attribute}:</b> {visual.showTradeoffs ? "te beoordelen" : "komt later"}</p>)}
        </article>)}
      </div>
    </> : <p>De afweging wordt tijdens deze route stap voor stap opgebouwd.</p>}

    {visual.showTradeoffs ? <p>De cellen krijgen bewust nog geen fictieve win/verlies-score. Waardering volgt pas nadat de afweging inhoudelijk is onderbouwd.</p> : null}

    {visual.adrSectionsVisible.length ? <div className={styles.visual} aria-label="ADR-opbouw">
      <p className={styles.kicker}>ADR-kaart</p>
      <div className={styles.visualGrid}>
        {adrSections.map((section) => {
          const visible = visual.adrSectionsVisible.includes(section);
          const weak = visual.highlightWeakLink === section;
          return <div className={styles.visualCard} key={section}>
            <strong>{section}</strong>
            <span>{weak ? "extra aandacht" : visible ? "opgebouwd" : "komt later"}</span>
          </div>;
        })}
      </div>
      <div className={styles.mobileCards}>
        {adrSections.map((section) => <div className={styles.visualCard} key={section}>
          <strong>{section}</strong>
          <span>{visual.highlightWeakLink === section ? "extra aandacht" : visual.adrSectionsVisible.includes(section) ? "opgebouwd" : "komt later"}</span>
        </div>)}
      </div>
    </div> : null}
  </section>;
}

export default function AdaptiveModule6Experience({ courseHref, showReviewDetails = false }: Props) {
  return <>
    <AdaptiveModuleExperience
      definition={solutionArchitectureModule6}
      apiBase="/api/adaptive/solution-architecture-module-6"
      caseIntro="Je werkt voor de fictieve Gemeente Middelveen. De gemeente wil statusinformatie rond gevoelige keuringsgegevens goed organiseren en moet daarbij verschillende oplossingsrichtingen afwegen."
      courseHref={courseHref}
      renderVisual={(mode) => <Module6DecisionCanvas mode={mode} />}
    />
    {showReviewDetails ? <p className={styles.srOnly}>QA-harness: Module 6 gebruikt dezelfde generieke adaptive runtime als de standaard leerroute.</p> : null}
  </>;
}
