# 01 — Project Overview

## What it is

**Cardly** v1.0.0 — a digital business card / visiting-card platform. Users create,
customize (canvas editor via Konva), share (base62 short links + QR codes), and analyze
digital business cards. Features: public discovery/trending, saved-cards library,
private-card access requests (QR-scan grants temporary access), notifications, analytics,
and a full admin panel (users, cards, templates, analytics, settings).

- Author: Suzan Ghimire (`sznghimire61@gmail.com`), sole committer.
- License: MIT (declared; no LICENSE file present).
- Remote: https://github.com/suzzaanDEV/visiting-card-app
- Origin: university final-year project (see `UNIVERSITY_PROJECT_PROPOSAL.md`,
  `UNIVERSITY_FINAL_REPORT.md`, `ALGORITHMS.md`). University docs describe *intended*
  behavior; **the code is the source of truth** when they disagree.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 SPA, Redux Toolkit, Vite 6, Tailwind CSS 3.4, react-router-dom v7, Konva/react-konva (card canvas), three.js (3D card), framer-motion, gsap, recharts/chart.js, qrcode.react, html2canvas, react-hot-toast |
| Backend | Express 4 (CommonJS), Mongoose 7 / MongoDB, jsonwebtoken + bcryptjs, Cloudinary SDK + sharp + multer (images), nodemailer (SMTP email OTP), winston (logging), helmet, express-rate-limit, cors, compression, qrcode, base62 |
| Testing | Backend: Jest + supertest + mongodb-memory-server · Frontend: Vitest + @testing-library/react + jsdom |
| Infra | Docker Compose (dev + prod w/ Caddy auto-HTTPS), Terraform (AWS EC2/EIP/VPC), PM2 config, GitHub Actions CI |
| Package mgmt | npm everywhere; three independent packages (root orchestrator + backend + frontend); Node >=16 declared, Node 20 used in CI/Docker |

## Facts that will surprise you

- **JavaScript only** (no real TypeScript): ~86 `.jsx` + ~83 `.js` files under frontend
  `src/`; backend is CommonJS, frontend is ESM/JSX.
- **No axios usage** despite axios being installed — all HTTP uses native `fetch`
  (~119 call sites).
- **Redis is configured** in `.env.example`/docker-compose but has **no code usage** — placeholder only.
- Email OTP disabled by default (`EMAIL_ENABLED=false`); dev flow surfaces OTP as
  `devOtp` in API responses.
- Cloudinary has a "demo" fallback mode when credentials are absent.
- ~11,700 LOC backend, ~28,700 LOC frontend.
