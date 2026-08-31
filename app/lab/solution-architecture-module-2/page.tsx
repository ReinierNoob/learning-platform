import { notFound } from "next/navigation";
import AdaptiveModule2Experience from "../../../components/adaptive/solution-architecture-module-2/AdaptiveModule2Experience";

export const metadata = {
  title: "EAW Learning QA — Solution Architecture Module 2",
  description: "Preview-only QA-harness voor de adaptieve Module 2-runtime.",
  robots: { index: false, follow: false },
};

export default function SolutionArchitectureModule2LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule2Experience />;
}
