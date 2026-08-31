import { redirect } from "next/navigation";
import { isAdaptiveModule6LearningEnabled } from "../../../../../lib/adaptive-runtime";
import { getAccessToken, getCourseBySlug, getEawLoginUrl, getLearningAccess, getPublishedModule, getSessionUser, startCourse } from "../../../../../lib/platform";
import { AdaptiveModule6LearningExperience } from "./adaptive-module6-experience";
import { QuizClient } from "./learning-client";

export default async function ModulePage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const sourceModuleId = Number(id);
  if (!Number.isInteger(sourceModuleId) || sourceModuleId < 1) {
    return <main className="shell"><section className="hero"><h1>Module niet gevonden.</h1></section></main>;
  }

  const currentPath = `/leren/${encodeURIComponent(slug)}/module/${sourceModuleId}`;
  const token = await getAccessToken();
  if (!token) redirect(getEawLoginUrl("/account"));
  const user = await getSessionUser(token);
  if (!user) redirect(`/api/auth/refresh?next=${encodeURIComponent(currentPath)}`);

  const course = await getCourseBySlug(slug, token);
  if (!course) return <main className="shell"><section className="hero"><h1>Training niet gevonden.</h1></section></main>;

  const access = await getLearningAccess(course.id, token);
  if (!access.can_access) redirect(`/leren/${slug}`);
  await startCourse(course.id, token);

  const module = await getPublishedModule(course.id, sourceModuleId, token);
  if (!module) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Nog niet beschikbaar</p><h1>Deze module is nog niet gepubliceerd.</h1><a className="button" href={`/leren/${slug}`}>Terug naar de training</a></section></main>;
  }

  // Adaptive learning deliberately reuses the normal session, entitlement, course-start
  // and published-module checks above. The feature is preview-only and hard-disabled in production.
  if (isAdaptiveModule6LearningEnabled(slug, sourceModuleId)) {
    return <AdaptiveModule6LearningExperience
      courseTitle={course.title}
      courseSlug={slug}
      userEmail={user.email ?? "ingelogde cursist"}
    />;
  }

  const chapters = module.chapters ?? [];

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href={`/leren/${slug}`}>← {course.title}</a>
      <div><span className="meta">{user.email}</span> <form action="/api/auth/logout" method="post" style={{ display: "inline" }}><button className="button secondary" type="submit">Uitloggen</button></form></div>
    </header>
    <section className="hero"><p className="eyebrow">Module {module.position} · {module.content_version}</p><h1>{module.title}</h1><p>{module.level}{module.study_load ? ` · Studielast ${module.study_load}` : ""}{module.case_study ? ` · Casus ${module.case_study}` : ""}</p></section>

    <section className="sectionBlock">
      <div className="sectionHeading"><div><p className="eyebrow dark">Inhoud</p><h2>Hoofdstukken</h2></div><p className="meta">Open een hoofdstuk om met de lesstof en Alexander aan de slag te gaan.</p></div>
      <div className="tileGrid chapterTiles">
        {chapters.map((chapter, index) => <a className="learningTile chapterTile" key={chapter.id} href={`/leren/${slug}/module/${module.source_module_id}/hoofdstuk/${encodeURIComponent(chapter.id)}`}>
          <div className="tileTop"><span className="tileNumber">{String(index + 1).padStart(2, "0")}</span><span className="badge">Hoofdstuk</span></div>
          <div className="tileBody"><p className="tileLabel">Hoofdstuk {index + 1}</p><h3>{chapter.titel}</h3></div>
          <div className="tileFooter"><span>Open hoofdstuk</span><span aria-hidden="true">→</span></div>
        </a>)}
      </div>
    </section>

    <section className="assessmentBlock">
      <div className="sectionHeading"><div><p className="eyebrow dark">Na de hoofdstukken</p><h2>Zelftoets</h2></div><p className="meta">Controleer je begrip en registreer je voortgang.</p></div>
      <QuizClient trainingId={course.id} moduleId={module.source_module_id} questions={module.quiz ?? []} />
    </section>

    {module.disclaimer ? <p className="footer">{module.disclaimer}</p> : null}
  </main>;
}
