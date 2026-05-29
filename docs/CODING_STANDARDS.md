# CV Tracker — Coding Standards & Architecture Guidelines

This document serves as the single source of truth for all coding conventions, architectural decisions, and performance standards used across the CV Tracker application. **When starting a new session or making changes, always adhere to these guidelines.**

## 1. File Size & Component Granularity
To maintain readability and ease of maintenance, strictly adhere to the following file-size limits:
- **UI Components:** 150 - 200 lines max. Extract sub-components if larger.
- **Page Components:** 200 - 300 lines max. Use React Hooks (`/hooks`) to extract data fetching and complex state logic.
- **API Routes (Server):** 100 - 150 lines max. Route closures should be lean; extract complex business logic into controllers.
- **Utility Files:** 50 - 100 lines max. 

## 2. TypeScript & Type Safety
- **No `any` Types:** The use of `any` is strictly prohibited. Always define interfaces or types (e.g., `Record<string, unknown>`, explicit unions, or Prisma generated types).
- **Zod Validation:** All incoming data on `POST` and `PUT` API endpoints must be validated using `Zod` schemas defined in `server/src/utils/validation.ts`. Do not use manual `if (!req.body.name)` validation.

## 3. Data Fetching & API Communication
- **Centralized Service:** Do not use raw `fetch()` calls scattered across components. Always use the typed API wrapper methods (`apiGet`, `apiPost`, `apiPut`, `apiDelete`, `apiUpload`) from `client/src/services/api.ts`.
- **API Constants:** Do not hardcode endpoint strings in components. Reference them from `client/src/constants/api.ts`.

## 4. State & UI Architecture
- **Status Colors:** Do not duplicate `switch(status)` statements for badge colors. Use the centralized helpers in `client/src/utils/statusColors.ts` for all visual status representations (Candidates Table, Pipeline, Interview badges).
- **Performance (React):** 
  - Wrap computationally expensive operations (like filtering massive arrays or formatting Recharts data) inside `useMemo()`.
  - Pass down event handlers using `useCallback()` when passed to heavy child components.
  - All route pages (e.g., `DashboardPage`, `PipelinePage`) must be imported using `React.lazy()` and wrapped in `<Suspense>` within `App.tsx` for optimal bundle code-splitting.

## 5. Backend Architecture & Security
- **Security Middleware:** Ensure `helmet` (security headers) and strict `cors` origins remain applied in `server/src/index.ts`.
- **Rate Limiting:** Protect public or sensitive endpoints. `express-rate-limit` is applied globally (100 req/15m) and strictly on the `/login` route (10 req/15m).
- **Database (Prisma):** Add `@@index` to frequently queried columns (e.g., `status`, `createdAt`, `email` on the `Candidate` model) to ensure query speed as the dataset grows. Run `npx prisma db push` when updating schemas.

## 6. Error Handling
- **Server-Side:** Do not use dense `try/catch` boilerplate in every API route. Wrap route handlers in `asyncHandler()` and throw instances of `AppError`. The centralized `errorHandler` middleware (in `server/src/middleware/errorHandler.ts`) will securely format and catch all exceptions.
- **Client-Side:** The application root is wrapped in `ErrorBoundary.tsx` to prevent pure-white screens of death. If any component throws a runtime rendering error, a styled fallback allows the user to click "Try Again".

## 7. Linting & Formatting
- **Prettier:** Code styling is governed by `.prettierrc` (120 print width, trailing commas, single quotes).
- **ESLint:** Enforces Best Practices natively via `.eslintrc.cjs` on both client and server frameworks. Run `npm run lint:fix` frequently.
