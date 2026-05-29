# Project Refactoring & Security Remediation Plan

This document outlines the systematic plan to address the remaining global mandates for the OptiConnect GIS platform. Given the massive scope of replacing the ORM, rewriting the CSS layer, and enforcing security policies, we must tackle this iteratively to prevent breaking the currently stable application.

## Open Questions
> [!IMPORTANT]
> **Database Introspection:** Since Prisma requires a `schema.prisma` file, I will need to pull your current live database schema using `npx prisma db pull`. Can you confirm your `.env.development` contains the correct full connection string (`DATABASE_URL=postgresql://user:password@localhost:5432/dbname`) required for Prisma?
> 
> **Scope of CSS Migration:** Removing Tailwind entirely and migrating to Vanilla CSS requires touching *every single React component* in the frontend. Are you comfortable with the UI being in a partially migrated state during the transition, or would you prefer I migrate it route-by-route?

---

## Phase 1: Prisma ORM Integration (Backend)
**Objective:** Replace raw `pg` SQL strings with Prisma ORM to guarantee type safety, prevent SQL injection, and satisfy the Global IDP mandate.

1. **Initialization:**
   - Install `prisma` (dev) and `@prisma/client`.
   - Run `npx prisma init` to create the schema configuration.
   - Run `npx prisma db pull` to introspect the existing PostgreSQL schema and generate the `schema.prisma` models.
   - Add `@@index` to frequently queried columns as per the mandate.
   - Run `npx prisma generate` to build the TypeScript/JavaScript client.

2. **Database Client Wrapper:**
   - Modify `backend/src/config/database.js` to initialize and export the Prisma Client alongside the existing `pool` (for a seamless, incremental transition).

3. **Incremental Module Migration:**
   - Migrate `auth.controller.js` and `user.service.js` first.
   - Migrate `network-planning` services (`folder.service.js`, `catalog.service.js`).
   - Remove raw `pool.query` statements once all modules are verified.

## Phase 2: Security & Architecture Remediation (Backend)
**Objective:** Implement the fixes identified in the Deep Security Audit.

1. **Zod Validation Layer:**
   - Install `zod` for strict runtime payload validation.
   - Create a validation middleware (`backend/src/shared/middleware/validate.js`).
   - Define strict schemas for all `POST`/`PUT` endpoints (e.g., Create Folder, User Login, Feature Submission).

2. **Global Error Handling:**
   - Implement `asyncHandler()` wrapper to eliminate repetitive `try/catch` boilerplate in controllers.
   - Throw instances of `AppError` caught globally.

3. **API Key Proxying:**
   - Ensure the frontend never holds API keys. Move any third-party integrations (if any) strictly to backend environment variables.

## Phase 3: Vanilla CSS & Aesthetics Migration (Frontend)
**Objective:** Strip Tailwind CSS completely in favor of Vanilla CSS using CSS variables, enforcing the Glassmorphism and premium design mandate.

1. **Design System Foundation (`index.css`):**
   - Define `:root` CSS variables for all design tokens (colors, typography, spacing, shadows).
   - Create utility classes for generic layout structures (e.g., `.flex-center`, `.grid-layout`).
   - Define core component classes (e.g., `.btn-primary`, `.glass-card`, `.modal-overlay`).

2. **Component Stripping (Iterative):**
   - Start with Shared Components (Buttons, Modals, Breadcrumbs).
   - Move to layout views (`InfrastructureManager`, `InfrastructureHeader`).
   - Remove Tailwind utility strings and replace them with semantic `className` attributes.

## Verification Plan

### Automated Tests
- Start the development servers (`npm run dev`) and monitor the console for Prisma instantiation errors.
- Run the existing backend test scripts (`test_normal_user.js`, `test_api.js`) to verify Prisma behaves identically to the raw `pg` queries.

### Manual Verification
- **Prisma:** Create a new folder via the UI. Verify the DB write succeeds and the UI updates.
- **Security:** Send a malformed POST request via a script to verify Zod rejects it with a 400 error.
- **CSS:** Review the frontend visually to ensure the "Glassmorphism" effect looks premium and the layout remains responsive without Tailwind.
