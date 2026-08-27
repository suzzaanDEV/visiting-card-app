# 06 — Gotchas & Security-Sensitive Areas

## Repo-level traps

1. **Two sibling copies:** `/Users/mac/Cardly/visiting-card-app` (real) vs
   `/Users/mac/Cardly/visiting-card-app copy` (stale snapshot, 68 dirty files, missing
   newer dirs). Edit ONLY the real one.
2. **Stray home-dir git repo:** `/Users/mac/.git` wraps everything (zero commits on
   `master`). `git rev-parse --show-toplevel` from `/Users/mac/Cardly` returns `/Users/mac`.
   Run git only from inside `visiting-card-app/`. Never commit from the outer folders.
3. **Dirty worktree:** inner repo typically has ~50 modified + ~36 untracked files
   (design system, terraform, docker files, tests, docs). Check `git status` first;
   don't assume HEAD matches disk.
4. Commit history is mixed-style ("Add X for Y", occasional `feat:` prefixes, some emoji).
   Match the plain imperative style.

## Highest-risk code

- `frontend/src/pages/Cards/NewCard.jsx` — **2,599-line monolith (~144 KB)**. Change
  surgically; full refactors are out of scope unless explicitly requested.
- Duplicate/legacy variants coexist and are BOTH imported in places:
  `AnalyticsDashboard.jsx` vs `AnalyticsDashboardNew.jsx`, `SimpleAdminDashboard.jsx`,
  two `CardViewer.jsx` (components/ and components/Cards/), two `LibraryPage.jsx`
  (pages/Library and components/Library), two `CardPreview.jsx`. Verify which one a
  route actually renders before editing.
- Mixed HTTP patterns: `apiService.js` wrapper exists but thunks often call raw `fetch`;
  `API_BASE_URL` may be relative (`/api`) in prod builds.

## Security-sensitive areas (patterns only — never reproduce values)

- ⚠️ `backend/config.env` **is committed** with filled-in values (DATABASE_URL,
  JWT_SECRET, CLOUDINARY keys). Real secrets are in git history. Never print them,
  never copy them into new files, never commit additional secrets.
- Default admin seeded: `admin@gmail.com / admin123` (documented in ADMIN_SETUP.md,
  `seeds/adminSeed.js`, compose defaults). Terraform user-data writes a hardcoded
  `ADMIN_PASSWORD` into server `.env`. Auto-seeds on boot unless
  `SEED_ADMIN_ON_START=false`.
- `authMiddleware.js:25-45` logs Authorization header contents/token prefixes; verbose
  auth logging throughout backend.
- Tokens stored in **localStorage** (`frontend/src/utils/authStorage.js`) — XSS-exposed
  pattern. Don't move to cookies casually; it's an architectural decision.
- Privacy model (public/private/shared cards + QR temporary grants) has had many
  visibility-bug fixes. Any change to card visibility, `privacyMiddleware`, or access
  requests requires manual verification of public/private card flows.

## Runtime quirks

- **README is outdated** — its endpoint list omits templates/notifications/analytics/admin
  routes, and the project-structure diagram omits `algorithms/`, `context/`, `hooks/`,
  `design/`. Trust `backend/src/routes/*` instead.
- `backend/config.env` and `frontend/env.config` are tracked in git but are NOT loaded by
  code (dotenv reads only `backend/.env`; Vite reads only `frontend/.env`). They contain
  real-looking secret values — never print, copy, or propagate them. `.env.example`
  files are the documentation.
- **Auth rate limit = 5 req/15min/IP** — bites hard during manual testing. Restart the
  backend to clear limits (the old `dev:reset` script was removed; it pointed at a
  non-existent file); frontend handles 429s via `rateLimitHandler.js`; integration
  tests raise limits via test env config.
- Logs are written INSIDE the source tree at `backend/src/logs/` (gitignored). Also
  `test-results/` on disk is gitignored.
- `frontend/dist/` exists locally (gitignored build output).
- Redis configured but unused in code; axios installed but unused — don't "fix" either
  without asking.
- Zero TODO/FIXME comments in source; tech debt is tracked instead in PROJECT_AUDIT.md,
  IMPROVEMENTS.md, UI_AUDIT.md — read those before planning cleanups.
- Test coverage is thin (~21 backend tests / ~36% on limited globs; ~6 frontend tests).
  TEST_REPORT.md may claim more than exists.
- University docs describe intended behavior; where they disagree with code, code wins.

## Verification checklist after changes

1. `cd backend && npm test` (or targeted jest paths)
2. `cd frontend && npm test && npm run lint`
3. If routes/auth touched: boot dev stack, register→verify(devOtp)→login, view a public
   card via short link, confirm private cards stay hidden.
4. If CI-relevant: ensure `npm run test:ci` thresholds hold (25% branches/35% lines on
   collected globs).
