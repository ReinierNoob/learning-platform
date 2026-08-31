import { notFound } from "next/navigation";
import AdaptiveModule5Experience from "../../../components/adaptive/solution-architecture-module-5/AdaptiveModule5Experience";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EAW Learning QA — Solution Architecture Module 5",
  description: "Preview-only QA-harness voor de config-driven adaptieve Module 5-runtime op ArchiMate 4.",
  robots: { index: false, follow: false },
};

export default function SolutionArchitectureModule5LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule5Experience />;
}
