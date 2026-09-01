"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule7 } from "../../../lib/solution-architecture-module-7";

function SystemContextIntegrationMap() {
  return <section className={styles.visual} aria-labelledby="module7-context-heading">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>Systeemcontext</p><h3 id="module7-context-heading">Houd interne structuur achter stabiele grenzen</h3></div><span>Middelveen</span></div>
    <div className={styles.alwaysCards}>
      <div className={styles.visualCard}><strong>Burger → Burgerportaal</strong><span>Digitale aanvraag en persoonlijke statusinzage na betrouwbare identificatie.</span></div>
      <div className={styles.visualCard}><strong>Burgerportaal → Statusinterface</strong><span>Het portaal gebruikt een gepubliceerde afspraak en leest niet rechtstreeks uit interne zaaksysteemtabellen.</span></div>
      <div className={styles.visualCard}><strong>Zaaksysteem ↔ BRP</strong><span>Benodigde brongegevens worden via een expliciete koppeling opgevraagd; uitval hoort bij de beschikbaarheidsanalyse.</span></div>
      <div className={styles.visualCard}><strong>Keuringsinstantie → Gemeente</strong><span>Iedere keuringsuitslag arriveert als afzonderlijke gebeurtenis met bevestiging, logging en herstelgedrag.</span></div>
    </div>
    <p className={styles.feedback}><strong>Ontwerpgrens:</strong> relaties beschrijven de belofte tussen partijen; interne databasestructuur blijft een implementatiedetail van de eigenaar.</p>
  </section>;
}

function LandscapeImpact() {
  return <section className={styles.visual} aria-label="Impact van koppelingen op het applicatielandschap">
    <div className={styles.visualHeader}><div><p className={styles.kicker}>Landschapsimpact</p><h3>Wat kan straks nog zelfstandig veranderen?</h3></div><span>wendbaarheid is onderdeel van de keuze</span></div>
    <div className={styles.alwaysCards}>
      <div className={styles.visualCard}><strong>Afnemers</strong><span>Welke systemen of organisaties vertrouwen al op deze koppeling?</span></div>
      <div className={styles.visualCard}><strong>Interne structuur</strong><span>Welke technische details lekken onnodig naar buiten?</span></div>
      <div className={styles.visualCard}><strong>Belofte</strong><span>Verandert betekenis, timing of foutafhandeling door hergebruik?</span></div>
      <div className={styles.visualCard}><strong>Wijzigingsruimte</strong><span>Welke partij kan daarna niet meer zelfstandig veranderen?</span></div>
    </div>
  </section>;
}

function IntegrationCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;

  if (mode === "integration-patterns" || mode === "pattern-choice") {
    return <section className={styles.visual} aria-label="Koppelvormen vergelijken">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Integratiekeuze</p><h3>Wie bepaalt het moment en wat beloof je?</h3></div><span>vorm volgt behoefte</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Bevragen</strong><span>De ontvanger vraagt informatie wanneer die nodig is.</span></div>
        <div className={styles.visualCard}><strong>Gebeurtenis</strong><span>De verzender meldt een relevante verandering wanneer die optreedt.</span></div>
        <div className={styles.visualCard}><strong>Bestand</strong><span>Gegevens worden gebundeld en op een afgesproken moment uitgewisseld.</span></div>
        <div className={styles.visualCard}><strong>Keuzecriteria</strong><span>Frequentie · tijdigheid · herleidbaarheid · faalgedrag.</span></div>
      </div>
    </section>;
  }

  if (mode === "integration-promise") {
    return <section className={styles.visual} aria-label="Integratie als afspraak tussen partijen">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Koppelcontract</p><h3>Meer dan transport</h3></div><span>techniek realiseert de afspraak</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>Betekenis</strong><span>Welke informatie betekent precies wat?</span></div>
        <div className={styles.visualCard}><strong>Moment</strong><span>Wanneer wordt informatie aangeboden of gevraagd?</span></div>
        <div className={styles.visualCard}><strong>Fouten</strong><span>Wat gebeurt er bij uitval, dubbeling of verlies?</span></div>
        <div className={styles.visualCard}><strong>Eigenaarschap</strong><span>Wie beheert de afspraak en wie mag hem wijzigen?</span></div>
      </div>
    </section>;
  }

  if (mode === "failure-path") {
    return <section className={styles.visual} aria-label="Faalscenario voor een integratie">
      <div className={styles.visualHeader}><div><p className={styles.kicker}>Faalketen</p><h3>Verzonden is nog niet verwerkt</h3></div><span>ontwerp ook het slechte pad</span></div>
      <div className={styles.alwaysCards}>
        <div className={styles.visualCard}><strong>1 · Verzenden</strong><span>De keuringsinstantie stuurt één uitslag met herkenbare referentie.</span></div>
        <div className={styles.visualCard}><strong>2 · Ontvangen</strong><span>Middelveen bevestigt of registreert ontvangst.</span></div>
        <div className={styles.visualCard}><strong>3 · Verwerken</strong><span>Het zaaksysteem koppelt de uitslag aan de juiste aanvraag.</span></div>
        <div className={styles.visualCard}><strong>4 · Herstel</strong><span>Dubbel, verloren of vertraagd bericht is aantoonbaar af te handelen.</span></div>
      </div>
    </section>;
  }

  return <>
    <SystemContextIntegrationMap />
    <LandscapeImpact />
  </>;
}

export default function AdaptiveModule7Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule7}
    apiBase="/api/adaptive/solution-architecture-module-7"
    caseIntro="In Module 6 heb je ontwerpkeuzes en trade-offs leren onderbouwen. Nu kijk je naar de integraties die zulke keuzes in het Middelveen-landschap veroorzaken: welke uitwisselingsvorm past, welke afspraak ontstaat tussen partijen, wat kan er misgaan en hoeveel veranderingsvrijheid blijft over?"
    courseHref={courseHref}
    renderVisual={(mode) => <IntegrationCanvas mode={mode} />}
  />;
}
