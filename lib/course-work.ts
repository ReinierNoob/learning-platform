import "server-only";
import { eawPublishableKey, eawSupabaseUrl } from "./platform";

/** Call only after session and entitlement checks; identity always comes from the session. */
export async function courseWorkRpc<T>(name: "course_practice_work" | "grade_course_module", payload: Record<string, unknown>, token: string): Promise<T> {
  if (!token) throw new Error("persistence_unavailable");
  const r = await fetch(`${eawSupabaseUrl}/functions/v1/course-work`, { method: "POST", headers: { apikey: eawPublishableKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: name, ...payload }), cache: "no-store" });
  if (!r.ok) {
    const error = await r.json().catch(() => ({}));
    const message = String(error.error ?? "");
    throw new Error(["work_conflict", "content_changed", "answers_invalid"].includes(message) ? message : "persistence_unavailable");
  }
  return r.json() as Promise<T>;
}
