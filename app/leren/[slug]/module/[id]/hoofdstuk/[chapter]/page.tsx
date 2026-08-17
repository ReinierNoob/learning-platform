import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getAccessToken, getCourseBySlug, getLearningAccess, getPublishedModule, getSessionUser, startCourse } from "../../../../../../../lib/platform";
import { ChatClient } from "../../learning-client";
import { VideoPlayer } from "./video-player";

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; id: string; chapter: string }> }) {
  const { slug, id, chapter: chapterId } = await params;
  const sourceModuleId = Number(id);
  if (!Number.isInteger(sourceModuleId) || sourceModuleId < 1) {
    return <main className="shell"><section className="hero"><h1>Module niet gevonden.</h1></section></main>;
  }

  const chapterPath = `/leren/${slug}/module/${sourceModuleId}/hoofdstuk/${encodeURIComponent(chapterId)}`;
  const token = await getAccessToken();
  if (!token) redirect("/");
  const user = await getSessionUser(token);
  if (!user) redirect(`/api/auth/refresh?next=${encodeURIComponent(chapterPath)}`);

  const course = await getCourseBySlug(slug, token);
  if (!course) return <main className="shell"><section className="hero"><h1>Training niet gevonden.</h1></section></main>;

  const access = await getLearningAccess(course.id, token);
  if (!access.can_access) redirect(`/leren/${slug}`);
  await startCourse(course.id, token);

  const module = await getPublishedModule(course.id, sourceModuleId, token);
  if (!module) redirect(`/leren/${slug}/module/${sourceModuleId}`);

  const chapters = module.chapters ?? [];
  const chapterIndex = chapters.findIndex((item) => String(item.id) === chapterId);
  if (chapterIndex < 0) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Hoofdstuk niet gevonden</p><h1>Dit hoofdstuk is niet beschikbaar.</h1><a className="button" href={`/leren/${slug}/module/${sourceModuleId}`}>Terug naar de hoofdstukken</a></section></main>;
  }

  const chapter = chapters[chapterIndex];
  const previous = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const next = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  return <main className="shell chapterShell">
    <header className="topbar">
      <a className="brand" href={`/leren/${slug}/module/${sourceModuleId}`}>← {module.title}</a>
      <div><span className="meta">{user.email}</span> <form action="/api/auth/logout" method="post" style={{ display: "inline" }}><button className="button secondary" type="submit">Uitloggen</button></form></div>
    </header>

    <section className="chapterHeader">
      <div><p className="eyebrow dark">Module {module.position} · Hoofdstuk {chapterIndex + 1} van {chapters.length}</p><h1>{chapter.titel}</h1></div>
      <a className="button secondary" href={`/leren/${slug}/module/${sourceModuleId}`}>Alle hoofdstukken</a>
    </section>

    <div className="chapterLearningLayout">
      <div className="lessonColumn">
        <section className="instructorCard">
          <div className="instructorAvatar" aria-hidden="true">A</div>
          <div><p className="eyebrow dark">Je instructeur</p><h2>Alexander</h2><p className="meta">Alexander begeleidt je door de lesstof en helpt je begrippen, modellen en toepassingen in deze module te doorgronden.</p></div>
        </section>

        <article className="lessonContent">
          <div className="lessonIntro"><span className="badge">Hoofdstuk {chapterIndex + 1}</span><h2>{chapter.titel}</h2></div>
          <VideoPlayer trainingId={course.id} moduleId={module.source_module_id} chapterId={String(chapter.id)} />
          <div className="markdownBody"><ReactMarkdown>{chapter.tekst}</ReactMarkdown></div>
        </article>
      </div>

      <aside className="chatColumn">
        <ChatClient trainingId={course.id} moduleId={module.source_module_id} />
      </aside>
    </div>

    <nav className="chapterNav" aria-label="Hoofdstuknavigatie">
      {previous ? <a className="chapterNavLink previous" href={`/leren/${slug}/module/${sourceModuleId}/hoofdstuk/${encodeURIComponent(previous.id)}`}><span className="meta">← Vorige</span><strong>{previous.titel}</strong></a> : <span />}
      {next ? <a className="chapterNavLink next" href={`/leren/${slug}/module/${sourceModuleId}/hoofdstuk/${encodeURIComponent(next.id)}`}><span className="meta">Volgende →</span><strong>{next.titel}</strong></a> : <a className="chapterNavLink next" href={`/leren/${slug}/module/${sourceModuleId}`}><span className="meta">Hoofdstukken afgerond →</span><strong>Naar de zelftoets</strong></a>}
    </nav>

    {module.disclaimer ? <p className="footer">{module.disclaimer}</p> : null}
  </main>;
}
