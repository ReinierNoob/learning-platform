import "server-only";

import { cookies } from "next/headers";

const configuredEawSupabaseUrl =
  process.env.EAW_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_EAW_SUPABASE_URL;

const configuredEawPublishableKey =
  process.env.EAW_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_EAW_SUPABASE_PUBLISHABLE_KEY;

if (!configuredEawSupabaseUrl || !configuredEawPublishableKey) {
  throw new Error("Missing EAW_SUPABASE_URL or EAW_SUPABASE_PUBLISHABLE_KEY");
}

export const eawSupabaseUrl = configuredEawSupabaseUrl;
export const eawPublishableKey = configuredEawPublishableKey;

export const accessCookieName = "eaw_learning_access_token";
export const refreshCookieName = "eaw_learning_refresh_token";

export function getEawLoginUrl(nextPath = "/account") {
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
  const accountUrl = process.env.EAW_ACCOUNT_URL ?? "https://enterprisearchitectureworks.nl/account";
  const loginUrl = new URL("/account/inloggen", accountUrl);
  loginUrl.searchParams.set("next", safeNext);
  return loginUrl.toString();
}

export type SessionUser = { id: string; email?: string | null };
export type LearningAccess = {
  training_id: string;
  course_slug: string;
  launch_path: string | null;
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

export type CourseStart = {
  training_id: string;
  entitlement_id: string;
  enrollment_id: string;
  entitlement_status: string;
  enrollment_status: string;
  starts_at: string;
  ends_at: string;
  first_opened_at: string | null;
  completion_percentage: number | string | null;
  last_activity_at: string | null;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
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
  tutor_instruction: string | null;
};

export type AssessmentResult = {
  nr: number;
  correct: boolean;
  juisteAntwoord: string;
  uitleg: string;
  keuzeUitleg?: string;
};

export type ProgressResult = {
  progress: unknown;
  resultaten: AssessmentResult[] | null;
  score: number | null;
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

  // OAuth 2.1 access tokens issued to the learning client must be validated
  // through the OIDC UserInfo endpoint. This is the standards-based identity
  // endpoint for Supabase OAuth clients. During the zero-downtime migration we
  // keep the legacy /user check as a fallback for the temporary magic-link
  // handoff token, which is a normal Supabase Auth session token.
  const userInfoResponse = await fetch(`${eawSupabaseUrl}/auth/v1/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (userInfoResponse.ok) {
    const info = (await userInfoResponse.json()) as {
      sub?: string;
      email?: string | null;
    };
    if (typeof info.sub === "string" && info.sub.length > 0) {
      return { id: info.sub, email: info.email ?? null };
    }
  }

  const legacyResponse = await fetch(`${eawSupabaseUrl}/auth/v1/user`, {
    headers: authHeaders(accessToken),
    cache: "no-store",
  });
  return legacyResponse.ok ? legacyResponse.json() : null;
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

function firstRpcRow<T>(value: T | T[], name: string): T {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row) throw new Error(`${name}:empty_result`);
  return row;
}

export async function getLearningAccess(trainingId: string, token: string): Promise<LearningAccess> {
  const result = await rpc<LearningAccess | LearningAccess[]>(
    "get_my_learning_access",
    { p_course_id: trainingId },
    token,
  );
  return firstRpcRow(result, "get_my_learning_access");
}

export async function startCourse(trainingId: string, token: string): Promise<CourseStart> {
  const result = await rpc<CourseStart | CourseStart[]>(
    "start_my_course",
    { p_course_id: trainingId },
    token,
  );
  return firstRpcRow(result, "start_my_course");
}

export async function getCourseBySlug(slug: string, token?: string | null): Promise<Course | null> {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/courses?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,slug,title,description&limit=1`,
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
  "tutor_instruction",
].join(",");

export async function getPublishedModules(courseId: string, token: string): Promise<CourseModule[]> {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?course_id=eq.${encodeURIComponent(courseId)}&is_published=eq.true&select=${moduleSelect}&order=position.asc`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`course_modules:${response.status}`);
  return response.json();
}

export async function getPublishedModule(courseId: string, sourceModuleId: number, token: string): Promise<CourseModule | null> {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?course_id=eq.${encodeURIComponent(courseId)}&source_module_id=eq.${sourceModuleId}&is_published=eq.true&select=${moduleSelect}&limit=1`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] ?? null;
}

export async function getModuleSystemInstruction(moduleId: string, token: string): Promise<string | null> {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/course_modules?id=eq.${encodeURIComponent(moduleId)}&select=system_instruction&limit=1`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) return null;
  const rows = await response.json() as Array<{ system_instruction?: string | null }>;
  return rows[0]?.system_instruction ?? null;
}

export async function getModuleItems(moduleId: string, token: string) {
  const response = await fetch(
    `${eawSupabaseUrl}/rest/v1/module_items?module_id=eq.${encodeURIComponent(moduleId)}&select=id,item_type,title,position,is_required&order=position.asc`,
    { headers: authHeaders(token), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`module_items:${response.status}`);
  return response.json() as Promise<Array<{ id: string; item_type: string; title: string; position: number; is_required: boolean }>>;
}

export async function recordProgress(token: string, payload: Record<string, unknown>): Promise<ProgressResult> {
  const response = await fetch(`${eawSupabaseUrl}/functions/v1/record-progress`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? `record_progress:${response.status}`);
  return result as ProgressResult;
}
