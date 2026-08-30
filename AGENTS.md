# AGENTS.md — Cardly (visiting-card-app)

Instructions for AI coding agents working in this repository. **Read the context library
at `~/Documents/Cardly-archive/docs/` before non-trivial work** (moved out of the repo —
**not tracked in GitHub**; it replaces the old `aidlc/`):

- `~/Documents/Cardly-archive/docs/architecture/ARCHITECTURE.md` — system design, layers, request lifecycle, config
- `~/Documents/Cardly-archive/docs/architecture/WORKFLOWS.md` — auth, card privacy/access, discovery, admin, analytics flows
- `~/Documents/Cardly-archive/docs/api/API.md` — every API endpoint (mounts, auth, params)
- `~/Documents/Cardly-archive/docs/database/DATABASE.md` — all 18 Mongoose models, indexes, TTLs
- `~/Documents/Cardly-archive/docs/algorithms/ALGORITHMS.md` — search/trending/recommendation/QR/analytics algorithms
- `~/Documents/Cardly-archive/docs/development/CONVENTIONS.md` + `COMMANDS.md` — style, testing, CLI recipes
- `~/Documents/Cardly-archive/docs/development/GOTCHAS.md` + `docs/troubleshooting/GOTCHAS.md` — developer & operator traps
- `~/Documents/Cardly-archive/docs/deployment/DEPLOYMENT.md` + `docs/security/SECURITY.md` — Docker/Terraform/CI, threats

## Non-negotiable rules

1. **Edit only this directory.** A stale duplicate exists at
   `/Users/mac/Cardly/visiting-card-app copy/` — never touch it.
2. **Run all git commands from inside `visiting-card-app/`.** The parent
   `/Users/mac/Cardly` belongs to a stray home-directory git repo (`/Users/mac/.git`,
   zero commits). Never commit from there.
3. **The worktree is usually dirty** (dozens of uncommitted changes and intentional
   deletions from the 2026 cleanup). Check `git status` before assuming HEAD matches
   disk; stage only files you intended to change.
4. **Never print, copy, or commit secret values.** Secrets live in `backend/.env`
   (gitignored) only. The old tracked `backend/config.env` (real-looking secrets) was
   **deleted** in the cleanup but still exists in git history — never resurrect it.
5. Never loosen test coverage thresholds or skip tests to make CI pass.

## Project snapshot

Cardly — digital business card platform (university project by Suzan Ghimire).
React 18 + Vite + Redux Toolkit + Tailwind frontend; Express 4 (CommonJS) + Mongoose/MongoDB
backend; Jest/supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend);
Docker Compose + Terraform/AWS deployment; CI builds/tests only (no deploy job).

## Key features

- **Template system:** DB-driven (`Template` model), admin CRUD + featured, user selection
  via `/api/templates`; cards store a `templateId` string reference + `usageCount`.
- **Card privacy model (regression-prone):** public/private (`isPrivate` + `privacy`
  enum), QR/access requests via `CardAccessRequest` (7-day expiry), response masking for
  anonymous viewers. See `docs/architecture/WORKFLOWS.md` §3 and `docs/development/GOTCHAS.md` §5
   (both under `~/Documents/Cardly-archive/`).
- **Search:** three modes — `basic` (regex), `fullText` (`card_text_search` text index),
  `advanced` (custom TF-IDF/BM25/fuzzy in `backend/src/algorithms/`); hybrid default.
  Trending = weighted engagement + recency. See `~/Documents/Cardly-archive/docs/algorithms/ALGORITHMS.md`.
- **Notifications/broadcasts/CRM/audit:** Notification + NotificationTemplate + Broadcast
  (scheduler + delivery stats), ContactMessage CRM, AuditLog (90-day TTL).
- **Analytics:** event tracking with dedup (views 5 min, others 1 min), aggregation
  statics on the Analytics model.

## Common repo state (post-cleanup)

- Backend: 15 route files, 15 controllers, 17 services, 18 models, 6 middleware,
  6 algorithms, 11 utils, seeds `adminSeed` + `templateSeed` (default dotenv → `backend/.env`).
- Frontend: no dead design system; `components/Search/` and `hooks/` are empty;
  homepage renders `LandingPage` standalone (own nav/footer), everything else under `Layout`.
- Both dev servers run from `visiting-card-app/` via `npm run dev` (backend :5050,
  frontend :5173). Backend restart clears in-memory rate limits (no reset script).

## Commands

| Task | Command (from repo root unless noted) |
|---|---|
| Install | `npm run install-all` |
| Dev servers | `npm run dev` → backend :5050 + frontend :5173 |
| Backend tests | `cd backend && npm test` (coverage: `npm run test:ci`) |
| Frontend tests / lint | `cd frontend && npm test` / `npm run lint` (backend has **no lint**) |
| Seed admin/templates | `npm run seed:admin` / `npm run seed:templates` (templates auto-run at boot) |

Full CLI recipes: `~/Documents/Cardly-archive/docs/development/COMMANDS.md`.