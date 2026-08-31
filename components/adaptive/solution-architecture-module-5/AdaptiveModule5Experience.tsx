"use client";

import { useState } from "react";
import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule5 } from "../../../lib/solution-architecture-module-5";

type Stakeholder = "wethouder" | "opdrachtgever" | "keuringsinstantie" | "integratieteam";

const stakeholderViews: Record<Stakeholder, { doel: string; toon: string; laatWeg: string; detail: string }> = {
  wethouder: {
    doel: "Begrijpen welke partijen en hoofdsystemen de digitale aanvraag mogelijk maken.",
    toon: "Burger, gemeente, keuringsinstantie en de belangrijkste systeemgrenzen.",
    laatWeg: "API-details, componentnamen, technische protocollen en interne databases.",
    detail: "C4 System Context / bestuurlijke landschapsview",
  },
  opdrachtgever: {
    doel: "Zien hoe de oplossing in het bestaande landschap past en waar afhankelijkheden ontstaan.",
    toon: "Hoofdsystemen, externe diensten, verantwoordelijkheden en betekenisvolle relaties.",
    laatWeg: "Code- en componentdetails die geen besluit ondersteunen.",
    detail: "Stakeholdergerichte ArchiMate 4-view of C4-landschaps/contextbeeld",
  },
  keuringsinstantie: {
    doel: "Begrijpen waar gegevens en statusinformatie worden uitgewisseld.",
    toon: "Systemen aan beide kanten, interacties, gegevensstromen en afspraken.",
    laatWeg: "Interne componentstructuur van Middelveen die de koppeling niet raakt.",
    detail: "C4 Container / gerichte ArchiMate 4-integratieview",
  },
  integratieteam: {
    doel: "De oplossingsstructuur en integratiepunten technisch kunnen realiseren en toetsen.",
    toon: "Containers, verantwoordelijkheden, interfaces en relevante technische grenzen.",
    laatWeg: "Organisatiecontext die voor deze technische beslissing geen extra betekenis toevoegt.",
    detail: "C4 Container en waar nodig Component-detail",
  },
};

function ProgressiveArchitectureCanvas({ mode }: { mode?: string }) {
  const [stakeholder, setStakeholder] = useState<Stakeholder>("wethouder");
  const view = stakeholderViews[stakeholder];

  if (!mode || mode === "assessment") return null;

  return <section className={styles.visual} aria-label="Progressive architecture canvas">
    <div className={styles.visualHeader}>
      <div><p className={styles.kicker}>Progressive architecture canvas</p><h3>Dezelfde oplossing, een ander architectuurbeeld</h3></div>
      <span>{mode === "archimate4-view" || mode === "archimate4-viewpoint-check" ? "ArchiMate 4" : "C4 + ArchiMate 4"}</span>
    </div>
    <div className={styles.stakeholderTabs} aria-label="Kies stakeholder">
      {(Object.keys(stakeholderViews) as Stakeholder[]).map((item) => <button key={item} type="button" aria-pressed={stakeholder === item} onClick={() => setStakeholder(item)}>{item}</button>)}
    </div>

    <div className={styles.visualGrid} aria-hidden="true">
      <div className={styles.visualCard}><strong>Burger</strong><span>vraagt digitaal aan</span></div>
      <div className={styles.visualCard}><strong>Burgerportaal</strong><span>aanvraag + status</span></div>
      <div className={styles.visualCard}><strong>Zaaksysteem</strong><span>behandeling</span></div>
      <div className={styles.visualCard}><strong>Keuringsinstantie</strong><span>uitslag + status</span></div>
    </div>

    <div className={styles.mobileCards}>
      <div className={styles.visualCard}><strong>Doel</strong><span>{view.doel}</span></div>
      <div className={styles.visualCard}><strong>Toon</strong><span>{view.toon}</span></div>
      <div className={styles.visualCard}><strong>Laat weg</strong><span>{view.laatWeg}</span></div>
      <div className={styles.visualCard}><strong>Detailniveau</strong><span>{view.detail}</span></div>
    </div>

    <div className={styles.feedback}>
      <strong>{stakeholder}</strong>
      <p><b>Doel:</b> {view.doel}</p>
      <p><b>Toon:</b> {view.toon}</p>
      <p><b>Laat weg:</b> {view.laatWeg}</p>
      <p><b>Passend detailniveau:</b> {view.detail}</p>
    </div>
  </section>;
}

export default function AdaptiveModule5Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule5}
    apiBase="/api/adaptive/solution-architecture-module-5"
    caseIntro="Gemeente Middelveen wil dezelfde oplossingsarchitectuur aan verschillende stakeholders uitleggen. Jij kiest per gesprek welk beeld, detailniveau en model het meest bruikbaar is."
    courseHref={courseHref}
    renderVisual={(mode) => <ProgressiveArchitectureCanvas mode={mode} />}
  />;
}
