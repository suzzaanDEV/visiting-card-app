# 04 — Code Conventions

## Module systems (critical split)

- **Backend: CommonJS** — `require`/`module.exports`. Controllers export named
  functions: `exports.register = async (req, res, next) => { … }`.
- **Frontend: ES modules** — `import`/`export`, `.jsx` components with default exports.

## Naming

- Backend files: descriptive camelCase (`cardAccessRequestModel.js`, `errorMiddleware.js`).
- Frontend components: PascalCase `.jsx` matching the default export (`ProtectedRoute.jsx`).
- Utils/hooks: camelCase (`useDebounce.js`, `authStorage.js`).
- Mongoose models: singular PascalCase (`Card`, `SavedCard`).
- Redux thunks: `createAsyncThunk('slice/actionName', …)`; pending/fulfilled/rejected
  handled in `extraReducers`.

## Formatting

- **No Prettier/.editorconfig** — do not add one unprompted.
- ESLint 9 flat config, frontend-only (`frontend/eslint.config.js`): js recommended +
  react-hooks + react-refresh; custom rule:
  `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]`.
- Observed style: 2-space indent, single quotes, semicolons.
- **No typecheck anywhere** (plain JS).

## Error handling patterns

- Controllers: try/catch → `res.status(...).json({ error })`.
- Central `errorMiddleware.js` normalizes Mongoose errors; global handler hides stacks
  in production.
- Frontend thunks: `rejectWithValue(error.message)`; 429 rate-limit responses get special
  handling (`rateLimitHandler.js`, `cardsThunks.js`) with friendly messaging.

## Logging

- Prefer `utils/logger.js` (winston) on the backend — it has custom methods
  `logger.security`, `logger.http`, `logger.errorWithContext`. Existing code mixes in raw
  `console.*`; match local style but prefer logger for new backend code.

## Comments & strings

- Comments are frequent and explanatory (tutorial-like in places); keep that tone.
- Emoji appear in log/console strings (`🚀 Server running…`, `❌`, `⚠️`) — matching this
  is fine.

## Testing conventions

- Backend tests live centrally: `backend/test/unit/` and `backend/test/integration/`
  (+ `setup.js`, `env.js`, `integrationSetup.js`).
  - Unit example: `backend/test/unit/sanitize.test.js` — pure function assertions (Jest).
  - Integration example: `backend/test/integration/auth.test.js` — spins up
    mongodb-memory-server via `setupIntegrationDb()`, imports `{ app }` from
    `../../src/app`, drives supertest against real routes: register → grab `devOtp`
    from response → verify → login. Test env raises rate limits.
- Frontend tests are colocated next to utils: e.g. `src/utils/validation.test.js`
  (Vitest + @testing-library/react + jsdom). Coverage only collected from
  `src/utils/**` and `src/features/auth/**`.
