# EAW Learning Platform

This repository is the recoverable source baseline for the Enterprise Architecture Works learning environment.

## Architecture

The learning app is a separate Next.js application, but it shares the EAW commerce/learning data model.

### Shared EAW Supabase project

Preview ref: `mhjykzrljvtxauaatlom`

The shared project owns:

- Supabase Auth identity
- canonical `training_id` (`public.courses.id`)
- entitlements and access dates
- enrollments and progress
- module/item completion
- trusted course completion
- EAW completion-certificate metadata

The learning app never calculates commercial access locally. It calls:

- `get_my_learning_access(training_id)` before rendering a course
- `start_my_course(training_id)` during the SSO handoff
- `record-progress` for content and assessment completion

Only authenticated users can execute the learning access/start RPCs.

## Cross-domain SSO

EAW and the learning app use different domains, so cookies are not shared directly.

The flow is:

1. EAW validates the user's entitlement.
2. EAW `create-learning-handoff` creates a one-time Supabase Auth `token_hash` for the same authenticated user.
3. EAW redirects to `/auth/handoff` on this app.
4. This app verifies the one-time hash with the shared Supabase project.
5. Access is checked again with `get_my_learning_access`.
6. `start_my_course` records first-open/enrollment idempotently.
7. This app stores its own HttpOnly access/refresh cookies and immediately redirects without the token in the URL.
8. `proxy.ts` refreshes an expired short-lived access cookie from the HttpOnly refresh cookie.

No service-role key is exposed to the browser.

## Learning content

Course and module content is read from the shared Supabase database under RLS. The app does not duplicate chapter or quiz content in source code.

At the current preview baseline, module 1 is centrally published. Unpublished/missing modules are not invented by the UI.

## Progress and completion

A module can contain multiple required items. For module 1 this includes both learning content and the assessment.

- `CompleteContent` records the required content item through `record-progress`.
- `Quiz` sends answers only; assessment scoring remains server-side.
- `complete_module_item` checks active entitlement, module order and completion requirements.
- trusted completed enrollments synchronize to `course_completions`.
- EAW generates the private completion certificate from that trusted completion record.

## Private course video storage

Video files remain in the existing Supabase project:

`jtdcinvkpprgnwvtwvms` (`togaf-business-architectuur`)

Bucket `cursus-videos` is private.

The legacy public signing endpoint is not used by this new source. Instead:

1. browser requests `/api/video-url/{module}/{chapter}` on this authenticated learning app;
2. the app forwards the shared EAW user JWT to `secure-video-url` in the video-storage project;
3. that function validates the user against the shared EAW Supabase Auth project;
4. it rechecks the canonical TOGAF entitlement;
5. only then does the video project issue a 15-minute signed Storage URL.

The `secure-video-url` source is retained in this repository under `supabase/functions/secure-video-url/` and is currently deployed as an additive function in the existing video project. Existing video files and policies were not modified.

## Environment

Expected public configuration:

- `NEXT_PUBLIC_SUPABASE_URL` — shared EAW Supabase project
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — shared project publishable key
- `NEXT_PUBLIC_EAW_URL` — stable EAW base URL

No Vercel production cutover has been performed from this branch.

## Production gates

Do not replace the current learning-platform production deployment until all of the following are green:

1. connect this GitHub repository to the Vercel `learning-platform` project and create a preview deployment from `agent/eaw-sso-integration`;
2. verify build/TypeScript on Vercel;
3. update EAW preview launch to use `create-learning-handoff` and this preview callback;
4. test SSO end-to-end without a second login;
5. test entitlement denial, expiry and refund denial;
6. test private video playback through the entitlement-checked signing route;
7. test content-item completion + assessment progress;
8. complete a real preview course and verify `course_completions` + private EAW certificate;
9. migrate/verify the remaining curriculum modules in central Supabase before publishing them;
10. only then plan a controlled production cutover.
