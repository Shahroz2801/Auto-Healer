# HealSite AI

**Your AI Website Doctor** — scan, analyze, repair, preview, monitor, and optimize websites and codebases with AI.

This repo is being built in phases (see [Project Status](#project-status) below). Each phase ships real, working code — no placeholder pages.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · Prisma 7 + TiDB (MySQL wire protocol) · Redis + BullMQ · Clerk · Stripe · React Query · Zod · React Hook Form · Gemini API

## Quick start

```bash
npm install
cp .env.example .env   # fill in real values, see docs/INSTALLATION.md
npm run db:migrate      # applies Prisma migrations
npm run dev
npm run worker:dev      # in a second terminal — processes scans
```

Visit `http://localhost:3000`.

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design, domain model, request flow
- [docs/INSTALLATION.md](docs/INSTALLATION.md) — full local setup, required accounts/keys
- [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) — where things live and why
- [docs/API.md](docs/API.md) — internal API route reference (grows with each phase)
- [prisma/schema.prisma](prisma/schema.prisma) — the full data model

## Project status

Built in order, per phase:

- [x] **Phase 1 — Architecture**: Next.js/TypeScript/Tailwind scaffold, shadcn/ui, folder structure, Prisma schema, env config, docs
- [x] **Phase 2 — Authentication**: Clerk sign-in/up, protected routes, org/user sync
- [x] **Phase 3 — Landing page**: marketing site (hero, features, pricing, FAQ)
- [x] **Phase 4 — Dashboard**: sidebar/topbar shell, projects (create/list/detail/delete), settings, billing, notifications
- [x] **Phase 5 — Scanning engine**: crawler, SEO/performance/security/accessibility/best-practices analyzers, BullMQ worker, live-polling scan UI
- [x] **Phase 6 — AI integration**: Gemini-powered issue explanations, AI-generated fix snippets, project-aware chat assistant
- [ ] **Phase 7 — Plugins & integrations**: WordPress/Shopify/VS Code/Chrome, GitHub/GitLab/Bitbucket
- [ ] **Phase 8 — Deployments**: Vercel/Netlify/Cloudflare/AWS/Docker/FTP/SSH targets

Billing/checkout (Stripe) is intentionally out of scope for now — the Billing page shows real plan/credit data but has no live checkout flow.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create/apply a Prisma migration (dev) |
| `npm run db:deploy` | Apply migrations (CI/production) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed a demo organization |
| `npm run worker:dev` | Run the scan worker (needed for "Run scan" to actually process — run alongside `npm run dev`) |
| `npm run redis:start` / `redis:stop` | Start/stop the local Windows Redis (see docs/INSTALLATION.md) |
