import { notFound } from "next/navigation";
import AdaptiveModule8Experience from "../../../components/adaptive/solution-architecture-module-8/AdaptiveModule8Experience";

export const metadata = { title: "EAW Learning QA — Solution Architecture Module 8", description: "Preview-only QA-harness voor de adaptieve Module 8-runtime.", robots: { index: false, follow: false } };

export default function SolutionArchitectureModule8LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule8Experience />;
}
