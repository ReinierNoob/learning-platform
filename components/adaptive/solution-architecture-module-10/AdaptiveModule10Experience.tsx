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

function IntegratedCaseCanvas({ mode }: { mode?: string }) {
  if (!mode || mode === "assessment") return null;
  const lens = lenses[mode];
  if (!lens) return null;

  return <section className={styles.visual} aria-label={lens.title}>
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
}

export default function AdaptiveModule10Experience({ courseHref }: { courseHref?: string }) {
  return <AdaptiveModuleExperience
    definition={solutionArchitectureModule10}
    apiBase="/api/adaptive/solution-architecture-module-10"
    caseIntro="Je brengt de volledige Middelveen-leerlijn samen in één integrale eindcasus. De casus introduceert geen nieuwe leerstof: je analyseert opdracht en aannames, eisen en kwaliteitsbelangen, modelkeuze, alternatieven en trade-offs, principes en review, en ten slotte realisatie en migratierisico."
    courseHref={courseHref}
    renderVisual={(mode) => <IntegratedCaseCanvas mode={mode} />}
  />;
}
