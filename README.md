# Cardly — Digital Visiting Card Platform

Create and share beautiful digital business cards with QR codes, discover cards by
search/trending/recommendations, save a personal library, and manage everything from
an admin panel. Built with a React/Vite frontend and an Express/MongoDB backend.

> University final-year project by **Suzan Ghimire** · MIT licensed

## Features

- **Cards:** rich profile fields (name, job, company, contact, skills, services,
  socials), custom design, template-driven layouts, share links (`/c/<shortLink>`) and
  QR codes.
- **Privacy:** public/private cards with approval-based access requests (incl.
  QR-scan requests), contact-data masking for anonymous viewers.
- **Discovery:** search (`$text` + custom TF-IDF/BM25/fuzzy + hybrid), discover /
  popular / recent / trending feeds, content-based recommendations, category &
  industry filters.
- **Library:** save loved cards, per-card stats.
- **Admin:** users, cards, templates (+ builder), categories, policies, CRM inbox,
  audit log, analytics, broadcasts & notification templates.
- **Notifications:** in-app + optional web push + email; broadcast scheduler.
- **Dev ergonomics:** OTP email flows echo `devOtp` in dev; dark/light theme.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 18 · Vite · Redux Toolkit · Tailwind CSS · react-router v6 |
| Backend | Node.js (`>=16`) · Express 4 (CommonJS) · Mongoose 7 (MongoDB) · JWT |
| Extras | qrcode · nodemailer (SMTP) · web-push · multer/sharp · Cloudinary (optional) · winston |
| Tests | Jest + supertest + mongodb-memory-server (backend) · Vitest + Testing Library (frontend) |
| Deploy | Docker Compose (+ Caddy TLS) · Terraform/AWS · GitHub Actions (build/test) |

## Quick start

Prereq: Node.js 18+, MongoDB (local `mongod` or `docker compose up mongodb -d`).

```bash
npm run install-all                 # install root + backend + frontend deps
cp backend/.env.example backend/.env  # dotenv loads backend/.env (values optional for dev)
npm run dev                         # backend :5050 + frontend :5173 (Vite proxies /api → :5050)
```

Open `http://localhost:5173`. A default admin (`suzan.privatespace@gmail.com` / `admin123`,
**dev-only**) is seeded at boot. Full setup, env reference, Docker and AWS deployment,
runbooks, troubleshooting and the complete security notes live in the docs.

## Documentation

The authoritative context library lives **outside this repository** at
`~/Documents/Cardly-archive/docs/` (kept out of GitHub by request):

| Doc | Covers |
|---|---|
| `docs/architecture/ARCHITECTURE.md` | system design, layers, request lifecycle, config presets |
| `docs/architecture/WORKFLOWS.md` | auth, card privacy/access, discovery, admin, analytics flows |
| `docs/api/API.md` | every endpoint (auth levels, params, response shapes) |
| `docs/database/DATABASE.md` | 18 models, indexes, TTLs, data-integrity notes |
| `docs/algorithms/ALGORITHMS.md` | search/ranking/recommendation/QR/analytics math |
| `docs/development/` | conventions, commands, developer gotchas |
| `docs/troubleshooting/GOTCHAS.md` | operator failure-mode guide |
| `docs/deployment/DEPLOYMENT.md` | Docker, Terraform/AWS, CI/CD |
| `docs/security/SECURITY.md` | threat model, hardening, incident runbook |

The same archive also holds the deployment assets (Dockerfiles, `docker/`, `terraform/`,
CI workflow `deploy.yml`) and the Postman collection.

## Development

```bash
# Backend (from visiting-card-app/)
cd backend && npm test           # unit + integration (mongodb-memory-server)
cd backend && npm run test:ci    # with coverage thresholds

# Frontend
cd frontend && npm test          # Vitest
cd frontend && npm run lint      # ESLint (backend has no lint step)
cd frontend && npm run build     # production bundle
```

See `~/Documents/Cardly-archive/docs/development/COMMANDS.md` for the full set of verified commands.

## Repository layout

```
backend/    Express API (src/{routes,controllers,services,models,middleware,algorithms,utils,seeds})
frontend/   React SPA (src/{pages,components,features,redux,services,utils,context})
```

Deployment assets, CI workflow and all documentation were intentionally moved to
`~/Documents/Cardly-archive/` and are not tracked in this repository (see `.gitignore`).

## Security

JWT auth with rotating refresh tokens, bcrypt hashing (12 rounds), sha256 OTPs, rate
limiting, Helmet/CORS, input sanitization, privacy masking, admin RBAC groundwork, and
prod config that refuses to boot with weak secrets. **See
`~/Documents/Cardly-archive/docs/security/SECURITY.md`** for the threat model. Secrets live
only in gitignored `backend/.env` — never commit them.

## License

MIT — see the project author for the full text.