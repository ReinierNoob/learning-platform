import AdaptiveModule3Experience from "../../../../../components/adaptive/solution-architecture-module-3/AdaptiveModule3Experience";

export function AdaptiveModule3LearningExperience({
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
      <p className="eyebrow dark">Doorlopende lijn · Module 2 → 3 → 4</p>
      <h2>Van heldere opdracht naar toetsbare belangen en eisen</h2>
      <p className="meta">Na scope en aannames breng je nu in beeld wie door de oplossing wordt geraakt, wat zij nodig hebben en waar belangen botsen. In Module 4 verdiep je vervolgens de kwaliteitsattributen achter de eisen.</p>
    </section>
    <AdaptiveModule3Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
