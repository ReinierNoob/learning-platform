import "server-only";

const SYNTHESIA_API_BASE = "https://api.synthesia.io/v2";

export type SynthesiaCreateTemplateVideoInput = {
  apiKey: string;
  templateId: string;
  scriptVariableName: string;
  script: string;
  title: string;
  callbackId?: string;
};

export type SynthesiaVideo = {
  id: string;
  status?: "in_progress" | "complete" | "error" | "rejected" | string;
  download?: string;
  duration?: string;
  callbackId?: string;
};

function assertConfigured(value: string, name: string) {
  if (!value.trim()) throw new Error(`${name} is required`);
}

export async function createSynthesiaTemplateTestVideo(
  input: SynthesiaCreateTemplateVideoInput,
): Promise<SynthesiaVideo> {
  assertConfigured(input.apiKey, "Synthesia API key");
  assertConfigured(input.templateId, "Synthesia template ID");
  assertConfigured(input.scriptVariableName, "Synthesia script variable name");
  assertConfigured(input.script, "Synthesia script");

  const response = await fetch(`${SYNTHESIA_API_BASE}/videos/fromTemplate`, {
    method: "POST",
    headers: {
      Authorization: input.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      templateId: input.templateId,
      templateData: {
        [input.scriptVariableName]: input.script,
      },
      title: input.title,
      callbackId: input.callbackId,
      test: true,
      visibility: "private",
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.id !== "string") {
    throw new Error(`Synthesia create video failed: HTTP ${response.status}`);
  }

  return payload as SynthesiaVideo;
}

export async function retrieveSynthesiaVideo(apiKey: string, videoId: string): Promise<SynthesiaVideo> {
  assertConfigured(apiKey, "Synthesia API key");
  assertConfigured(videoId, "Synthesia video ID");

  const response = await fetch(`${SYNTHESIA_API_BASE}/videos/${encodeURIComponent(videoId)}`, {
    headers: { Authorization: apiKey },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.id !== "string") {
    throw new Error(`Synthesia retrieve video failed: HTTP ${response.status}`);
  }

  return payload as SynthesiaVideo;
}
