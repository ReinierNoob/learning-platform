import { notFound } from "next/navigation";
import AdaptiveModule4Experience from "../../../components/adaptive/solution-architecture-module-4/AdaptiveModule4Experience";

export const metadata = {
  title: "EAW Learning QA — Solution Architecture Module 4",
  description: "Preview-only QA-harness voor de adaptieve Module 4-runtime.",
  robots: { index: false, follow: false },
};

export default function SolutionArchitectureModule4LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule4Experience />;
}
