import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser, userApi } from "../lib/supabase";

type Entitlement = { id: string; status: string; starts_at: string; ends_at: string; first_opened_at: string | null; courses: { title: string; slug: string } | null };

export default async function Dashboard() {
  const user = await getSessionUser(); if (!user) redirect("/inloggen");
  const response = await userApi("/rest/v1/entitlements?select=id,status,starts_at,ends_at,first_opened_at,courses(title,slug)&order=ends_at.desc");
  const entitlements: Entitlement[] = response.ok ? await response.json() : [];
  return <main><header className="topbar"><Link href="/" className="wordmark">EAW <span>Leren</span></Link><form action="/api/auth/logout" method="post"><button className="link-button">Uitloggen</button></form></header><section className="dashboard-hero"><p className="kicker">Persoonlijke leeromgeving</p><h1>Mijn e-learnings.</h1><p>Alleen cursussen met een actief, aan jouw account gekoppeld cursusrecht verschijnen hier.</p></section><section className="course-list">{entitlements.length ? entitlements.map((entitlement) => <article key={entitlement.id}><div><span>{entitlement.status}</span><span>Toegang t/m {new Date(entitlement.ends_at).toLocaleDateString("nl-NL")}</span></div><h2>{entitlement.courses?.title}</h2><p>{entitlement.first_opened_at ? "Ga verder waar je was gebleven." : "Je toegangstermijn is gestart. Open de cursus om te beginnen."}</p>{entitlement.courses && <Link href={`/leren/${entitlement.courses.slug}`}>Open de e-learning →</Link>}</article>) : <div className="empty"><h2>Geen actieve e-learning</h2><p>Je bent correct ingelogd, maar dit account heeft geen actief cursusrecht. Controleer of je hetzelfde e-mailadres gebruikt als bij de aankoop of uitnodiging.</p></div>}</section></main>;
}
