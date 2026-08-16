"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json(); setBusy(false); if (!response.ok) return setError(result.error);
    router.push("/"); router.refresh();
  }
  return <form className="auth-form" onSubmit={submit}><label>E-mailadres<input name="email" type="email" autoComplete="email" required /></label><label>Wachtwoord<input name="password" type="password" autoComplete="current-password" minLength={10} required /></label>{error && <p className="error" role="alert">{error}</p>}<button disabled={busy}>{busy ? "Bezig…" : "Inloggen"}</button></form>;
}
