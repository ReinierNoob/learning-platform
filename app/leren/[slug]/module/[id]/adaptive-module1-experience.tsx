import AdaptiveModule1Experience from "../../../../../components/adaptive/solution-architecture-module-1/AdaptiveModule1Experience";

export function AdaptiveModule1LearningExperience({
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
      <p className="eyebrow dark">Start van de ontwerplaag · Module 1</p>
      <h2>Eerst weten welke beslissing van jou is</h2>
      <p className="meta">Je begint niet met een techniek of diagram. Eerst positioneer je de solution-architectuurrol: welke ontwerpbeslissingen horen bij jou, welke keuzes liggen elders en hoe maak je conflicten tussen rollen bespreekbaar?</p>
    </section>
    <AdaptiveModule1Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
