import { notFound } from "next/navigation";
import AdaptiveModule1Experience from "../../../components/adaptive/solution-architecture-module-1/AdaptiveModule1Experience";

export const metadata = {
  title: "EAW Learning QA — Solution Architecture Module 1",
  description: "Preview-only QA-harness voor de adaptieve Module 1-runtime.",
  robots: { index: false, follow: false },
};

export default function SolutionArchitectureModule1LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule1Experience />;
}
