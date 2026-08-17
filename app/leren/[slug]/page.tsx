import { redirect } from "next/navigation";
import CompleteContent from "@/components/CompleteContent";
import Quiz from "@/components/Quiz";
import RichText from "@/components/RichText";
import { eawUrl } from "@/lib/config";
import { getSessionUser, userApi } from "@/lib/supabase";

type Course = { id: string; slug: string; title: string; description: string | null };
type Chapter = { id: string; titel: string; tekst: string; video_url?: string };
type Question = { nr: number; vraag: string; opties: Record<string, string> };
type Module = {
  id: string;
  source_module_id: number | null;
  slug: string;
  title: string;
  position: number;
  is_published: boolean;
  content_version: string;
  level: string | null;
  study_load: string | null;
  case_study: string | null;
  disclaimer: string | null;
  chapters: Chapter[] | null;
  quiz: Question[] | null;
};
type ModuleItem = { id: string; module_id: string; item_type: string; title: string; position: number };
type Enrollment = { completion_percentage: number | string; current_module_id: string | null; status: string };

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const user = await getSessionUser();
  const { slug } = await params;
  const query = await searchParams;
  if (!user) redirect(eawUrl("/account?learning=signin-required"));

  const courseResponse = await userApi(
    `/rest/v1/courses?select=id,slug,title,description&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const courses = courseResponse.ok ? (await courseResponse.json()) as Course[] : [];
  const course = courses[0];
  if (!course) redirect("/?course=not-found");

  const accessResponse = await userApi("/rest/v1/rpc/get_my_learning_access", {
    method: "POST",
    body: JSON.stringify({ p_training_id: course.id }),
  });
  const access = accessResponse.ok ? await accessResponse.json() : null;
  if (!access?.can_access) redirect("/?access=denied");

  const [modulesResponse, itemsResponse, enrollmentResponse] = await Promise.all([
    userApi(`/rest/v1/course_modules?select=id,source_module_id,slug,title,position,is_published,content_version,level,study_load,case_study,disclaimer,chapters,quiz&course_id=eq.${course.id}&order=position.asc`),
    userApi(`/rest/v1/module_items?select=id,module_id,item_type,title,position&order=position.asc`),
    userApi(`/rest/v1/enrollments?select=completion_percentage,current_module_id,status&course_id=eq.${course.id}&limit=1`),
  ]);
  const modules = modulesResponse.ok ? (await modulesResponse.json()) as Module[] : [];
  const items = itemsResponse.ok ? (await itemsResponse.json()) as ModuleItem[] : [];
  const enrollments = enrollmentResponse.ok ? (await enrollmentResponse.json()) as Enrollment[] : [];
  const enrollment = enrollments[0];
  const selected =
    modules.find((module) => module.slug === query.module) ??
    modules.find((module) => module.id === enrollment?.current_module_id) ??
    modules[0];

  if (!selected) {
    return <main className="shell"><p>Er is nog geen gepubliceerde module beschikbaar.</p></main>;
  }

  const contentItem = items.find((item) => item.module_id === selected.id && item.item_type === "content") ?? null;
  const assessment = items.find((item) => item.module_id === selected.id && item.item_type === "assessment") ?? null;
  const progress = Math.max(0, Math.min(100, Number(enrollment?.completion_percentage ?? 0)));

  return (
    <main className="shell">
      <header className="topbar">
        <div><div className="brand">ENTERPRISE ARCHITECTURE WORKS</div><small className="muted">EAW Learning</small></div>
        <div>{user.email}<form action="/api/logout" method="post"><button className="textButton">Uitloggen</button></form></div>
      </header>
      <section className="hero">
        <span className="badge">Beveiligde leeromgeving</span>
        <h1>{course.title}</h1>
        <p className="muted">{course.description}</p>
        <div className="progress" aria-label={`Cursusvoortgang ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
        <small>{progress}% voltooid</small>
      </section>
      <div className="grid">
        <aside className="sidebar">
          <strong>Modules</strong>
          {modules.map((module) => (
            <a
              className="moduleLink"
              aria-current={module.id === selected.id ? "page" : undefined}
              key={module.id}
              href={`/leren/${course.slug}?module=${encodeURIComponent(module.slug)}`}
            >
              {module.position}. {module.title}<br /><small className="muted">{module.content_version}</small>
            </a>
          ))}
        </aside>
        <article className="panel">
          <p className="muted">
            {[selected.level, selected.study_load && `Studielast ${selected.study_load}`, selected.case_study && `Casus ${selected.case_study}`].filter(Boolean).join(" · ")}
          </p>
          <h1>{selected.title}</h1>
          {(selected.chapters ?? []).map((chapter) => (
            <section className="chapter" key={chapter.id}>
              <h2>{chapter.titel}</h2>
              {chapter.video_url ? <video controls preload="metadata" src={chapter.video_url} /> : null}
              <RichText text={chapter.tekst} />
            </section>
          ))}
          <CompleteContent itemId={contentItem?.id ?? null} />
          <Quiz questions={selected.quiz ?? []} assessmentItemId={assessment?.id ?? null} />
          {selected.disclaimer ? <p className="muted">{selected.disclaimer}</p> : null}
        </article>
      </div>
    </main>
  );
}
