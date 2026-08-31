import "server-only";

type RouteHandler = (request: Request) => Promise<Response>;
type JsonAdapter = (body: Record<string, unknown>) => Record<string, unknown>;

/**
 * Keeps legacy JSON response contracts stable while the endpoint implementation
 * itself is delegated to the generic adaptive route factory.
 */
export function withAdaptiveJsonResponseAdapter(handler: RouteHandler, adapter: JsonAdapter): RouteHandler {
  return async function adaptedHandler(request: Request) {
    const response = await handler(request);
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("application/json")) return response;

    const body = await response.clone().json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return response;

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("content-type", "application/json");

    return new Response(JSON.stringify(adapter(body)), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

export function preserveModule5DiagnosisResponse(body: Record<string, unknown>) {
  const { conceptMastery, ...rest } = body;
  return {
    ...rest,
    mastery: conceptMastery,
  };
}

export function preserveModule6DiagnosisResponse(body: Record<string, unknown>) {
  const route = body.route;
  const reasonCode = body.reasonCode;
  const evidence = Array.isArray(body.evidence) ? body.evidence : [];
  const factoryProfile = (body.profile && typeof body.profile === "object")
    ? body.profile as Record<string, unknown>
    : {};
  const transitionIds = factoryProfile.transitionIds;
  const persistedEvidenceIds = transitionIds && typeof transitionIds === "object" && Array.isArray((transitionIds as Record<string, unknown>).evidenceIds)
    ? (transitionIds as Record<string, unknown>).evidenceIds as unknown[]
    : null;
  const evidenceIds = persistedEvidenceIds ?? evidence
    .map((item) => item && typeof item === "object" ? (item as Record<string, unknown>).id : null)
    .filter(Boolean);

  return {
    route,
    reasonCode,
    sequence: body.sequence,
    evidence,
    misconceptions: body.misconceptions,
    profile: {
      module: 6,
      conceptMastery: body.conceptMastery,
      routeHistory: [{ route, reasonCode, evidenceIds }],
      persistence: factoryProfile.persistence,
      transitionIds,
    },
  };
}
