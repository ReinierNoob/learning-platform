import { redirect } from "next/navigation";
import { getAccessToken, getCourseBySlug, getEawLoginUrl, getLearningAccess, getPublishedModules, getSessionUser, startCourse } from "../../../lib/platform";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const currentPath = `/leren/${encodeURIComponent(slug)}`;
  const token = await getAccessToken();
  if (!token) redirect(getEawLoginUrl("/account"));
  const user = await getSessionUser(token);
  if (!user) redirect(`/api/auth/refresh?next=${encodeURIComponent(currentPath)}`);

  const course = await getCourseBySlug(slug, token);
  if (!course) return <main className="shell"><section className="hero"><h1>Training niet gevonden.</h1></section></main>;

  const access = await getLearningAccess(course.id, token);
  if (!access.can_access) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Geen actieve toegang</p><h1>{course.title}</h1><p>Voor deze training is geen actief toegangsrecht gevonden.</p><a className="button" href={process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account"}>Terug naar Mijn trainingen</a></section></main>;
  }

  await startCourse(course.id, token);
  const modules = await getPublishedModules(course.id, token);

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href={process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account"}>Enterprise Architecture Works</a>
      <div><span className="meta">{user.email}</span> <form action="/api/auth/logout" method="post" style={{ display: "inline" }}><button className="button secondary" type="submit">Uitloggen</button></form></div>
    </header>
    <section className="hero"><p className="eyebrow">EAW Leeromgeving</p><h1>{course.title}</h1><p>{course.description}</p><p>Toegang t/m {access.ends_at ? new Date(access.ends_at).toLocaleDateString("nl-NL") : "—"} · Voortgang {Math.round(Number(access.completion_percentage ?? 0))}%</p></section>

    <section className="sectionBlock">
      <div className="sectionHeading"><div><p className="eyebrow dark">Leerpad</p><h2>Modules</h2></div><p className="meta">Kies een module om de hoofdstukken te bekijken.</p></div>
      <div className="tileGrid moduleTiles">
        {modules.map((module) => <a className="learningTile" key={module.id} href={`/leren/${slug}/module/${module.source_module_id}`}>
          <div className="tileTop"><span className="tileNumber">{String(module.position).padStart(2, "0")}</span><span className="badge">{module.content_version}</span></div>
          <div className="tileBody"><p className="tileLabel">Module {module.position}</p><h3>{module.title}</h3><p className="meta">{module.level}{module.study_load ? ` · ${module.study_load}` : ""}</p></div>
          <div className="tileFooter"><span>Bekijk hoofdstukken</span><span aria-hidden="true">→</span></div>
        </a>)}
      </div>
    </section>

    <p className="footer">Onafhankelijk ontwikkeld. Een EAW-bewijs van afronding is geen officiële TOGAF-certificering.</p>
  </main>;
}
