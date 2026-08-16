import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser, userApi } from "../../../lib/supabase";

type Module = { id: string; slug: string; title: string; position: number; level: string | null; study_load: string | null };
type Progress = { module_id: string; status: string; completion_percentage: number };

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const user = await getSessionUser(); if (!user) redirect("/inloggen"); const { courseSlug } = await params;
  const courseResponse = await userApi(`/rest/v1/courses?slug=eq.${encodeURIComponent(courseSlug)}&select=id,title,description`);
  const [course] = courseResponse.ok ? await courseResponse.json() : []; if (!course) notFound();
  const openResponse = await userApi("/rest/v1/rpc/open_course", { method: "POST", body: JSON.stringify({ p_course_id: course.id }) });
  if (!openResponse.ok) redirect("/?geen-toegang=1");
  const [modulesResponse, enrollmentResponse] = await Promise.all([
    userApi(`/rest/v1/course_modules?course_id=eq.${course.id}&is_published=eq.true&select=id,slug,title,position,level,study_load&order=position.asc`),
    userApi(`/rest/v1/enrollments?course_id=eq.${course.id}&select=id,status,completion_percentage,module_progress(module_id,status,completion_percentage)`),
  ]);
  const modules: Module[] = modulesResponse.ok ? await modulesResponse.json() : [];
  const [enrollment] = enrollmentResponse.ok ? await enrollmentResponse.json() : [];
  const progress: Progress[] = enrollment?.module_progress ?? [];
  return <main><header className="topbar"><Link href="/" className="wordmark">EAW <span>Leren</span></Link><Link href="/">Mijn e-learnings</Link></header><section className="course-hero"><p className="kicker">Jouw e-learning</p><h1>{course.title}</h1><p>{course.description}</p><div className="progress"><span style={{ width: `${enrollment?.completion_percentage ?? 0}%` }} /></div><small>{enrollment?.completion_percentage ?? 0}% voltooid</small></section><section className="module-list">{modules.map((module, index) => { const own = progress.find((item) => item.module_id === module.id); const previous = index === 0 ? null : progress.find((item) => item.module_id === modules[index - 1].id); const unlocked = index === 0 || previous?.status === "completed"; return <article className={unlocked ? "" : "locked"} key={module.id}><span>{String(module.position).padStart(2, "0")}</span><div><small>{module.level ?? `Module ${module.position}`} · {module.study_load ?? "studielast volgt"}</small><h2>{module.title}</h2><p>{own?.status === "completed" ? "Afgerond" : own?.status === "in_progress" ? "Bezig" : unlocked ? "Beschikbaar" : "Voltooi eerst de vorige module"}</p></div>{unlocked ? <Link href={`/leren/${courseSlug}/module/${module.slug}`}>{own ? "Verder" : "Start"} →</Link> : <strong aria-label="Vergrendeld">🔒</strong>}</article>; })}</section></main>;
}
