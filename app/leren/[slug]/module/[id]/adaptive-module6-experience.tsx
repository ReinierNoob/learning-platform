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
    <AdaptiveModule6Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
