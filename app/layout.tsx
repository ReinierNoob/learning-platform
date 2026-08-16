import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leren | Enterprise Architecture Works",
  description: "Beveiligde leeromgeving voor Enterprise Architecture Works.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}</body></html>;
}
