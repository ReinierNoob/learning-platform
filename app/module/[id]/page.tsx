import { redirect } from "next/navigation";
import { eawUrl } from "@/lib/config";
import { getSessionUser, userApi } from "@/lib/supabase";

export default async function LegacyModulePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect(eawUrl("/account?learning=signin-required"));

  const { id } = await params;
  const sourceId = Number(id);
  if (!Number.isInteger(sourceId) || sourceId < 1) redirect("/");

  const response = await userApi(
    `/rest/v1/course_modules?select=slug,courses(slug)&source_module_id=eq.${sourceId}&is_published=eq.true&limit=1`,
  );
  const rows = response.ok
    ? (await response.json()) as Array<{ slug: string; courses: { slug: string } | { slug: string }[] | null }>
    : [];
  const row = rows[0];
  const course = Array.isArray(row?.courses) ? row.courses[0] : row?.courses;
  if (!row || !course) redirect("/");
  redirect(`/leren/${course.slug}?module=${encodeURIComponent(row.slug)}`);
}
