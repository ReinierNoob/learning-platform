import AdaptiveModule6Experience from "../../../../../components/adaptive/solution-architecture-module-6/AdaptiveModule6Experience";

export function AdaptiveModule6LearningExperience({
  courseTitle,
  courseSlug,
  userEmail,
}: {
  courseTitle: string;
  courseSlug: string;
  userEmail: string;
}) {
  return <>
    <header className="topbar">
      <a className="brand" href={`/leren/${courseSlug}`}>← {courseTitle}</a>
      <div>
        <span className="meta">Adaptieve leerroute · {userEmail}</span>{" "}
        <form action="/api/auth/logout" method="post" style={{ display: "inline" }}>
          <button className="button secondary" type="submit">Uitloggen</button>
        </form>
      </div>
    </header>
    <section className="sectionBlock">
      <p className="eyebrow dark">Doorlopende lijn · Module 4 → 5 → 6</p>
      <h2>Van kwaliteit naar keuze</h2>
      <p className="meta">In Module 4 heb je kwaliteitskenmerken herkend en meetbaar gemaakt. In Module 5 heb je geleerd welke kwaliteitsinformatie je voor welk publiek zichtbaar maakt. Hier gebruik je die kennis als besliscriteria: je vergelijkt serieuze alternatieven, maakt winst en verlies expliciet en legt de keuze vast.</p>
    </section>
    <AdaptiveModule6Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
