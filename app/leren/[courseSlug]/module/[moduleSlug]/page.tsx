import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser, userApi } from "../../../../../lib/supabase";
import ModuleActions from "./module-actions";

type Chapter = { id: string; titel: string; tekst: string; video_url?: string };
type Question = { nr: number; vraag: string; opties: Record<string, string> };
type ModuleItem = { id: string; item_type: "content" | "assessment" | "video" | "exercise"; title: string };

export default async function ModulePage({ params }: { params: Promise<{ courseSlug: string; moduleSlug: string }> }) {
  const user = await getSessionUser(); if (!user) redirect("/inloggen"); const { courseSlug, moduleSlug } = await params;
  const courseResponse = await userApi(`/rest/v1/courses?slug=eq.${encodeURIComponent(courseSlug)}&select=id,title`);
  const [course] = courseResponse.ok ? await courseResponse.json() : []; if (!course) notFound();
  const openResponse = await userApi("/rest/v1/rpc/open_course", { method: "POST", body: JSON.stringify({ p_course_id: course.id }) });
  if (!openResponse.ok) redirect("/?geen-toegang=1");
  const [moduleResponse, allModulesResponse, enrollmentResponse] = await Promise.all([
    userApi(`/rest/v1/course_modules?course_id=eq.${course.id}&slug=eq.${encodeURIComponent(moduleSlug)}&is_published=eq.true&select=id,course_id,title,position,level,study_load,case_study,disclaimer,chapters,quiz`),
    userApi(`/rest/v1/course_modules?course_id=eq.${course.id}&is_published=eq.true&select=id,slug,position&order=position.asc`),
    userApi(`/rest/v1/enrollments?course_id=eq.${course.id}&select=id,module_progress(module_id,status,module_item_progress(module_item_id))`),
  ]);
  const [module] = moduleResponse.ok ? await moduleResponse.json() : []; if (!module) notFound();
  const allModules = allModulesResponse.ok ? await allModulesResponse.json() : [];
  const [enrollment] = enrollmentResponse.ok ? await enrollmentResponse.json() : [];
  const previousModule = allModules.find((item: { position: number }) => item.position === module.position - 1);
  if (previousModule && !enrollment?.module_progress?.some((item: { module_id: string; status: string }) => item.module_id === previousModule.id && item.status === "completed")) redirect(`/leren/${courseSlug}`);
  const itemsResponse = await userApi(`/rest/v1/module_items?module_id=eq.${module.id}&select=id,item_type,title&order=position.asc`);
  const items: ModuleItem[] = itemsResponse.ok ? await itemsResponse.json() : [];
  const chapters: Chapter[] = Array.isArray(module.chapters) ? module.chapters : [];
  const questions: Question[] = Array.isArray(module.quiz) ? module.quiz : [];
  const contentItem = items.find((item) => item.item_type === "content"); const assessmentItem = items.find((item) => item.item_type === "assessment");
  return <main><header className="topbar"><Link href="/" className="wordmark">EAW <span>Leren</span></Link><Link href={`/leren/${courseSlug}`}>← Moduleoverzicht</Link></header><section className="module-hero"><p className="kicker">Module {module.position} · {module.study_load}</p><h1>{module.title}</h1>{module.case_study && <p>Doorlopende casus: {module.case_study}</p>}</section><article className="chapter-list">{chapters.map((chapter, index) => <section key={chapter.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{chapter.titel}</h2><div className="chapter-copy">{chapter.tekst}</div>{chapter.video_url && <p className="media-note">Video-onderdeel aanwezig. Beschermde media worden vóór livegang naar private opslag gemigreerd.</p>}</div></section>)}</article><ModuleActions contentItemId={contentItem?.id} assessmentItemId={assessmentItem?.id} questions={questions} />{module.disclaimer && <footer className="module-disclaimer">{module.disclaimer}</footer>}</main>;
}
