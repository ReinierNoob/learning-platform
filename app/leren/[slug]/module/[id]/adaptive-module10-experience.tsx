import AdaptiveModule10Experience from "../../../../../components/adaptive/solution-architecture-module-10/AdaptiveModule10Experience";

export function AdaptiveModule10LearningExperience({ courseTitle, courseSlug, userEmail }: { courseTitle: string; courseSlug: string; userEmail: string }) {
  return <>
    <header className="topbar">
      <a className="brand" href={`/leren/${courseSlug}`}>← {courseTitle}</a>
      <div><span className="meta">Adaptieve leerroute · {userEmail}</span>{" "}<form action="/api/auth/logout" method="post" style={{ display: "inline" }}><button className="button secondary" type="submit">Uitloggen</button></form></div>
    </header>
    <section className="sectionBlock">
      <p className="eyebrow dark">Doorlopende lijn · Module 9 → 10</p>
      <h2>Van deelbesluiten naar één integrale architectuurafweging</h2>
      <p className="meta">Je gebruikt de volledige Middelveen-casus om de eerdere modules samen te brengen. Er wordt geen nieuwe leerstof geïntroduceerd en de eindbeoordeling beoordeelt iedere vraag zelfstandig.</p>
    </section>
    <AdaptiveModule10Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
