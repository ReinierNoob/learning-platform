"use client";

import AdaptiveModuleExperience from "../config-driven/AdaptiveModuleExperience";
import styles from "../config-driven/adaptive-experience.module.css";
import { solutionArchitectureModule10 } from "../../../lib/solution-architecture-module-10";

type Lens = { title: string; items: string[] };

const lenses: Record<string, Lens> = {
  "case-process": {
    title: "Werk integraal, beoordeel per vraag zelfstandig",
    items: ["Feiten en aannames scheiden", "Alleen expliciete casusinformatie gebruiken", "Eerdere modules raadplegen zonder het antwoord voor te laten zeggen"],
  },
  "case-scope": {
    title: "Analyseer de opdracht zonder de businessvraag over te nemen",
    items: ["Feit", "Aanname", "Openstaand besluit"],
  },
  "case-requirements": {
    title: "Maak belangen en eisen toetsbaar",
    items: ["Stakeholderbelang", "Kwaliteitsattribuut", "Toetsbare eis"],
  },
  "case-models": {
    title: "Kies de view vanuit de informatiebehoefte",
    items: ["Stakeholder", "Informatiebehoefte", "Passende view"],
  },
  "case-alternatives": {
    title: "Vergelijk alternatieven op dezelfde criteria",
    items: ["Alternatief", "Winst", "Verlies / consequentie"],
  },
  "case-principles": {
    title: "Review tegen expliciete kaders",
    items: ["Principe", "Conformiteit of afwijking", "Context en consequentie"],
  },
  "case-migration": {
    title: "Beoordeel het veranderpad als ontwerp",
    items: ["Zelfstandig waardevolle stap", "Afhankelijkheid", "Herstelpad"],
  },
  "case-overview": {
    title: "Eén casus, zes samenhangende architectuurvragen",
    items: ["A · Scope & aannames", "B · Eisen & kwaliteit", "C · Modelleren", "D · Alternatieven & trade-offs", "E · Principes & review", "F · Migratie & risico"],
  },
};

function FinalDecisionTree() {
  const steps = [
    ["1 · Vraag en scope", "Is het probleem helder en zijn oplossingsaannames expliciet getoetst?"],
    ["2 · Stakeholders en eisen", "Welke belangen botsen en welke eisen zijn werkelijk toetsbaar?"],
    ["3 · Kwaliteitsprioriteiten", "Welke kwaliteitsattributen sturen de oplossingskeuze en waar zit de dominante spanning?"],
    ["4 · Passende views", "Welke informatie heeft iedere beslisser nodig en welk model/detailniveau ondersteunt dat?"],
    ["5 · Alternatieven en trade-offs", "Welke serieuze opties zijn vergeleken en welke consequenties accepteer je bewust?"],
    ["6 · Principes en ADR", "Is de keuze conform kaders of is een expliciete, tijdelijke en navolgbare afwijking nodig?"],
    ["7 · Migratie en rollback", "Welke zelfstandig waardevolle stap kan veilig live en wat is het vooraf ontworpen herstelpad?"],
  ] as const;

  return <section className={styles.visual} aria-labelledby="module10-decision-tree-heading">
    <div className={styles.visualHeader}>
      <div><p className={styles.kicker}>Eindbeslisboom</p><h3 id="module10-decision-tree-heading">Van businessvraag naar realiseerbare architectuurbeslissing</h3></div>
      <span>proces, geen antwoordmodel</span>
    </div>
    <div className={styles.alwaysCards}>
      {steps.map(([title, description]) => <div className={styles.visualCard} key={title}><strong>{title}</strong><span>{description}</span></div>)}
    </div>
    <p className={styles.feedback}><strong>Teruglus:</strong> als een stap onvoldoende onderbouwd is, ga je terug naar de relevante eerdere analyse in plaats van het volgende besluit te forceren.</p>
  </section>;
}

function IntegratedCaseCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;
  const lens = lenses[mode];
  if (!lens) return null;

  const canvas = <section className={styles.visual} aria-label={lens.title}>
    <div className={styles.visualHeader}>
      <div><p className={styles.kicker}>Analysecanvas</p><h3>{lens.title}</h3></div>
      <span>geen inhoudelijke hint</span>
    </div>
    <div className={styles.alwaysCards}>
      {lens.items.map((item, index) => <div className={styles.visualCard} key={item}>
        <strong>{String(index + 1).padStart(2, "0")}</strong>
        <span>{item}</span>
      </div>)}
    </div>
  </section>;

  if (mode === "case-overview") return <>{canvas}<FinalDecisionTree /></>;
  return canvas;
}

function PreviousModuleLinks({ courseHref }: { courseHref?: string }) {
  const baseHref = courseHref ?? `/leren/${solutionArchitectureModule10.courseSlug}`;
  return <section className={styles.visual} aria-labelledby="module10-reference-heading">
    <div className={styles.visualHeader}>
      <div>
        <p className={styles.kicker}>Gerichte herhaling</p>
        <h3 id="module10-reference-heading">Eerdere modules direct beschikbaar</h3>
      </div>
      <span>alleen referentie, geen antwoord</span>
    </div>
    <p>Als de eindcheck een onderwerp terugverwijst, open je hier rechtstreeks de betreffende eerdere module en keer je daarna terug naar Module 10.</p>
    <div className={styles.actions}>
      {[2, 3, 4, 5, 6, 7, 8, 9].map((moduleNumber) => <a
        className={styles.secondary}
        href={`${baseHref}/module/${moduleNumber}`}
        key={moduleNumber}
      >Module {moduleNumber}</a>)}
    </div>
  </section>;
}

export default function AdaptiveModule10Experience({ courseHref }: { courseHref?: string }) {
  return <>
    <PreviousModuleLinks courseHref={courseHref} />
    <AdaptiveModuleExperience
      definition={solutionArchitectureModule10}
      apiBase="/api/adaptive/solution-architecture-module-10"
      caseIntro="Je brengt de volledige Middelveen-leerlijn samen in één integrale eindcasus. De casus introduceert geen nieuwe leerstof: je analyseert opdracht en aannames, eisen en kwaliteitsbelangen, modelkeuze, alternatieven en trade-offs, principes en review, en ten slotte realisatie en migratierisico."
      courseHref={courseHref}
      renderVisual={(mode) => <IntegratedCaseCanvas mode={mode} />}
    />
  </>;
}
