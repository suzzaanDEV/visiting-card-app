# 02 — Architecture

## Backend: layered Express app

```
routes/  →  controllers/  →  services/  →  models/
```

- **Entry:** `backend/src/app.js` (Express app + `startServer()`, port **5050**).
- **Config:** `backend/config/enterprise.config.js` — env-based presets
  (dev/test/staging/production); production throws if `JWT_SECRET` or `DATABASE_URL` missing.
- **Routes:** 8 route modules in `backend/src/routes/` (auth, cards, savedCard, search,
  admin, analytics, notification, template).
- **Controllers:** 8 files, all use the `exports.register = async (req,res,next)=>{}`
  named-export style.
- **Services:** 12 modules with the business logic.
- **Middleware** (`backend/src/middleware/`):
  - `authMiddleware` — JWT Bearer + DB active-user check; sets `req.user`/`req.userInfo`.
    ⚠️ It logs Authorization header contents/token prefixes — verbose auth logging exists.
  - `adminMiddleware` — separate Admin model/JWT for `/api/admin`.
  - `privacyMiddleware` — `filterSensitiveData` + privacy headers on public card payloads.
  - `errorMiddleware` — maps Mongoose ValidationError/CastError/dup-key(11000);
    global handler strips stacks in production (`app.js:244-264`).
- **Rate limiting:** global 100–1000 req/15min per env tier; **auth limiter 5 req/15min/IP**;
  dedicated OTP limiter. Will bite during local testing — see gotchas.
- **Algorithms** (`backend/src/algorithms/`) — custom, heavily tested:
  TF-IDF/BM25 search (`advancedSearchAlgorithms.js`, 632 lines), fullTextSearch,
  qrCodeGenerator + qrPipeline, recommendationEngine, shortLinkGenerator (base62),
  trendingRanking.
- **Seeds:** `src/seeds/adminSeed.js` auto-runs on server start unless
  `SEED_ADMIN_ON_START=false`.
- **Logging:** Winston structured JSON to `backend/src/logs/{app,error,access}.log`
  (+console in dev) via `utils/logger.js`; ~19 raw `console.*` calls still remain.

## Frontend: React SPA

- **Entry chain:** `main.jsx` (Provider > BrowserRouter > ThemeProvider > App + Toaster)
  → `App.jsx` holds ALL route definitions; routes are lazy-loaded chunks.
- **State:** Redux Toolkit slices in `src/features/` (auth, cards, library, admin);
  thunks via `createAsyncThunk('slice/action', …)` handled in `extraReducers`
  (pattern: `features/auth/authSlice.js:47-100`). Store config: `src/redux/store.js` (4 reducers).
- **HTTP:** `services/apiService.js` wraps native `fetch` (`apiCall` + `API_ENDPOINTS`
  map); `services/authService.js` handles refresh-token rotation;
  `services/analyticsService.js` posts client tracking to `/api/analytics/track`.
  Many thunks also call raw `fetch` directly — both patterns coexist.
- **Auth persistence:** localStorage via `utils/authStorage.js` (keys `token`,
  `refreshToken`, `user`). `components/Auth/AuthInitializer.jsx` hydrates from storage
  then validates via `/auth/check-status`; `ProtectedRoute.jsx` keeps polling
  check-status and redirects banned users to `/blocked`. Admins use a separate
  `adminToken` key + `components/Admin/AdminRoute.jsx` guard.
- **Theme:** `context/ThemeContext.jsx` light/dark persisted as `cardly-theme`;
  CSS custom properties from `design/tokens.js` mapped into Tailwind as `brand-*`
  colors (`tailwind.config.js:10-26`). Design tokens live in `src/design/`
  (theme, spacing, typography, shadows, animations).
- **UI kit:** `src/components/ui/` — Button, Input, Card, Modal, Table, Dropdown, Skeleton.
- **Dev proxy:** Vite proxies `/api` → `localhost:5050` (`frontend/vite.config.js:33-40`);
  dev ports: frontend 5173, backend 5050.

## Frontend routing map (from App.jsx)

- Public: `/`, about, contact, auth pages, `view/:cardId`, `c/:shortLink`, discover
  (+ popular/recent)
- Protected: dashboard, cards CRUD, search, library, access-requests, notifications, profile
- Admin-gated (`authenticateAdmin` JWT): `/admin/*` — dashboard, templates + builder,
  cards, access-requests, analytics, users, settings

## Repo layout (real project root)

| Path | Purpose |
|---|---|
| `package.json` | Root orchestrator scripts (concurrently runs both apps) |
| `backend/src/app.js` | Backend entry |
| `frontend/src/main.jsx` | Frontend entry |
| `docker/`, `Dockerfile.{backend,frontend}`, `docker-compose*.yml` | Containers; prod compose adds Caddy (:80/:443) |
| `terraform/` | AWS EC2 Ubuntu 24.04 + EIP; user-data installs Docker, clones repo, generates JWT_SECRET, boots prod compose |
| `.github/workflows/deploy.yml` | CI only (test/build/docker build) — no deploy job |
| `backend/ecosystem.config.js` | PM2 cluster alternative |
| ~17 root `.md` docs | README, DEPLOYMENT*, ADMIN_SETUP, ALGORITHMS, DESIGN_SYSTEM, THEME_GUIDE, BRAND_GUIDELINE, audits, university docs |

Not a monorepo/workspace — three independent npm packages glued by root scripts.
