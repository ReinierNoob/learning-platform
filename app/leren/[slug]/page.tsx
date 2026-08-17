import { redirect } from "next/navigation";
import { getAccessToken, getCourseBySlug, getLearningAccess, getPublishedModules, getSessionUser, startCourse } from "../../../lib/platform";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getAccessToken();
  if (!token) redirect(`/`);
  const user = await getSessionUser(token);
  if (!user) redirect(`/api/auth/refresh?next=${encodeURIComponent(`/leren/${slug}`)}`);

  const course = await getCourseBySlug(slug, token);
  if (!course) return <main className="shell"><section className="hero"><h1>Training niet gevonden.</h1></section></main>;

  const access = await getLearningAccess(course.id, token);
  if (!access.can_access) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Geen actieve toegang</p><h1>{course.title}</h1><p>Voor deze training is geen actief toegangsrecht gevonden.</p><a className="button" href={process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account"}>Terug naar Mijn trainingen</a></section></main>;
  }

  await startCourse(course.id, token);
  const modules = await getPublishedModules(course.id, token);

  return <main className="shell">
    <header className="topbar"><a className="brand" href={process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account"}>Enterprise Architecture Works</a><span className="meta">{user.email}</span></header>
    <section className="hero"><p className="eyebrow">EAW Leeromgeving</p><h1>{course.title}</h1><p>{course.description}</p><p>Toegang t/m {access.ends_at ? new Date(access.ends_at).toLocaleDateString("nl-NL") : "—"} · Voortgang {Math.round(Number(access.completion_percentage ?? 0))}%</p></section>
    <section className="card"><h2>Modules</h2><div className="moduleList">{modules.map((module) => <div className="module" key={module.id}><div><span className="badge">Module {module.position} · {module.content_version}</span><h3>{module.title}</h3><p className="meta">{module.level}{module.study_load ? ` · ${module.study_load}` : ""}</p></div><a className="button" href={`/leren/${slug}/module/${module.source_module_id}`}>Open module</a></div>)}</div></section>
    <p className="footer">Onafhankelijk ontwikkeld. Een EAW-bewijs van afronding is geen officiële TOGAF-certificering.</p>
  </main>;
}
