# AGENTS.md — Cardly (visiting-card-app)

Instructions for AI coding agents working in this repository. Deep context lives in
[`aidlc/`](aidlc/) — read it before non-trivial work:

- `aidlc/01-project-overview.md` — what this is, stack, surprising facts
- `aidlc/02-architecture.md` — backend layers, frontend structure, auth flow
- `aidlc/03-api-and-data-models.md` — every API route, every Mongoose model
- `aidlc/04-conventions.md` — code style, module split, testing patterns
- `aidlc/05-commands-and-ci.md` — commands, env vars, CI/CD, deployment
- `aidlc/06-gotchas.md` — traps and security-sensitive areas

## Non-negotiable rules

1. **Edit only this directory.** A stale duplicate exists at
   `/Users/mac/Cardly/visiting-card-app copy/` — never touch it.
2. **Run all git commands from inside `visiting-card-app/`.** The parent
   `/Users/mac/Cardly` belongs to a stray home-directory git repo (`/Users/mac/.git`,
   zero commits). Never commit from there.
3. **The worktree is usually dirty** (~86 uncommitted changes). Check `git status`
   before assuming HEAD matches disk; stage only files you intended to change.
4. **Never print, copy, or commit secret values.** `backend/config.env` is committed
   upstream with real-looking secrets (DATABASE_URL, JWT_SECRET, Cloudinary keys) — do
   not read them aloud or propagate them.
5. Never loosen test coverage thresholds or skip tests to make CI pass.

## Project snapshot

Cardly — digital business card platform (university final-year project by Suzan Ghimire).
React 18 + Vite + Redux Toolkit + Tailwind frontend; Express 4 (CommonJS) + Mongoose/MongoDB
backend; Jest/supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend);
Docker Compose + Terraform/AWS deployment; CI builds/tests only (no deploy job).

## Key features

- **Template system:** Database-driven (Template model), admin CRUD + featured marking, user
  selection via `/api/templates`. Templates have category, tags, preview config, and usage count.
- **Card fields:** Cards support `category`, `industry`, `profession`, `skills`, `services`,
  `products` (in addition to standard name/company/contact fields). Discovery page filters
  by category, industry, and location.
- **Search algorithm:** Backend offers three modes — `basic` (regex), `fullText` (MongoDB text
  index), and `advanced` (custom TF-IDF/BM25 in `backend/src/algorithms/`). Hybrid search
  combines results. Trending uses compound sort (views + loves + recency).
- **Notification system:** In-app notifications via Notification model, optional push (web push)
  and email channels. Notification types include access requests, card loves, system alerts.
- **Broadcast system:** Admin-driven broadcasts (`Broadcast` model) with audience targeting
  (all/active/inactive/new/verified/segment/specific users), multi-channel delivery
  (in-app/push/email), scheduling, and delivery stats tracking.
- **CRM:** Contact messages (`ContactMessage` model) with status management
  (unread/read/replied/archived/spam), bulk operations, category/priority breakdown,
  stats dashboard. Routes at `/api/crm`.
- **Audit logging:** `AuditLog` model with action/entity tracking, severity levels,
  90-day TTL index. Service at `backend/src/services/auditService.js`, routes at
  `/api/audit`. Used by admin and policy services.

## Commands

| Task | Command (from repo root unless noted) |
|---|---|
| Install | `npm run install-all` |
| Dev servers | `npm run dev` → backend :5050 + frontend :5173 |
| All tests | `npm test` |
| Backend tests / coverage | `cd backend && npm test` / `npm run test:coverage` |
| Frontend tests / lint | `cd frontend && npm test` / `npm run lint` (no backend lint exists) |
| Seed admin | `npm run seed:admin` (auto-runs at boot unless `SEED_ADMIN_ON_START=false`) |

## Conventions in brief

- Backend: CommonJS, controllers use `exports.fnName = async (req,res,next)=>{}`,
  layered routes→controllers→services→models.
- Frontend: ESM/JSX, Redux Toolkit thunks via `createAsyncThunk` handled in
  `extraReducers`, HTTP via native `fetch` (`services/apiService.js`; axios is unused).
- Style: 2-space indent, single quotes, semicolons; ESLint flat config frontend-only;
  no Prettier, no TypeScript, no typecheck step.
- Tests: backend central dirs `backend/test/{unit,integration}` (integration uses
  mongodb-memory-server + supertest against `{ app }` from `src/app.js`, OTP surfaced as
  `devOtp`); frontend colocated `*.test.js` next to utils.

## Top gotchas (full list: aidlc/06-gotchas.md)

- Auth rate limit is **5 req/15min/IP** — restart the backend when testing manually
  (the old `dev:reset` script was removed; it referenced a non-existent file).
- `frontend/src/pages/Cards/NewCard.jsx` is a 2,599-line monolith — edit surgically.
- Duplicate components exist (AnalyticsDashboard variants, LibraryPage variants,
  CardPreview variants) — confirm which one a route renders before editing.
- Redis is configured but unused; email disabled by default (`EMAIL_ENABLED=false`);
  default admin is seeded as admin@gmail.com/admin123 (documented, dev-only).
- Privacy model (public/private/shared cards, QR temporary access) is regression-prone —
  verify card visibility flows after touching privacy/auth code.
