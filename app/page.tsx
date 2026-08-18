import { redirect } from "next/navigation";
import { getAccessToken, getSessionUser } from "../lib/platform";

export default async function Home() {
  const token = await getAccessToken();
  const user = token ? await getSessionUser(token) : null;
  if (!token) {
    return <main className="shell"><section className="hero"><p className="eyebrow">EAW Leeromgeving</p><h1>Open je training via Mijn trainingen.</h1><p>De leeromgeving is alleen toegankelijk met een geldig EAW-account en een actief trainingsrecht.</p><a className="button" href={process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account"}>Naar Mijn trainingen</a></section></main>;
  }
  if (!user) redirect("/api/auth/refresh?next=%2F");
  return <main className="shell"><section className="hero"><p className="eyebrow">EAW Leeromgeving</p><h1>Je bent veilig aangemeld.</h1><p>Open de training opnieuw via Mijn trainingen zodat ook de juiste training-ID wordt meegegeven.</p></section></main>;
}
