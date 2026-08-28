import { redirect } from "next/navigation";
import { getAccessToken, getCourseBySlug, getLearningAccess, getSessionUser } from "../../../lib/platform";
import InteractiveTutorPoc from "./InteractiveTutorPoc";

const TOGAF_COURSE_SLUG = "togaf-business-architecture-readiness";

export const metadata = {
  title: "EAW Learning Lab — Value Stream PoC",
  description: "Proof of concept voor een interactieve interviewer- en tutorles met visuele modelopbouw.",
  robots: { index: false, follow: false },
};

function getPocLaunchUrl() {
  const accountBase = process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account";
  return new URL("/api/learning/lab/value-stream-poc", accountBase).toString();
}

export default async function ValueStreamPocPage() {
  const currentPath = "/lab/value-stream-poc";
  const token = await getAccessToken();
  if (!token) redirect(getPocLaunchUrl());

  const user = await getSessionUser(token);
  if (!user) redirect(`/api/auth/refresh?next=${encodeURIComponent(currentPath)}`);

  const course = await getCourseBySlug(TOGAF_COURSE_SLUG, token).catch(() => null);
  if (!course) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Learning Lab</p><h1>De training kon niet worden gevonden.</h1><a className="button" href="/">Terug naar de leeromgeving</a></section></main>;
  }

  const access = await getLearningAccess(course.id, token).catch(() => null);
  if (!access?.can_access) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Learning Lab</p><h1>Deze PoC is alleen beschikbaar met toegang tot de training.</h1><a className="button" href="/">Terug naar de leeromgeving</a></section></main>;
  }

  return <InteractiveTutorPoc />;
}
