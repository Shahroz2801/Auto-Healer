# Architecture

## System overview

```
                         ┌─────────────────────────┐
                         │        Browser           │
                         │  (Next.js App Router UI) │
                         └────────────┬─────────────┘
                                      │ HTTPS
                         ┌────────────▼─────────────┐
                         │      Next.js server       │
                         │  - Route Handlers (API)   │
                         │  - Server Components       │
                         │  - Clerk middleware        │
                         └───┬───────────┬───────────┘
                             │           │
              ┌──────────────▼──┐   ┌───▼─────────────────┐
              │  TiDB (MySQL)    │   │   Redis + BullMQ     │
              │  (Prisma ORM)    │   │  (job queue)         │
              └──────────────────┘   └───┬──────────────────┘
                                          │
                          ┌───────────────▼────────────────┐
                          │        Worker processes          │
                          │  - Crawler / scanners (built)      │
                          │  - Monitors (future)                │
                          │  - Report generation (future)       │
                          └───────────────┬────────────────┘
                                          │
                     ┌────────────────────▼───────────────────┐
                     │   External integrations                  │
                     │  GitHub/GitLab/Bitbucket · WordPress ·    │
                     │  Shopify · Stripe · Slack/Discord/Telegram│
                     │  · Vercel/Netlify/AWS/Docker/FTP/SSH      │
                     └────────────────────────────────────────┘
```

## Why these choices

- **Next.js App Router, Server Components by default.** Dashboard pages fetch
  data directly on the server (via Prisma) and only ship client bundles for
  interactive islands (charts, the Monaco editor, the AI chat panel).
- **Jobs run outside the request/response cycle.** Crawling a site, running
  Lighthouse, and calling the AI provider are all slow and can fail
  independently — they're BullMQ jobs, not `await`ed inside a Next.js route
  handler. Route handlers enqueue work and return immediately; the UI polls or
  subscribes for status.
- **Fixes never touch production.** `Fix` rows store a diff, not an applied
  mutation. Applying a fix means building an isolated preview (sandboxed
  branch/build), never writing to the user's live source directly. See the
  `Fix`/`Issue` models in `prisma/schema.prisma`.
- **Multi-tenant from day one.** `Organization` is the billing and
  collaboration boundary; `User` is an identity that can belong to many orgs.
  This avoids a costly single-tenant → multi-tenant migration later.
- **Database is TiDB (MySQL wire protocol), accessed via `@prisma/adapter-mariadb`.**
  A few fields that would be native scalar-list columns on Postgres
  (`Scan.categories`, `Monitor.categories`, `Fix.filesChanged`,
  `ApiKey.scopes`) are `Json` instead, since MySQL/TiDB has no scalar list
  type — read/write them as arrays through Prisma's `Json` type in
  application code. Long text fields (diffs, descriptions, chat content) are
  explicitly `@db.Text` since MySQL's default `String` maps to a
  length-limited `VARCHAR(191)`.
- **AI provider behind an interface, not hardcoded to Gemini.** `src/lib/ai`
  defines a provider-agnostic interface; Gemini is the first implementation.
  Swapping in OpenAI/Claude/Grok/DeepSeek/local models later is an adapter,
  not a rewrite.
- **AI calls run inline in Server Actions, not queued.** A single-page scan
  is slow enough (crawl + N analyzers + N link checks) to need a background
  worker; a single Gemini call for an issue explanation or a chat reply is a
  few seconds, well within a Server Action's request lifetime. Move to a
  queue if/when batch operations (e.g. "explain all issues") get added.

## Domain model (high level)

- **Identity/tenancy** — `User`, `Organization`, `OrganizationMember`
- **Projects** — `Project`, `ProjectFile`, `Repository`, `Website` (the 15
  import methods all resolve into a `Project` + one of `Repository`/`Website`)
- **Scanning** — `Scan`, `Issue`, `Fix`
- **AI** — `Chat`, `ChatMessage`
- **Reporting** — `Report`
- **Ops** — `Deployment`, `Monitor`, `MonitorIncident`, `Notification`
- **Billing** — `Subscription`, `Invoice`, `CreditTransaction`
- **Platform** — `Integration`, `Plugin`, `PluginInstall`, `ApiKey`,
  `OrganizationFeatureFlag`, `AuditLog`, `SupportTicket`

Full field-level detail lives in `prisma/schema.prisma` — it's the source of
truth; this doc explains intent, not schema.

## Request/data flow for a scan

1. User submits a project (URL, ZIP, repo, etc.) via the `createProjectAction`
   Server Action (`src/features/projects/actions.ts`), which creates a
   `Project` row. Code imports (ZIP/repo/etc.) populating `ProjectFile` rows
   from object storage is Phase 7 scope — v1 scanning works directly against
   `Project.sourceUrl`.
2. User clicks "Run scan" → `runScanAction` (`src/features/scans/actions.ts`)
   creates a `Scan` row (`status: QUEUED`) and enqueues a BullMQ job via
   `enqueueScan` (`src/server/queue/scan-queue.ts`).
3. The scan worker (`src/server/queue/scan-worker.ts` — a separate process,
   `npm run worker:dev`) picks up the job and runs `runScanJob`
   (`src/server/services/scan-runner.ts`), which walks `Scan.status` through
   `CRAWLING → ANALYZING → COMPLETED` (or `FAILED`), fetches the page once
   (`src/lib/scanners/fetch-page.ts`, cheerio — no JS execution, see that
   file's doc comment), runs the analyzer suite
   (`src/lib/scanners/index.ts`: SEO, performance, security, accessibility,
   best-practices, broken-links), persists `Issue` rows, rolls per-category
   scores onto the `Scan` and an overall `healthScore` onto the `Project`,
   and creates a `SCAN_COMPLETE` `Notification`.
4. For each `Issue`, `explainIssueAction`/`generateFixAction`
   (`src/features/ai/actions.ts` → `src/server/services/ai-heal.ts`) call
   Gemini on request — not eagerly for every issue, to control cost. Because
   v1 scanning only has the rendered page (no source repo — see the scan
   flow above), a "Fix" here is a copy-pasteable snippet + explanation
   (`Fix.diff`/`Fix.explanation`), not a patch applied against known files.
   Real repo-aware diffs are Phase 7 scope, once source import lands.
5. The AI chat assistant (`src/features/ai/chat-panel.tsx` →
   `sendChatMessageAction` → `src/server/services/ai-chat.ts`) is
   project-aware: it injects the project's name/framework/health score and
   its highest-severity open issues into the system prompt, so answers are
   specific rather than generic.
6. The project detail / scan detail pages poll for updates with a plain
   `setInterval` + `router.refresh()` while the scan is non-terminal
   (`src/features/scans/scan-status-poller.tsx`) — simple because Server
   Components make a full page refetch cheap; swap for SSE/websockets later
   if that stops being true at scale.

**v1 scope note:** scanning analyzes the single URL on `Project.sourceUrl`,
not a full multi-page crawl — see the doc comment on `analyzeBrokenLinks` in
`src/lib/scanners/best-practices.ts`. Multi-page crawling (discovering and
queueing every page on a site) is future scope, not a current limitation to
work around.

## Security posture

- Secrets (integration credentials) are AES-256-GCM encrypted at rest
  (`Integration.encryptedCredentials`), keyed by `ENCRYPTION_KEY`.
- All mutating actions that matter for compliance write an `AuditLog` row.
- API keys are stored hashed (`ApiKey.hashedKey`), never in plaintext.
- Role checks: `GlobalRole` (platform-level, e.g. admin panel) is separate
  from `OrgRole` (per-workspace permissions) — see `prisma/schema.prisma`.
