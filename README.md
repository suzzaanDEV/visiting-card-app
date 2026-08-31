# Cardly

A modern digital business card platform for creating, sharing, and discovering beautiful business cards with QR codes, rich profile fields, and a personal card library. Built with a React/Vite frontend and an Express/MongoDB backend, Cardly supports card privacy controls, approval-based access requests, text search with TF-IDF/BM25/fuzzy ranking, trending feeds, content-based recommendations, and a full-featured admin panel.

---

## Features

- **Card Creation** — Build rich profile cards with template-driven designs, shareable links (`/c/<shortLink>`), and QR codes.
- **Privacy & Access** — Public/private card controls with approval-based access requests and contact masking for anonymous viewers.
- **Discovery** — Hybrid search combining MongoDB `$text` with TF-IDF, BM25, fuzzy matching, and a dedicated advanced search algorithm.
- **Feeds & Recommendations** — Discover, popular, recent, and trending feeds, plus content-based recommendations.
- **Personal Library** — Save and love cards, view per-card statistics, and manage a personal library.
- **Admin Panel** — Manage users, cards, templates, categories, policies, CRM inbox, audit logs, analytics, broadcasts, and notification templates.
- **Authentication** — JWT + refresh tokens, OTP email verification, two-factor authentication (2FA), and in-app, push, and email notifications.

---

## Tech Stack

| Layer          | Stack |
|---|---|
| **Frontend**   | React 18, Vite, Redux Toolkit, Tailwind CSS, react-router-dom v7 |
| **Backend**    | Node.js, Express 4, Mongoose (MongoDB), JWT |
| **Extras**     | qrcode, nodemailer, web-push, multer/sharp, Cloudinary (optional), winston |
| **Testing**    | Jest + supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend) |
| **Deploy**     | Docker Compose, Terraform/AWS, GitHub Actions |

---

## Prerequisites

- **Node.js** `>=16.0.0`
- **npm** `>=8.0.0`
- **MongoDB** — either a local `mongod` instance or via Docker

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/visiting-card-app.git
cd visiting-card-app

# 2. Install dependencies for root, backend, and frontend
npm run install-all

# 3. Create backend environment configuration
cp backend/.env.example backend/.env

# 4. Edit backend/.env with your local values (database URL, JWT secret, etc.)

# 5. Start the development servers (backend :5050 + frontend :5173)
npm run dev
```

Open `http://localhost:5173` in your browser. The local dev server seeds a default admin account and the templates automatically at boot.

---

## Usage

### Running the Application

```bash
# Start both frontend and backend concurrently
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client
```

### Docker

```bash
# Build and start the full stack (MongoDB, backend, frontend)
npm run docker:up

# Stop and remove the containers
npm run docker:down

# Production stack
npm run docker:up:prod
npm run docker:down:prod
```

The Docker app is served at `http://localhost:8080`. The API is available at `http://localhost:5050/api` with a health check at `http://localhost:5050/health`.

### Environment Variables

Create a `backend/.env` file (see `backend/.env.example` for all available options):

```env
DATABASE_URL=mongodb://localhost:27017/cardly
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=5050
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

For the frontend, create `frontend/.env` (see `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5050/api
VITE_APP_NAME=Digital Business Cards
```

### Seeding Data

```bash
# Seed the default admin account
npm run seed:admin

# Seed card templates
npm run seed:templates
```

---

## Testing

```bash
# Run all backend tests (unit + integration)
cd backend && npm test

# Run backend tests with coverage
cd backend && npm run test:ci

# Run frontend tests
cd frontend && npm test

# Run frontend tests in watch mode
cd frontend && npm run test:watch

