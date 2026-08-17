import "server-only";

import { cookies } from "next/headers";

export const eawSupabaseUrl =
  process.env.EAW_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_EAW_SUPABASE_URL ??
  "https://mhjykzrljvtxauaatlom.supabase.co";

export const eawPublishableKey =
  process.env.EAW_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_EAW_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_qa9v9qDYMzr3Fr3h0N29gg_1Ip6gfb5";

export const accessCookieName = "eaw_learning_access_token";
export const refreshCookieName = "eaw_learning_refresh_token";

export type SessionUser = { id: string; email?: string | null };
export type LearningAccess = {
  training_id: string;
  course_slug: string;
  launch_path: string;
  entitlement_id: string | null;
  entitlement_status: string | null;
  can_access: boolean;
  starts_at: string | null;
  ends_at: string | null;
  first_opened_at: string | null;
  enrollment_id: string | null;
  enrollment_status: string | null;
  completion_percentage: number | string | null;
  last_activity_at: string | null;
  completed_at: string | null;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  launch_path: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  source_module_id: number;
  slug: string;
  title: string;
  position: number;
  is_required: boolean;
  is_published: boolean;
  content_version: string;
  level: string | null;
  study_load: string | null;
  case_study: string | null;
  disclaimer: string | null;
  chapters: Array<{ id: string; titel: string; tekst: string; video_url?: string | null }>;
  quiz: Array<{ nr: number; vraag: string; opties: Record<string, string> }>;
};

function authHeaders(token?: string | null) {
  return {
    apikey: eawPublishableKey,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

export async function getAccessToken() {
  return (await cookies()).get(accessCookieName)?.value ?? null;
}

export async function getRefreshToken() {
  return (await cookies()).get(refreshCookieName)?.value ?? null;
}

export async function getSessionUser(token?: string | null): Promise<SessionUser | null> {
  const accessToken = token ?? (await getAccessToken());
  if (!accessToken) return null;
  const response = await fetch(`${eawSupabaseUrl}/auth/v1/user`, {
    headers: authHeaders(accessToken),
    cache: "no-store",
  });
  return response.ok ? response.json() : null;
}

export async function rpc<T>(name: string, body: Record<string, unknown>, token: string): Promise<T> {
  const response = await fetch(`${eawSupabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${name}:${response.status}:${await response.text()}`);
  return response.json();
}

export async function getLearningAccess(trainingId: string, token: string) {
  return rpc<LearningAccess>("get_my_learning_access", { p_training_id: trainingId }, token);
}

export async function startCourse(trainingId: string, token: string) {
  return rpc<Record<string, unknown>>("start_my_course", { p_training_id: trainingId }, token);
}

export async function getCourseBySlug(slug: string, token?: string | null): Promise<Course | null> {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/courses?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,slug,title,description,launch_path&limit=1`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] ?? null;
}

const moduleSelect = [
  "id",
  "course_id",
  "source_module_id",
  "slug",
  "title",
  "position",
  "is_required",
  "is_published",
  "content_version",
  "level",
  "study_load",
  "case_study",
  "disclaimer",
  "chapters",
  "quiz",
].join(",");

export async function getPublishedModules(courseId: string, token: string): Promise<CourseModule[]> {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?course_id=eq.${courseId}&is_published=eq.true&select=${moduleSelect}&order=position.asc`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`course_modules:${response.status}`);
  return response.json();
}

export async function getPublishedModule(courseId: string, sourceModuleId: number, token: string): Promise<CourseModule | null> {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?course_id=eq.${courseId}&source_module_id=eq.${sourceModuleId}&is_published=eq.true&select=${moduleSelect}&limit=1`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] ?? null;
}

export async function getModuleItems(moduleId: string, token: string) {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/module_items?module_id=eq.${moduleId}&select=id,item_type,title,position,is_required&order=position.asc`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`module_items:${response.status}`);
  return response.json() as Promise<Array<{ id: string; item_type: string; title: string; position: number; is_required: boolean }>>;
}

function serviceHeaders() {
  const key = process.env.EAW_SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error("Missing EAW_SUPABASE_SERVICE_ROLE_KEY");
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function getModuleServerOnly(moduleId: string) {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?id=eq.${moduleId}&select=id,course_id,source_module_id,title,system_instruction,quiz&limit=1`,
    { headers: serviceHeaders(), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`module_server:${response.status}`);
  const rows = await response.json();
  return rows[0] ?? null;
}

export async function getModuleServerOnlyBySource(courseId: string, sourceModuleId: number) {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?course_id=eq.${courseId}&source_module_id=eq.${sourceModuleId}&select=id,course_id,source_module_id,title,system_instruction,quiz&limit=1`,
    { headers: serviceHeaders(), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`module_server:${response.status}`);
  const rows = await response.json();
  return rows[0] ?? null;
}

export async function recordProgress(token: string, payload: Record<string, unknown>) {
  const response = await fetch(`${eawSupabaseUrl}/functions/v1/record-progress`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? `record_progress:${response.status}`);
  return result;
}

export function parseAnswerKey(systemInstruction: string) {
  const answers = new Map<number, { answer: string; explanation: string }>();
  for (const match of systemInstruction.matchAll(/(?:^|\n)\s*(\d+)\s*=\s*([A-D])\s*\(([^\n]+)\)/g)) {
    answers.set(Number(match[1]), { answer: match[2], explanation: match[3] });
  }
  return answers;
}
