import AdaptiveModule4Experience from "../../../../../components/adaptive/solution-architecture-module-4/AdaptiveModule4Experience";

export function AdaptiveModule4LearningExperience({
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
    <AdaptiveModule4Experience courseHref={`/leren/${courseSlug}`} />
  </>;
}