# Run frontend linting
cd frontend && npm run lint
```

---

## Dependencies

### Backend (Production)

| Package | Purpose |
|---|---|
| `base62` | URL-safe short-link encoding |
| `bcryptjs` | Password hashing |
| `cloudinary` | Image/media storage (optional) |
| `compression` | Response compression middleware |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment variable management |
| `express` | Web framework |
| `express-rate-limit` | API rate limiting |
| `helmet` | Security HTTP headers |
| `jsonwebtoken` | JWT authentication |
| `mongoose` | MongoDB object modeling |
| `morgan` | HTTP request logging |
| `multer` | File upload handling |
| `nodemailer` | Email delivery (OTP, notifications) |
| `qrcode` | QR code generation |
| `sharp` | Image processing |
| `web-push` | Web push notifications |
| `winston` | Logging |

### Backend (Development)

| Package | Purpose |
|---|---|
| `jest` | Test framework |
| `mongodb-memory-server` | In-memory MongoDB for tests |
| `nodemon` | Development server hot-reloading |
| `supertest` | HTTP endpoint testing |

### Frontend (Production)

| Package | Purpose |
|---|---|
| `@reduxjs/toolkit` | State management |
| `axios` | HTTP client |
| `chart.js` / `react-chartjs-2` | Data visualization |
| `framer-motion` | UI animations |
| `gsap` | Advanced animations |
| `html2canvas` | Card export to image |
| `konva` / `react-konva` | 2D canvas rendering |
| `qrcode` / `qrcode.react` | QR code display |
| `react` / `react-dom` | UI framework |
| `react-hot-toast` | Toast notifications |
| `react-icons` | Icon library |
| `react-redux` | Redux bindings for React |
| `react-router-dom` | Client-side routing |
| `recharts` | Chart components |
| `three` | 3D rendering (Three.js) |
| `use-image` | Image loader hook for Konva |
| `uuid` | Unique ID generation |

### Frontend (Development)

| Package | Purpose |
|---|---|
| `@eslint/js` | ESLint core |
| `@testing-library/jest-dom` | DOM testing utilities |
| `@testing-library/react` | React testing utilities |
| `@types/react` / `@types/react-dom` | TypeScript type definitions |
| `@vitejs/plugin-react` | Vite React plugin |
| `@vitest/coverage-v8` | Code coverage for Vitest |
| `autoprefixer` | CSS autoprefixing |
| `eslint` | JavaScript linting |
| `eslint-plugin-react` | React-specific lint rules |
| `eslint-plugin-react-hooks` | React hooks lint rules |
| `eslint-plugin-react-refresh` | Vite React Refresh support |
| `globals` | Global variable definitions |
| `jsdom` | DOM environment for tests |
| `postcss` | CSS transformations |
| `tailwindcss` | Utility-first CSS framework |
| `vite` | Frontend build tool |
| `vitest` | Unit test framework |

### Root

| Package | Purpose |
|---|---|
| `concurrently` | Run multiple npm scripts in parallel |
| `axios` | Root-level HTTP client utility |
| `recharts` | Root-level chart utility |

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── algorithms/       # Search, trending, recommendation, QR, analytics algorithms
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, rate limiting, validation, error handling
│   │   ├── models/           # Mongoose schemas (18 models)
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Helper functions
│   │   ├── seeds/            # Admin and template seeders
│   │   └── app.js            # Express app entry point
│   ├── test/                 # Jest + supertest tests
│   └── logs/                 # Winston log output
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── features/         # Redux feature slices
│   │   ├── redux/            # Global Redux store
│   │   ├── services/         # API client functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Frontend helper functions
│   │   └── main.jsx          # React entry point
│   ├── public/               # Static assets
│   └── dist/                 # Production build output
├── docker/                   # Docker configuration files
├── docker-compose.yml        # Local Docker stack
├── docker-compose.prod.yml   # Production Docker stack
├── Dockerfile.backend        # Backend Docker image
├── Dockerfile.frontend       # Frontend Docker image
├── package.json              # Root monorepo scripts
└── AGENTS.md                 # Developer instructions and conventions
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start backend (:5050) and frontend (:5173) concurrently |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `npm run install-all` | Install dependencies for root, backend, and frontend |
| `npm run build` | Build frontend for production |
| `npm run start` | Start backend in production mode |
| `npm run test` | Run backend CI tests + frontend tests |
| `npm run test:backend` | Run backend tests only |
| `npm run test:frontend` | Run frontend tests only |
| `npm run seed:admin` | Seed the default admin user |
| `npm run seed:templates` | Seed card templates |
| `npm run docker:up` | Start local Docker stack |
| `npm run docker:down` | Stop local Docker stack |
| `npm run docker:up:prod` | Start production Docker stack |
| `npm run docker:down:prod` | Stop production Docker stack |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. **Fork the repository** and create your feature branch from `main`.
2. **Install dependencies** with `npm run install-all`.
3. **Create a `.env`** file in `backend/` from `backend/.env.example`.
4. **Write tests** for any new features or bug fixes.
5. **Run the test suite** to ensure everything passes:
   ```bash
   npm run test
   ```
6. **Lint the frontend** to ensure code style consistency:
   ```bash
   cd frontend && npm run lint
   ```
7. **Commit your changes** with a clear, descriptive commit message.
8. **Push your branch** and open a Pull Request against `main`.

Before submitting, please ensure:
- All existing tests pass.
- New code is covered by tests where applicable.
- Frontend code passes ESLint.
- You have read `AGENTS.md` and followed the project conventions.

---

## License

This project is licensed under the **MIT License**.

---

## Documentation

Full architecture, API, database schema, algorithms, and deployment guides are maintained at:

```
~/Documents/Cardly-archive/docs/
```

Key documents:

- `architecture/ARCHITECTURE.md` — System design, layers, request lifecycle, and configuration
- `architecture/WORKFLOWS.md` — Auth, card privacy/access, discovery, admin, and analytics flows
- `api/API.md` — Every API endpoint (mounts, auth, parameters)
- `database/DATABASE.md` — All 18 Mongoose models, indexes, and TTLs
- `algorithms/ALGORITHMS.md` — Search, trending, recommendation, QR, and analytics algorithms
- `development/CONVENTIONS.md` — Style guide and coding conventions
- `deployment/DEPLOYMENT.md` — Docker, Terraform/AWS, and CI/CD setup
- `security/SECURITY.md` — Threat model and security considerations
