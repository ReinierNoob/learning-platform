import { notFound } from "next/navigation";
import AdaptiveModule6PilotV3 from "./AdaptiveModule6PilotV3";

export const metadata = {
  title: "EAW Learning Lab — Solution Architecture Module 6",
  description: "Preview-only pilot voor adaptieve diagnostiek, routing en tutorinterventies in Solution Architecture.",
  robots: { index: false, follow: false },
};

export default function SolutionArchitectureModule6LabPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <AdaptiveModule6PilotV3 />;
}