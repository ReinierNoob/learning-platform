# TOGAF Business Architecture refactor rc1

The previous lesson view could not render the expanded course tables, the tutor did not receive chapter content, and learners could not retry a completed self-test from the UI. This change supports the separately authored eight-module course: GFM tables, progressive model explanations, versioned practice work, chapter-aware tutoring and retryable assessments.

Course content remains in `course_modules`. Private answer data stays in its existing restricted `system_instruction` column, now as a structured JSON assessment for refactor versions. Neither proprietary lesson payloads nor answer keys are committed to this public repository. The import helper consumes a private bundle and emits an atomic SQL transaction guarded by every module's original content version and update timestamp.

Practice work appends `self_report` events in existing `learning_evidence`. It does not modify existing mastery/profile data, record completion, or claim assessment. Optimistic conflict checks preserve concurrent drafts. Learners can explicitly include their saved work in a tutor conversation. The grading RPC checks current version and entitlement before returning any answer data; content completion, quiz attempts and attempt version are written in one transaction through existing progress functions. There is no new pass threshold.

## Validation on 3 September 2026

- Next.js production build and TypeScript: PASS.
- Existing environment contract and adaptive route convergence: PASS.
- New HTTP rejection cases (invalid requests and unauthenticated chat/grade/practice): PASS.
- RPCs applied to the existing test project only. Transactional test with temporary content: save/reload, stale-tab conflict, stale content, profile preservation, correct grading, retries, attempt version, invalid input, missing entitlement, no partial writes and function grants: PASS. All fixture data rolled back.
- Full browser interaction: BLOCKED in this execution environment. Cloud Browser rejects local URLs; standalone browser setup failed on certificate/download access. No physical UX or full authenticated E2E pass is claimed.
- No production data import or deployment performed. No real AI response quality test performed.

## Deployment order and remaining gates

Apply `supabase/refactor/course_work.sql` through the database migration process to the test target first; then validate the private content bundle on an isolated preview with matching auth/entitlement configuration. The runtime requires the existing server-only `EAW_SUPABASE_SERVICE_ROLE_KEY` for practice and refactor grading. Check the exact preview's service binding, RLS, access expiry, fixed module order, save/reload, conflict, quiz retry and recorded progress. The new functions grant EXECUTE only to service_role; all public API routes resolve the user from the session.

The revised lesson media must be uploaded into the existing secured course media flow and linked to its content version. Current authoring clears obsolete videos; the new model video is delivered separately. Verify captions, transcript, seeking, small-screen readability and actual Dutch audio before release. Complete the current OGBA-101 syllabus objective mapping and independent content/assessment review; topic mapping alone does not establish exam readiness.

Release status: **NO-GO for production promotion** until these evidence gaps are closed. This is a reviewable implementation, not a production release.

Rollback: keep the prior database content snapshot and runtime release; revert runtime code independently. Remove neither learning evidence nor attempts. If restoring prior content, preserve newer practice versions and attempt records. The SQL import guard deliberately aborts on concurrent content changes.
