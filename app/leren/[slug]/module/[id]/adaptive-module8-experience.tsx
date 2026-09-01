import AdaptiveModule8Experience from "../../../../../components/adaptive/solution-architecture-module-8/AdaptiveModule8Experience";

export function AdaptiveModule8LearningExperience({ courseTitle, courseSlug, userEmail }: { courseTitle: string; courseSlug: string; userEmail: string }) {
  return <>
    <header className="topbar">
      <a className="brand" href={`/leren/${courseSlug}`}>← {courseTitle}</a>
      <div><span className="meta">Adaptieve leerroute · {userEmail}</span>{" "}<form action="/api/auth/logout" method="post" style={{ display: "inline" }}><button className="button secondary" type="submit">Uitloggen</button></form></div>
    </header>
    <section className="sectionBlock">
      <p className="eyebrow dark">Doorlopende lijn · Module 7 → 8 → 9</p>
      <h2>Van integratiekeuze naar toetsbaar architectuurbesluit</h2>
      <p className="meta">Je toetst ontwerp en integratie nu tegen expliciete principes en eisen, beoordeelt afwijkingen en maakt de onderbouwing reviewbaar. Module 9 vertaalt het gereviewde ontwerp daarna naar een beheerst migratiepad.</p>
    </section>
    <AdaptiveModule8Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
