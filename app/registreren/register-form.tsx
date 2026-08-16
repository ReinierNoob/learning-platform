"use client";

import { FormEvent, useState } from "react";

export default function RegisterForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setError(""); setMessage("");
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), firstName: form.get("firstName"), lastName: form.get("lastName") }) });
    const result = await response.json(); if (!response.ok) return setError(result.error); setMessage("Controleer je inbox en verifieer je e-mailadres. Daarna wordt een bestaande uitnodiging automatisch gekoppeld.");
  }
  return <form className="auth-form" onSubmit={submit}><div className="row"><label>Voornaam<input name="firstName" required /></label><label>Achternaam<input name="lastName" required /></label></div><label>E-mailadres uit de uitnodiging<input name="email" type="email" required /></label><label>Wachtwoord<input name="password" type="password" minLength={10} required /></label>{error && <p className="error">{error}</p>}{message && <p className="success">{message}</p>}<button>Account aanmaken</button></form>;
}
