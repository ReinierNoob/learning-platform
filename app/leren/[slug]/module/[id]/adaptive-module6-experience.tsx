import AdaptiveModule6PilotV3 from "../../../../lab/solution-architecture-module-6/AdaptiveModule6PilotV3";

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
        <span className="meta">Adaptieve preview · {userEmail}</span>{" "}
        <form action="/api/auth/logout" method="post" style={{ display: "inline" }}>
          <button className="button secondary" type="submit">Uitloggen</button>
        </form>
      </div>
    </header>
    <AdaptiveModule6PilotV3 />
  </>;
}
