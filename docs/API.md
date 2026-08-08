# Internal API reference

Most mutations in this app are Next.js Server Actions (`"use server"`
functions called directly from Client Components), not REST routes — that's
why this file is short. Route Handlers under `src/app/api/` are reserved for
things that genuinely need an HTTP endpoint: webhooks, and (later) anything
external tools call directly.

## Conventions

- Server Actions validate input with Zod schemas from `src/lib/validators`
  before touching the database.
- Every action reads the caller's identity via `requireDbUser()`
  (`src/server/services/user.ts`), which wraps Clerk's `auth()`/`currentUser()`
  — never trust a client-supplied `userId`/`organizationId`.
- Every project/scan query is scoped by `organizationId` from the caller's own
  membership, not by a client-supplied id, so cross-tenant access 404s instead
  of leaking data.

## Webhooks

| Route | Purpose |
| --- | --- |
| `POST /api/webhooks/clerk` | Verifies the Svix signature, then syncs Clerk `user.created`/`updated`/`deleted` into the local `User` table (`src/app/api/webhooks/clerk/route.ts`) |

## Server Actions

| Action | File | Purpose |
| --- | --- | --- |
| `createProjectAction` | `src/features/projects/actions.ts` | Validates + creates a `Project`, redirects to its detail page |
| `deleteProjectAction` | `src/features/projects/actions.ts` | Deletes a project (and cascades scans/issues) |
| `updateOrganizationAction` | `src/features/settings/actions.ts` | Renames the workspace / changes its slug (owner/admin only) |
| `markNotificationReadAction` / `markAllNotificationsReadAction` | `src/features/notifications/actions.ts` | Marks notification(s) read |
| `runScanAction` | `src/features/scans/actions.ts` | Creates a `Scan` row and enqueues the BullMQ job that actually runs it |
| `explainIssueAction` | `src/features/ai/actions.ts` | Calls Gemini to write a plain-language explanation of an `Issue`, persists it |
| `generateFixAction` | `src/features/ai/actions.ts` | Calls Gemini to generate a `Fix` (diff snippet + explanation) for an `Issue` |
| `createChatAction` | `src/features/ai/actions.ts` | Creates a `Chat` (optionally scoped to a project), redirects into it |
| `sendChatMessageAction` | `src/features/ai/actions.ts` | Persists the user message, calls Gemini with project context + history, persists the reply |

## Queue jobs

| Queue | Job | Handler |
| --- | --- | --- |
| `scans` | `run-scan` | `src/server/queue/scan-worker.ts` → `runScanJob` in `src/server/services/scan-runner.ts` |
