import "server-only";
import { eawSupabaseUrl } from "./platform";

/** Call only after session and entitlement checks; identity always comes from the session. */
export async function courseWorkRpc<T>(name: "course_practice_work" | "grade_course_module", payload: Record<string, unknown>): Promise<T> {
  const key = process.env.EAW_SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("persistence_unavailable");
  const r = await fetch(`${eawSupabaseUrl}/rest/v1/rpc/${name}`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
  if (!r.ok) {
    const error = await r.json().catch(() => ({}));
    const message = String(error.message ?? "");
    throw new Error(["work_conflict", "content_changed", "answers_invalid"].includes(message) ? message : "persistence_unavailable");
  }
  return r.json() as Promise<T>;
}
