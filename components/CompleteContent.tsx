"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompleteContent({ itemId }: { itemId: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function complete() {
    if (!itemId) return;
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "progress_rejected");
      setResult("Leerinhoud is als afgerond geregistreerd.");
      router.refresh();
    } catch {
      setResult("De afronding kon niet worden opgeslagen. Probeer het opnieuw.");
    } finally {
      setPending(false);
    }
  }

  if (!itemId) return <p className="notice">Deze module heeft nog geen centrale leerinhoud-koppeling.</p>;

  return (
    <section className="completionBox">
      <h2>Leerinhoud afgerond?</h2>
      <p>Registreer dit pas nadat je de hoofdstukken van deze module hebt doorgenomen.</p>
      <button className="button" disabled={pending} onClick={complete}>
        {pending ? "Opslaan…" : "Markeer leerinhoud als afgerond"}
      </button>
      {result ? <p className="result" role="status">{result}</p> : null}
    </section>
  );
}
