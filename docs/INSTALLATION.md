# Installation

## Prerequisites

- Node.js 20+
- A MySQL-wire-compatible database — this project runs on [TiDB Cloud](https://tidbcloud.com) (Serverless tier works fine); plain MySQL 8+/PlanetScale also work since the app only uses standard SQL + Prisma's MySQL connector
- Redis 7+ (local, Docker, or hosted — Upstash works well for serverless)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`. Where to get each value:

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Your TiDB Cloud (or other MySQL-compatible) connection string, format `mysql://user:pass@host:4000/dbname`. TiDB Cloud requires TLS — handled in `src/server/db/client.ts`, not via URL query params. |
| `REDIS_URL` | Your Redis connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | [Clerk dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks → your endpoint's signing secret |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [Stripe dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks → your endpoint |
| `STRIPE_PRICE_*` | Stripe dashboard → Products → each plan's Price ID |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `STORAGE_*` | Your S3-compatible bucket (Cloudflare R2, AWS S3, etc.) |
| `GITHUB_APP_ID` / `GITHUB_APP_PRIVATE_KEY` | A GitHub App you register for repo import |
| `ENCRYPTION_KEY` | Any random 32+ char string: `openssl rand -base64 32` |

Only `DATABASE_URL`, `REDIS_URL`, Clerk, and `GEMINI_API_KEY` are required to
run the app locally; everything else degrades gracefully (that integration is
simply unavailable) if left blank.

## 3. Set up the database

```bash
npm run db:migrate   # creates the schema
npm run db:seed       # optional: seeds a demo workspace
```

## 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Redis

The database is TiDB Cloud (hosted); only Redis needs to run locally, for the
BullMQ job queue (scans, monitors, report generation — Phase 5+).

**Docker / Linux / macOS:**

```bash
docker run -d --name healsite-redis -p 6379:6379 redis:7
```

**Windows:** Redis dropped official Windows support years ago, and this repo
has no Docker/WSL dependency, so local dev uses the community-maintained
[tporadowski/redis](https://github.com/tporadowski/redis) Windows port — a
self-contained set of `.exe`s, no installer, MIT-licensed:

1. Download the latest `Redis-x64-*.zip` from that repo's releases and
   extract it to `.redis-local/` at the repo root (gitignored).
2. `npm run redis:start` / `npm run redis:stop`.

That release is pinned to Redis 5.0.14 (the last version before Microsoft's
port went unmaintained). BullMQ works fine on it for standard queue
operations but logs a "recommended minimum 6.2.0" warning — harmless for
local dev. For anything resembling production, use real Redis 7+ (Docker) or
a hosted option like [Upstash](https://upstash.com).

## Troubleshooting

- **Prisma CLI can't find `DATABASE_URL`** — Prisma 7 reads the CLI's
  connection URL from `prisma.config.ts`, not `schema.prisma`. Make sure
  `.env` exists at the repo root (it's loaded via `dotenv/config` in
  `prisma.config.ts`).
- **Clerk pages 404 or redirect loop** — double-check
  `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` match the
  routes under `src/app/(auth)`.
