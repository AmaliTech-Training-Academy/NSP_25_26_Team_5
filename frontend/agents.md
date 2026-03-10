# Purpose
Define strict execution rules for contributors working in the `frontend` app so implementation stays consistent, reviewable, and safe.

# Scope
This file applies to all code and assets inside `frontend/`, especially `src/` (React + TypeScript UI code).

# Project Overview
- Project name: `communityboard-frontend`
- Project type: web app
- Stack: React + TypeScript + Vite + CSS Modules + React Router + Axios
- Current UI direction: reusable component-first architecture split into `components/ui`, `components/shared`, and feature-scoped components
- Versions in use (`frontend/package.json`):
- `react`: `^18.2.0`
- `react-dom`: `^18.2.0`
- `react-router`: `^7.13.1`
- `axios`: `^1.6.2`
- `@fontsource/inter`: `^5.2.8`
- `@fontsource/poppins`: `^5.2.7`
- `typescript`: `^5.9.2`
- `vite`: `^7.3.1`
- `@vitejs/plugin-react`: `^5.1.4`
- `@types/react`: `^18.3.23`
- `@types/react-dom`: `^18.3.7`
- `@types/node`: `^24.3.0`

# Feature Listing
- Authentication UI foundation: login and register pages/cards/forms.
- Authentication behavior: typed login/register hooks and auth API integration.
- Authentication routing: `PublicRoute` and `ProtectedRoute` route guards.
- Reusable UI primitives: `Button` and `Input` components.
- Shared layout/navigation: `MainLayout`, `NavBar`, `Breadcrumbs`.
- Shared feed controls: `SearchBar`, `FilterBar`, and `Paginations`.
- Home feed UI: post feed/list/card and empty state.
- Post creation UI: responsive `CreatePostModal` with mobile breadcrumbs.
- Comment feature UI: responsive post-detail comments section with guest gating, inline add/edit/delete states, and dedicated feature-scoped API/types/utils.
- Core infra: centralized Axios client in `src/lib/axios/client.ts`.

# Setup
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Build: `npm run build`
4. Preview production build: `npm run preview`
5. Type-check: `npm run typecheck`
6. Test: `npm run test` (currently prints "No frontend tests configured")
7. Lint: Not configured yet (do not invent commands)

# Coding Conventions
- Use TypeScript for all new code in `src/`.
- Prefer reusable components/modules over duplication.
- Preserve existing design system/tokens and current UI patterns.
- Functional approach only; one responsibility per function.
- Use clear naming; avoid short/ambiguous names.
- For component-scoped styling, use `*.module.css`.
- Add one concise comment immediately before each non-trivial function; avoid inline comments unless necessary.
- Avoid breaking changes unless explicitly requested.

# Architecture and Coding Style Rules
- UI primitives belong in `src/components/ui/<ComponentName>/`.
- Shared app components belong in `src/components/shared/<ComponentName>/`.
- Feature-specific UI belongs in `src/features/<feature>/components/<ComponentName>/`.
- Feature API modules belong in `src/features/<feature>/api/`.
- Shared network configuration belongs in `src/lib/axios/`.
- Icon components belong in `src/assets/Icons/` and should use the `*Icon.tsx` naming pattern.
- Reusable custom hooks across features should live in `src/hooks/` when introduced.
- Cross-feature pure utilities should live in `src/utils/` when introduced.
- Static typed constants/mock data should live in `src/data/` when introduced.
- Re-export rule: reusable component folders should include an `index.ts` re-export; internal-only components may be directly imported.
- Re-export rule: shared folders (`hooks`, `utils`, `data`) should use `index.ts` barrel exports.
- File ordering rule: imports first.
- File ordering rule: types/constants second.
- File ordering rule: helper functions third.
- File ordering rule: component/function implementation fourth.
- File ordering rule: exports last when practical.

# UI/UX Rules (if frontend)
- UI must be responsive on mobile and desktop.
- Responsive implementation must be mobile-first: default/base styles target mobile, and larger breakpoints must use `@media (min-width: ...)`.
- Match provided Figma typography, spacing, color, and visual hierarchy when design specs exist.
- Keep interaction states explicit (`hover`, `focus-visible`, `disabled`, `active`).
- Preserve current UX patterns unless change is explicitly requested.
- Use semantic HTML for structure and accessibility (`form`, `label`, button types, ARIA labels where needed).
- Do not add visual features that are not in scope.

