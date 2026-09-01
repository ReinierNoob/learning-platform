import { notFound } from "next/navigation";
import AdaptiveModule7Experience from "../../../components/adaptive/solution-architecture-module-7/AdaptiveModule7Experience";

export const dynamic = "force-dynamic";

export const metadata = { title: "EAW Learning QA — Solution Architecture Module 7", description: "Preview-only QA-harness voor Module 7.", robots: { index: false, follow: false } };

export default function SolutionArchitectureModule7LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule7Experience />;
}
