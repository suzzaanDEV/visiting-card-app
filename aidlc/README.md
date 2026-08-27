# aidlc — AI Development Lifecycle Context

Persistent context for AI coding agents working on **Cardly** (`visiting-card-app`).
`AGENTS.md` at the repo root is the entry point; these files hold the detail.
Read them before non-trivial work.

## Contents (read in order)

| File | Purpose |
|---|---|
| [01-project-overview.md](./01-project-overview.md) | What Cardly is, tech stack, surprising facts |
| [02-architecture.md](./02-architecture.md) | Backend layers, frontend structure, routing map, repo layout |
| [03-api-and-data-models.md](./03-api-and-data-models.md) | Every API route, every Mongoose model, privacy model |
| [04-conventions.md](./04-conventions.md) | Module systems, naming, formatting, error handling, testing patterns |
| [05-commands-and-ci.md](./05-commands-and-ci.md) | Install/run/test/lint commands, env vars, CI/CD, deployment |
| [06-gotchas.md](./06-gotchas.md) | Repo traps, security-sensitive areas, verification checklist |

## Repo map (high level)

```
visiting-card-app/
├── backend/            Express 4 + Mongoose 7 API (CommonJS)
│   ├── config/         enterprise.config.js — env-aware presets
│   ├── src/
│   │   ├── app.js              entry: middleware, routers, graceful shutdown
│   │   ├── algorithms/         TF-IDF/BM25 search, QR pipeline, base62 short links,
│   │   │                       recommendations, trending
│   │   ├── controllers/        admin, analytics, auth, card, notification,
│   │   │                       savedCard, search, template
│   │   ├── middleware/         auth, admin, error, privacy, rate limiting
│   │   ├── models/             Admin, Analytics, CardAccessRequest, CardDesign,
│   │   │                       Card, Notification, SavedCard, Template, User
│   │   ├── routes/             8 route modules under /api
│   │   ├── services/           business logic (12 modules)
│   │   ├── seeds/adminSeed.js  default admin bootstrap
│   │   └── utils/              cloudinary, emailService, logger (winston),
│   │                           mongoose, multerConfig, sanitize, tokenUtils
│   └── test/           Jest: unit/, integration/, setup.js, env.js,
│                        integrationSetup.js (mongodb-memory-server)
├── frontend/           React 18 + Vite SPA (ESM)
│   └── src/
│       ├── main.jsx    entry: ErrorBoundary > Provider > BrowserRouter >
│       │               ThemeProvider > App + Toaster
│       ├── App.jsx     all routes (lazy pages, guards)
│       ├── components/ Admin/, Auth/, Cards/, Layout/, Library/,
│       │               Notifications/, Search/, ui/ (+ loose files)
│       ├── context/    ThemeContext.jsx (light/dark via class)
│       ├── design/     tokens.js, theme.js, spacing.js, typography.js,
│       │               shadows.js, animations.js (Framer Motion presets)
│       ├── features/   Redux Toolkit: auth/, cards/, library/, admin/
│       │               each with <domain>Slice.js + <domain>Thunks.js
│       ├── hooks/      useDebounce.js
│       ├── pages/      Auth/, Cards/, Dashboard/, Profile/, Library/,
│       │               Admin/, User/, HomePage, SearchPage, ViewCard…
│       ├── redux/      store.js
│       ├── services/   apiService.js, authService.js, analyticsService.js
│       ├── styles/     legacy palettes (see gotchas)
│       ├── test/       Vitest setup.js (jest-dom)
│       └── utils/      authStorage, validation, rateLimitHandler
├── docker/             nginx.conf (SPA fallback + /api proxy), Caddyfile
├── terraform/          AWS VPC/EC2 Ubuntu 24.04 infra
├── docker-compose.yml / docker-compose.prod.yml (Caddy TLS)
├── Dockerfile.backend / Dockerfile.frontend
└── .github/workflows/deploy.yml   CI only — no deploy job
```

## Keeping this folder accurate

When you learn something durable about this repo that isn't documented here, add it to
the relevant numbered file. When code changes make a doc stale, fix the doc in the same
change if practical.
