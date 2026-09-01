import AdaptiveModule7Experience from "../../../../../components/adaptive/solution-architecture-module-7/AdaptiveModule7Experience";

export function AdaptiveModule7LearningExperience({ courseTitle, courseSlug, userEmail }: { courseTitle: string; courseSlug: string; userEmail: string }) {
  return <>
    <header className="topbar">
      <a className="brand" href={`/leren/${courseSlug}`}>← {courseTitle}</a>
      <div><span className="meta">Adaptieve leerroute · {userEmail}</span>{" "}<form action="/api/auth/logout" method="post" style={{ display: "inline" }}><button className="button secondary" type="submit">Uitloggen</button></form></div>
    </header>
    <section className="sectionBlock">
      <p className="eyebrow dark">Doorlopende lijn · Module 6 → 7 → 8</p>
      <h2>Van ontwerpbesluit naar beheersbare integratie</h2>
      <p className="meta">Na het afwegen van alternatieven onderzoek je nu welke afhankelijkheden de gekozen oplossing in het landschap creëert. Daarna toets je die keuzes in Module 8 tegen principes en governance.</p>
    </section>
    <AdaptiveModule7Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
