import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EAW Leeromgeving",
  description: "Beveiligde leeromgeving van Enterprise Architecture Works.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
