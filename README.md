# Cardly

A digital business card platform — create and share beautiful cards with QR codes,
discover cards by search, trending, and recommendations, save a personal library, and
manage everything from an admin panel.

React/Vite frontend + Express/MongoDB backend.

## Features

- Card creation with rich profile fields, template-driven designs, share links
  (`/c/<shortLink>`) and QR codes.
- Public/private cards with approval-based access requests and contact masking.
- Discovery: text search (`$text` + TF-IDF / BM25 / fuzzy / hybrid), discover, popular,
  recent and trending feeds, and content-based recommendations.
- Personal library, love/save, per-card stats.
- Admin panel: users, cards, templates, categories, policies, CRM inbox, audit log,
  analytics, broadcasts and notification templates.
- Auth with JWT + refresh tokens, OTP email verification, 2FA, notifications
  (in-app / push / email).

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Redux Toolkit, Tailwind CSS, react-router v6 |
| Backend | Node.js, Express 4, Mongoose (MongoDB), JWT |
| Extras | qrcode, nodemailer, web-push, multer/sharp, Cloudinary (optional), winston |
| Tests | Jest + supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend) |
| Deploy | Docker Compose, Terraform/AWS, GitHub Actions |

## Getting started

Prerequisites: Node.js 18+, MongoDB (local `mongod` or `docker compose up mongodb -d`).

```bash
npm run install-all                   # install root + backend + frontend deps
cp backend/.env.example backend/.env  # create env config
npm run dev                           # backend :5050 + frontend :5173
```

Open `http://localhost:5173`. Local dev seeds a default admin account and the templates
at boot.

### Tests

```bash
cd backend && npm test                # unit + integration
cd frontend && npm test               # Vitest
cd frontend && npm run lint           # ESLint
```

## Project structure

```
backend/    Express API
frontend/   React SPA
```

## Documentation

Full architecture, API, database, algorithm and deployment guides live at
`~/Documents/Cardly-archive/docs/` (kept outside this repository by request).

## License

MIT — see the project author for the full text.