"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function HandoffPage() {
  const search = useSearchParams();
  const [message, setMessage] = useState("Je leeromgeving wordt geopend…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const requested = search.get("next") ?? "/";
    const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
    history.replaceState(null, "", `${location.pathname}${location.search}`);

    if (!accessToken || !refreshToken) {
      setMessage("De beveiligde aanmelding ontbreekt. Open de training opnieuw via Mijn trainingen.");
      return;
    }

    fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("invalid_session");
        window.location.replace(next);
      })
      .catch(() => setMessage("Aanmelden bij de leeromgeving is niet gelukt. Open de training opnieuw via Mijn trainingen."));
  }, [search]);

  return <main className="shell"><section className="hero"><p className="eyebrow">EAW Leeromgeving</p><h1>{message}</h1></section></main>;
}
