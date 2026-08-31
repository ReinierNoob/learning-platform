import { notFound } from "next/navigation";
import AdaptiveModule6Experience from "../../../components/adaptive/solution-architecture-module-6/AdaptiveModule6Experience";

export const metadata = {
  title: "EAW Learning QA — Solution Architecture Module 6",
  description: "Preview-only QA-harness voor de generieke adaptieve Module 6-runtime.",
  robots: { index: false, follow: false },
};

export default function SolutionArchitectureModule6LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule6Experience showReviewDetails />;
}
