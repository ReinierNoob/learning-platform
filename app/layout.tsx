import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EAW Learning",
  description: "Beveiligde leeromgeving van Enterprise Architecture Works.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}</body></html>;
}