# Clarification Requirement
- Do not implement code changes immediately for non-trivial requests.
- For any non-trivial change, propose first and wait for explicit approval.
- Proposal must include one recommended approach.
- Proposal must include at least one alternative approach.
- Proposal must explain why the recommended approach is preferred.
- Proposal must describe tradeoffs for each option (risk, complexity, maintainability, delivery speed).
- Proposal must describe behavior flow in usage-first language.
- Proposal must list exact files that will change.
- Proposal must include a patch/diff preview before implementation.
- Implement only after explicit go-ahead.
- If requirements are unclear, ask concise plain-language questions first.

# Validation
- Required before finalizing: `npm run typecheck` and `npm run build`.
- If real lint/test scripts are added later, they become mandatory validation gates.
- For UI changes, verify both desktop and mobile layout behavior.

# Maintenance Rule
- Update this `agents.md` whenever architecture, concepts, or file structure changes.
- Keep rules enforceable; remove outdated instructions immediately.
- Provide one git commit message suggestion for every completed change.

# Current Folder and File Structure
Current:
```text
frontend/
  package.json
  src/
    app/
      providers/
      router/
    assets/
      Icons/
    components/
      ui/
        Button/
        Input/
      shared/
        Breadcrumbs/
        FilterBar/
        MainLayout/
        NavBar/
        Paginations/
        SearchBar/
    context/
      AuthContext/
      AuthProvider/
    features/
      auth/
        api/
        components/
          LoginCard/
          LoginForm/
          RegisterCard/
          RegisterForm/
        hooks/
          useLoginForm/
          useRegisterForm/
        pages/
          Login/
          Register/
        types/
        utils/
      comment/
        api/
        components/
          CommentsSection/
        types/
        utils/
      post/
        api/
        components/
          CreatePostModal/
          EmptyPosts/
          PostCard/
          PostFeed/
          PostList/
        hooks/
        pages/
        types/
        utils/
    lib/
      axios/
    pages/
    services/
```

Required evolution:
```text
src/
  components/
    ui/
      <ComponentName>/
        index.ts
        <ComponentName>.tsx
        <ComponentName>.types.ts
        <ComponentName>.module.css
        <ComponentName>.utils.ts (optional)
    shared/
      <ComponentName>/
        index.ts
        <ComponentName>.tsx
        <ComponentName>.types.ts
        <ComponentName>.module.css
        <ComponentName>.utils.ts (optional)
  features/
    <feature>/
      api/
      components/
      hooks/
      pages/
      types/
      utils/
  hooks/
    index.ts
  utils/
    index.ts
  data/
    index.ts
```

# Concepts Tracker
## Known/Used Concepts
- React functional components and hooks (`useState`, `useEffect`, `useRef`, `useId`)
- Typed props/interfaces with TypeScript
- CSS Modules for component-level styling
- Component composition and icon slot patterns
- Feature-first organization with shared UI primitives
- Axios client abstraction for API calls
- Vite build pipeline and ESM module imports

## Concepts to Learn Next
- Route-level architecture patterns with `react-router`
- Form validation patterns with typed schemas
- Design token pipeline (`variables.css` or typed theme objects)
- Accessibility testing workflow for interactive components
- Unit/component test setup (Vitest + React Testing Library)

# PR Notes
- Keep PRs focused and small.
- Include before/after behavior summary for UI changes.
- Document tradeoffs and known limitations.
- Do not bundle unrelated refactors with feature changes.
- Include one commit message suggestion in every handoff.

# Incremental Commit Tracker
- Step 1 command: `git add frontend/src/App.tsx frontend/src/components/shared/NavBar/NavBar.tsx`
- Step 1 message: `feat(frontend): expose post detail route for guest comment viewing`
- Step 2 command: `git add frontend/src/features/comment frontend/src/features/post/pages/PostDetail/PostDetail.tsx frontend/src/features/post/api/api.post.ts frontend/src/features/post/types/post.type.ts`
- Step 2 message: `feat(frontend): add responsive comment feature for post details`

