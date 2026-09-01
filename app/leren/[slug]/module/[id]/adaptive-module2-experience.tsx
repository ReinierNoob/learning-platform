import AdaptiveModule2Experience from "../../../../../components/adaptive/solution-architecture-module-2/AdaptiveModule2Experience";

export function AdaptiveModule2LearningExperience({
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
      <p className="eyebrow dark">Doorlopende lijn · Module 1 → 2</p>
      <h2>Van rol naar werkbare ontwerpopdracht</h2>
      <p className="meta">Je kent nu je rolgrens. In deze module toets je de ontvangen businessvraag op resultaat, scope, aannames, randvoorwaarden en ontbrekende beslissingen voordat je de oplossingsruimte invult.</p>
    </section>
    <AdaptiveModule2Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
