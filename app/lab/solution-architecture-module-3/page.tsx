import { notFound } from "next/navigation";
import AdaptiveModule3Experience from "../../../components/adaptive/solution-architecture-module-3/AdaptiveModule3Experience";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EAW Learning QA — Solution Architecture Module 3",
  description: "Preview-only QA-harness voor de adaptieve Module 3-runtime.",
  robots: { index: false, follow: false },
};

export default function SolutionArchitectureModule3LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule3Experience />;
}
