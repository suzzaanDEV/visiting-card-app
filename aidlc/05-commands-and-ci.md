# 05 — Commands, Env, CI/CD & Deployment

All commands assume you are inside `/Users/mac/Cardly/visiting-card-app`.

## Install / Run

| Task | Command |
|---|---|
| Install everything | `npm run install-all` |
| Run both apps (dev) | `npm run dev` (= `server` + `client` via concurrently) |
| Backend only | `npm run server` or `cd backend && npm run dev` (nodemon) |
| Frontend only | `npm run client` or `cd frontend && npm run dev` |
| Docker dev stack | `npm run docker:up` / `npm run docker:down` |

⚠️ There is **no rate-limit reset**: the broken `dev:reset` script (referenced a
non-existent file) was removed. Restarting the backend clears limits instead.

Vite proxies `/api` → `localhost:5050`.

## Test / Lint

| Task | Command |
|---|---|
| All tests (CI order) | `npm test` = backend `test:ci` then frontend `test` |
| Backend only / frontend only | `npm run test:backend` / `npm run test:frontend` |
| Backend unit / integration | `cd backend && npm run test:unit` / `test:integration` |
| Backend coverage | `cd backend && npm run test:coverage` (thresholds: 25% branches, 35% lines) |
| Frontend watch / coverage | `cd frontend && npm run test:watch` / `test:coverage` |
| Lint (frontend only!) | `cd frontend && npm run lint` — **no backend lint exists** |
| Build frontend | `npm run build` (vite build → dist/) |
| Seed default admin | `npm run seed:admin` (also auto-runs at boot unless `SEED_ADMIN_ON_START=false`) |

Backend Jest pattern: `test/**/*.test.js`; `test/setup.js` loads `test/env.js`.
Frontend: jsdom + jest-dom via `src/test/setup.js`, vitest config inside `vite.config.js`.

Coverage is thin by design (backend collects only from `algorithms/**`, `tokenUtils`,
`sanitize`, `seeds/**`, `authService`). Don't be alarmed by low numbers; don't loosen
thresholds to make CI pass.

## Environment variables

Backend (`.env.example`): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`CLOUDINARY_CLOUD_NAME/_API_KEY/_API_SECRET`, `PORT=5050`, `NODE_ENV`,
`ALLOWED_ORIGINS` (comma list), `FRONTEND_URL`, optional `REDIS_ENABLED/REDIS_URL`,
`EMAIL_ENABLED`, `SMTP_HOST/PORT/SECURE/USER/PASS/FROM`, `MONITORING_ENABLED`,
`METRICS_ENABLED/PORT`, `STORAGE_TYPE`, `SEED_ADMIN_ON_START`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

⚠️ **Dead config files:** dotenv reads ONLY `backend/.env`; Vite reads ONLY
`frontend/.env`. `backend/config.env` and `frontend/env.config` exist on disk but are
NOT loaded — don't add config to them. `.env.example` files are the documentation.

Frontend (`.env.example`): `VITE_API_URL`, `VITE_APP_NAME`, `VITE_APP_VERSION`,
`VITE_CLOUDINARY_*`.

Port quirk: `.env.example` defaults `FRONTEND_URL=http://localhost:5175` while the app
default is 5173.

## CI (`.github/workflows/deploy.yml`)

Triggers: push to main/master/develop + PRs to main/master. Jobs:
1. `backend-test` — Node 20, `npm ci`, `test:ci`, upload coverage.
2. `frontend-build` — build with `VITE_API_URL=http://localhost:5050/api`, upload dist.
3. `docker-build` — main/master only; builds both images (no registry push).

**Frontend tests are NOT wired into CI** — run them manually (`npm run test:frontend`).

No deploy job exists.

## Deployment targets

- Docker Compose prod: `docker-compose.prod.yml` (mongo, redis, backend, frontend,
  **Caddy** auto-HTTPS on :80/:443). Dev compose frontend sits behind `docker/nginx.conf`
  (SPA fallback + `/api` proxy).
- Terraform AWS: `terraform/main.tf` provisions VPC/subnets/SG/EC2 Ubuntu 24.04/EIP;
  user-data installs Docker, clones repo, generates JWT_SECRET via openssl, writes
  server `.env`, runs prod compose up.
- PM2 alternative: `backend/ecosystem.config.js` (cluster mode).
- Docs also mention Vercel/Netlify/Heroku for the frontend (see DEPLOYMENT.md).
