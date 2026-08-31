import { notFound } from "next/navigation";
import AdaptiveModule10Experience from "../../../components/adaptive/solution-architecture-module-10/AdaptiveModule10Experience";

export const metadata = { title: "EAW Learning QA — Solution Architecture Module 10", description: "Preview-only QA-harness voor de adaptieve Module 10-runtime.", robots: { index: false, follow: false } };

export default function SolutionArchitectureModule10LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule10Experience />;
}
