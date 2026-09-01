import AdaptiveModule9Experience from "../../../../../components/adaptive/solution-architecture-module-9/AdaptiveModule9Experience";

export function AdaptiveModule9LearningExperience({ courseTitle, courseSlug, userEmail }: { courseTitle: string; courseSlug: string; userEmail: string }) {
  return <>
    <header className="topbar">
      <a className="brand" href={`/leren/${courseSlug}`}>← {courseTitle}</a>
      <div><span className="meta">Adaptieve leerroute · {userEmail}</span>{" "}<form action="/api/auth/logout" method="post" style={{ display: "inline" }}><button className="button secondary" type="submit">Uitloggen</button></form></div>
    </header>
    <section className="sectionBlock">
      <p className="eyebrow dark">Doorlopende lijn · Module 8 → 9 → 10</p>
      <h2>Van gereviewd ontwerp naar beheerste realisatie</h2>
      <p className="meta">Je zet het eindbeeld om in zelfstandig waardevolle tussenstappen, laat afhankelijkheden de volgorde bepalen en ontwerpt terugval als risicobeheersing. Module 10 brengt daarna de volledige leerlijn samen.</p>
    </section>
    <AdaptiveModule9Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
