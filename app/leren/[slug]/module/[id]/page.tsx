import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getAccessToken, getCourseBySlug, getLearningAccess, getPublishedModule, getSessionUser, startCourse } from "../../../../../lib/platform";
import { ChatClient, QuizClient } from "./learning-client";

export default async function ModulePage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const sourceModuleId = Number(id);
  if (!Number.isInteger(sourceModuleId) || sourceModuleId < 1) {
    return <main className="shell"><section className="hero"><h1>Module niet gevonden.</h1></section></main>;
  }

  const token = await getAccessToken();
  if (!token) redirect("/");
  const user = await getSessionUser(token);
  if (!user) redirect(`/api/auth/refresh?next=${encodeURIComponent(`/leren/${slug}/module/${sourceModuleId}`)}`);

  const course = await getCourseBySlug(slug, token);
  if (!course) return <main className="shell"><section className="hero"><h1>Training niet gevonden.</h1></section></main>;

  const access = await getLearningAccess(course.id, token);
  if (!access.can_access) redirect(`/leren/${slug}`);
  await startCourse(course.id, token);

  const module = await getPublishedModule(course.id, sourceModuleId, token);
  if (!module) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Nog niet beschikbaar</p><h1>Deze module is nog niet gepubliceerd.</h1><a className="button" href={`/leren/${slug}`}>Terug naar de training</a></section></main>;
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href={`/leren/${slug}`}>← {course.title}</a><span className="meta">{user.email}</span></header>
    <section className="hero"><p className="eyebrow">Module {module.position} · {module.content_version}</p><h1>{module.title}</h1><p>{module.level}{module.study_load ? ` · Studielast ${module.study_load}` : ""}{module.case_study ? ` · Casus ${module.case_study}` : ""}</p></section>
    <ChatClient trainingId={course.id} moduleId={module.source_module_id} />
    {(module.chapters ?? []).map((chapter) => <section className="chapter" key={chapter.id}><h2>{chapter.titel}</h2><video controls preload="metadata" src={`/api/video-url/${module.source_module_id}/${encodeURIComponent(chapter.id)}?training_id=${encodeURIComponent(course.id)}`} /><ReactMarkdown>{chapter.tekst}</ReactMarkdown></section>)}
    <QuizClient trainingId={course.id} moduleId={module.source_module_id} questions={module.quiz ?? []} />
    {module.disclaimer ? <p className="footer">{module.disclaimer}</p> : null}
  </main>;
}
