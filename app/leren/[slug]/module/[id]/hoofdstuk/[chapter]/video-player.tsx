"use client";

import { useEffect, useRef, useState } from "react";

export function VideoPlayer({ trainingId, moduleId, chapterId }: { trainingId: string; moduleId: number; chapterId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSource() {
      setError(null);
      setSrc(null);

      try {
        const response = await fetch(
          `/api/video-url/${moduleId}/${encodeURIComponent(chapterId)}?training_id=${encodeURIComponent(trainingId)}&format=json`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok || typeof data.url !== "string") {
          setError("De video kon niet worden geladen. Probeer de pagina opnieuw te openen.");
          return;
        }

        setSrc(data.url);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError("De video kon niet worden geladen. Probeer de pagina opnieuw te openen.");
      }
    }

    void loadSource();
    return () => controller.abort();
  }, [trainingId, moduleId, chapterId]);

  useEffect(() => {
    if (!src) return;
    videoRef.current?.load();
  }, [src]);

  function handleMediaError() {
    const code = videoRef.current?.error?.code;
    const detail = code ? ` (mediacode ${code})` : "";
    setError(`De video kan niet worden afgespeeld${detail}. Open de pagina opnieuw of probeer een andere browser.`);
  }

  if (error) return <div className="notice" role="alert">{error}</div>;
  if (!src) return <div className="videoLoading">Video wordt geladen…</div>;

  return (
    <video
      key={src}
      ref={videoRef}
      controls
      preload="metadata"
      playsInline
      src={src}
      onError={handleMediaError}
    >
      Je browser ondersteunt deze video niet.
    </video>
  );
}
