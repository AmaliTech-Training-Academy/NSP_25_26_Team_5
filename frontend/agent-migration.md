# CommunityBoard Frontend Migration Plan (Vite + TypeScript)

Last updated: 2026-03-09
Repository: `NSP_25_26_Team_5`
Current branch: `feature/frontend-vite-ts-migration`

## 1) Frontend Baseline (pre-migration snapshot)

### Build/tooling status
- Frontend folder: `frontend/`
- Current build tool: Create React App (`react-scripts@5.0.1`)
- React version: `18.2.0`
- Router version: `react-router-dom@6.20.0`
- API client: Axios with base URL `/api` (`frontend/src/services/api.js`)
- Dev proxy: `frontend/package.json` has `"proxy": "http://localhost:8080"`
- Docker frontend build currently copies `/app/build` (CRA output)

### Implemented routes/pages
- `/` -> Home (`frontend/src/pages/Home.js`)
- `/login` -> Login (`frontend/src/pages/Login.js`)
- `/register` -> Register (`frontend/src/pages/Register.js`)
- `/create-post` -> Create Post (`frontend/src/pages/CreatePost.js`)

### Not yet implemented in frontend
- Post Detail page
- Edit Post page
- Dashboard page
- Search/filter UI
- Comment UI flows (list/form)

### Shared components currently present
- `frontend/src/components/Navbar.js`
- `frontend/src/context/AuthContext.js` (shared auth state/provider)

### API surface currently used by frontend
- Auth:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
- Posts:
  - `GET /api/posts?page=&size=`
  - `GET /api/posts/{id}` (defined in API client, not yet used by a page)
  - `POST /api/posts`
  - `PUT /api/posts/{id}` (defined in API client, not yet used by a page)
  - `DELETE /api/posts/{id}` (defined in API client, not yet used by a page)
- Categories:
  - `GET /api/categories`
- Comments:
  - Backend supports `GET /api/posts/{postId}/comments`
  - Frontend comment API calls are still TODO

### Current auth flow
- Login/register returns `{ token, email, name, role }`
- Frontend stores token + user in `localStorage`
- Axios request interceptor sends `Authorization: Bearer <token>`
- Auth-protected action in UI right now: Create Post redirects to `/login` when user is not present

### JS/JSX file inventory (current)
- `frontend/src/index.js`
- `frontend/src/App.js`
- `frontend/src/services/api.js`
- `frontend/src/context/AuthContext.js`
- `frontend/src/components/Navbar.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/Login.js`
- `frontend/src/pages/Register.js`
- `frontend/src/pages/CreatePost.js`

No `.jsx` files currently; only `.js`.

## 2) Revised Migration To-Do List (project-specific)

Use this as the execution checklist. Items were adjusted to match the current codebase.

### Phase A: Prep and alignment
- [x] Read current frontend structure and tooling
- [x] Run current frontend locally (`cd frontend && npm ci && npm start`)
- [x] Capture baseline production build (`cd frontend && npm run build`)
- [x] Confirm branch exists: `feature/frontend-vite-ts-migration`
- [ ] Notify team: frontend migrating from CRA to Vite + TypeScript
- [ ] Confirm with DevOps whether build command can stay `npm run build` (recommended)
- [ ] Confirm env strategy with backend/devops (`VITE_API_BASE_URL` or keep `/api` + proxy)
- [ ] Confirm QA is aware startup/build behavior may change
- [ ] Keep backend API contracts unchanged

Reminder (human follow-up required before merge):
- Post your migration plan in team channel and tag DevOps + QA.
- Get explicit confirmation on env naming strategy and startup/build commands.
- Log those confirmations in the PR description before requesting review.

Phase A status note:
- `npm ci` completed successfully.
- `npm start` compiled successfully on `http://localhost:3000`.
- Deep-link HTTP checks for `/login`, `/register`, `/create-post` returned `500` when backend was not running because CRA dev proxy forwards unknown paths to `http://localhost:8080`.

### Phase B: Migrate CRA -> Vite
- [x] Install Vite + React plugin
- [x] Add `vite.config.ts`
- [x] Replace CRA scripts with:
  - `dev`
  - `build`
  - `preview`
- [x] Move HTML entry from CRA pattern to Vite pattern
- [x] Remove CRA-only dependencies/config (`react-scripts`, CRA leftovers)
- [x] Confirm app runs with Vite locally

Phase B status note:
- `npm run build` passes with Vite and produces `dist/`.
- `npm run dev` starts on `http://localhost:3000`.
- SPA deep-link checks now return `200` for `/login`, `/register`, and `/create-post`.

### Phase C: Add TypeScript foundation
- [ ] Install TypeScript packages:
  - `typescript`
  - `@types/react`
  - `@types/react-dom`
  - `@types/node` (optional but recommended)
- [ ] Add `tsconfig.json`
- [ ] Enable strict mode
- [ ] Add Vite env typing (`vite-env.d.ts`)
- [ ] Confirm build passes with TS enabled

