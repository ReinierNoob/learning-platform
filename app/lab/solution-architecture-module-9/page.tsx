import { notFound } from "next/navigation";
import AdaptiveModule9Experience from "../../../components/adaptive/solution-architecture-module-9/AdaptiveModule9Experience";

export const dynamic = "force-dynamic";

export const metadata = { title: "EAW Learning QA — Solution Architecture Module 9", description: "Preview-only QA-harness voor Module 9.", robots: { index: false, follow: false } };

export default function SolutionArchitectureModule9LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule9Experience />;
}
