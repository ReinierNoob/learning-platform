"use client";

import { useEffect, useState } from "react";

export function VideoPlayer({ trainingId, moduleId, chapterId }: { trainingId: string; moduleId: number; chapterId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      const response = await fetch(`/api/video-url/${moduleId}/${encodeURIComponent(chapterId)}?training_id=${encodeURIComponent(trainingId)}&format=json`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (cancelled) return;
      if (!response.ok || typeof data.url !== "string") {
        setError("De video kon niet worden geladen. Probeer de pagina opnieuw te openen.");
        return;
      }
      setSrc(data.url);
    }
    void load();
    return () => { cancelled = true; };
  }, [trainingId, moduleId, chapterId]);

  if (error) return <div className="notice" role="alert">{error}</div>;
  if (!src) return <div className="videoLoading">Video wordt geladen…</div>;

  return <video controls preload="metadata" playsInline>
    <source src={src} type="video/mp4" />
    Je browser ondersteunt deze video niet.
  </video>;
}