### Phase D: Env and API config updates
- [ ] Audit existing frontend env usage (currently almost none; API uses `/api`)
- [ ] Replace CRA-specific env access (if any) with `import.meta.env`
- [ ] Introduce `VITE_API_BASE_URL` (default `/api` recommended to preserve nginx/proxy behavior)
- [ ] Update `.env*` docs/examples for Vite naming (`VITE_*`)
- [ ] Share env naming changes with DevOps/QA

### Phase E: React upgrade path
- [ ] Upgrade React `18.2` -> `18.3.x` first
- [ ] Fix warnings/regressions
- [ ] Upgrade to React 19
- [ ] Validate `react-router-dom` and other dependency compatibility

### Phase F: Convert app shell and core layer first
- [ ] `index.js` -> `main.tsx`
- [ ] `App.js` -> `App.tsx`
- [ ] Type root render and provider composition
- [ ] Convert `services/api.js` -> `services/api.ts` with typed request/response models
- [ ] Convert `context/AuthContext.js` -> `context/AuthContext.tsx`
- [ ] Verify login/register/create-post still works after conversion

### Phase G: Create shared types
- [ ] Add `frontend/src/types/`
- [ ] Add:
  - `User`
  - `AuthResponse`
  - `Post`
  - `Category`
  - `Comment`
  - `PostRequest`
  - `PagedResponse<T>`
  - `UserRole` union (`"USER" | "ADMIN"`)
- [ ] Add `PostCategory` only if frontend introduces category enum constraints later

### Phase H: Convert UI and pages
- [ ] Convert shared component(s):
  - Navbar
  - (Add reusable `Button/Input/ErrorMessage/Loader` only if created in this migration)
- [ ] Convert current pages:
  - Home
  - Login
  - Register
  - CreatePost
- [ ] Type form events, input change events, nullable state, and props
- [ ] Convert route definitions to TS/TSX

### Phase I: Optional/backlog flows (not in current MVP UI)
- [ ] Post detail page
- [ ] Edit post page
- [ ] Comment list/form UI
- [ ] Search/filter controls
- [ ] Dashboard widgets/charts

### Phase J: DevOps/CI and release readiness
- [ ] Update frontend Dockerfile for Vite output (`dist` instead of `build`)
- [ ] Keep nginx SPA fallback and `/api` proxy behavior intact
- [ ] Verify `.github/workflows/ci.yml` frontend job still passes
- [ ] Verify docker-compose full stack (`frontend` reaches `backend`)
- [ ] Remove leftover `.js` files after TS migration completes
- [ ] Remove unused deps
- [ ] Fix lint + TS errors
- [ ] Update README with:
  - new frontend dev/build commands
  - env variable changes
  - migration notes

## 3) Commit Message Plan (use throughout migration)

Use small commits per phase. Suggested sequence:

1. `chore(frontend): migrate build tooling from CRA to Vite`
2. `chore(frontend): add TypeScript config and Vite env typing`
3. `refactor(frontend): convert app entry and router shell to TSX`
4. `refactor(frontend): type API service layer and auth context`
5. `refactor(frontend): convert core pages and navbar to TypeScript`
6. `chore(devops): update frontend Docker build output for Vite`
7. `ci(frontend): align GitHub Actions frontend build with Vite setup`
8. `docs(frontend): update migration and setup documentation`

If you finish multiple tiny tasks in one phase, squash into the nearest phase commit.

## 4) PR Build Plan (feature -> dev)

### PR title
`feat(frontend): migrate CommunityBoard frontend to Vite + TypeScript`

### PR description template

```md
## Summary
- Migrated frontend from Create React App to Vite
- Added TypeScript with strict mode
- Converted existing app shell/pages/services/context to TS/TSX
- Updated Docker/CI and docs for new frontend build flow

## Scope
- Included: Home, Login, Register, CreatePost, Navbar, AuthContext, API layer
- Not included: Post Detail/Edit, comments UI create/delete, search/filter UI, dashboard

## API Contract
- No backend endpoint contract changes
- Frontend still targets `/api` by default (or `VITE_API_BASE_URL` when provided)

## Validation
- [ ] npm run dev
- [ ] npm run build
- [ ] Login/Register flow works
- [ ] Create post flow works
- [ ] Home post list works
- [ ] Docker compose run verified

## Risk / Rollback
- Main risks: env wiring and Docker output path change (`dist`)
- Rollback: revert frontend tooling commits or temporarily switch Docker build back to CRA image
```

### Merge checklist (before merging to `dev`)
- [ ] Rebase branch on latest `dev`
- [ ] Resolve conflicts in `frontend/package*.json`, Dockerfile, CI workflow carefully
- [ ] Re-run local build and smoke test key flows
- [ ] Ensure CI passes on PR
- [ ] Request reviews from frontend + devops + QA reps
- [ ] Merge with squash or merge strategy agreed by team

## 5) Execution note for this repository

Your original checklist referenced pages/features not currently in this codebase. This plan keeps migration focused on what exists now, and keeps missing features as explicit backlog items so the migration PR stays reviewable and low-risk.
