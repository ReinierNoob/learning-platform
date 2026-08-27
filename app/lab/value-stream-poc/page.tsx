import InteractiveTutorPoc from "./InteractiveTutorPoc";

export const metadata = {
  title: "EAW Learning Lab — Value Stream PoC",
  description: "Proof of concept voor een interactieve interviewer- en tutorles met visuele modelopbouw.",
  robots: { index: false, follow: false },
};

export default function ValueStreamPocPage() {
  return <InteractiveTutorPoc />;
}
