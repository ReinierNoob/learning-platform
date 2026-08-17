import { redirect } from "next/navigation";
import { eawUrl } from "@/lib/config";
import { getSessionUser, userApi } from "@/lib/supabase";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <main className="shell">
        <section className="hero">
          <span className="badge">EAW Learning</span>
          <h1>Je leeromgeving opent via Enterprise Architecture Works.</h1>
          <p>Start een training vanuit <strong>Mijn trainingen</strong>. Je hoeft hier niet opnieuw in te loggen.</p>
          <p><a className="button" href={eawUrl("/account")}>Naar Mijn trainingen</a></p>
        </section>
      </main>
    );
  }

  const response = await userApi(
    "/rest/v1/entitlements?select=course_id,status,starts_at,ends_at,courses(slug)&status=eq.active&order=ends_at.desc&limit=1",
  );
  const rows = response.ok
    ? (await response.json()) as Array<{ course_id: string; courses: { slug: string } | { slug: string }[] | null }>
    : [];
  const course = Array.isArray(rows[0]?.courses) ? rows[0].courses[0] : rows[0]?.courses;
  if (course?.slug) redirect(`/leren/${course.slug}`);

  return (
    <main className="shell">
      <section className="hero">
        <h1>Geen actieve training gevonden.</h1>
        <p>Ga terug naar EAW om je trainingen te bekijken.</p>
        <p><a className="button" href={eawUrl("/account")}>Mijn trainingen</a></p>
      </section>
    </main>
  );
}
