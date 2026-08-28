import { redirect } from "next/navigation";
import { getAccessToken, getEawLoginUrl, getLearningAccess, getSessionUser } from "../../../lib/platform";
import InteractiveTutorPoc from "./InteractiveTutorPoc";

const TOGAF_TRAINING_ID = "87ca0f96-3cb3-4d12-84bd-94cb77a3e603";

export const metadata = {
  title: "EAW Learning Lab — Value Stream PoC",
  description: "Proof of concept voor een interactieve interviewer- en tutorles met visuele modelopbouw.",
  robots: { index: false, follow: false },
};

export default async function ValueStreamPocPage() {
  const currentPath = "/lab/value-stream-poc";
  const token = await getAccessToken();
  if (!token) redirect(getEawLoginUrl(currentPath));

  const user = await getSessionUser(token);
  if (!user) redirect(`/api/auth/refresh?next=${encodeURIComponent(currentPath)}`);

  const access = await getLearningAccess(TOGAF_TRAINING_ID, token).catch(() => null);
  if (!access?.can_access) {
    return <main className="shell"><section className="hero"><p className="eyebrow">Learning Lab</p><h1>Deze PoC is alleen beschikbaar met toegang tot de training.</h1><a className="button" href="/">Terug naar de leeromgeving</a></section></main>;
  }

  return <InteractiveTutorPoc />;
}
