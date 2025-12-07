# Phase 2 Implementation Checklist for Tahbeer LMS

## 1. Replace Axios with Native Fetch ✅ Priority: HIGH
**File:** `/lib/api/client.ts`

**Current state:** Using axios with interceptors for auth + error handling  
**Goal:** Replace with lightweight fetch wrapper aligned with Next.js best practices

**Requirements:**
- [ ] Create `ApiClient` class wrapping native `fetch`
- [ ] Support methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- [ ] Auto-inject `Authorization: Bearer ${token}` from `AuthClient.getToken()` (client-side only)
- [ ] Set default `Content-Type: application/json` header
- [ ] Handle 401 responses → trigger `AuthClient.logout()` + redirect to `/login`
- [ ] Parse JSON responses automatically
- [ ] Throw meaningful errors with message extraction from API responses
- [ ] Export singleton instance as `apiClient` and default export
- [ ] Remove axios dependency from `package.json`
- [ ] Update all API modules (`auth.ts`, `courses.ts`, `admin.ts`) to use new client

**Validation:**
- Build passes without axios import errors
- Auth token injection works in browser DevTools Network tab
- 401 responses trigger logout + redirect
- React Query hooks continue working with new client

---

## 2. Authentication & RBAC Hardening ✅ Priority: HIGH

### 2.1 Unify Token Storage Strategy
**Files:** `/lib/auth/client.ts`, `/lib/middleware/auth.ts`, `/app/api/auth/login/route.ts`

**Current state:** Mixed localStorage (client) + bearer headers (server)  
**Goal:** Single source of truth for auth tokens

**Decision needed:** Pick ONE approach:
- **Option A (Recommended):** HTTP-only cookies with CSRF protection
  - [ ] Update login route to set `auth_token` cookie (HttpOnly, Secure, SameSite=lax)
  - [ ] Update `AuthClient` to read from cookie via server-side helper
  - [ ] Update middleware to read cookie instead of Authorization header
  - [ ] Keep CSRF double-submit pattern already in `/app/middleware.ts`
  
- **Option B:** Bearer token only
  - [ ] Keep localStorage approach
  - [ ] Remove cookie logic from middleware
  - [ ] Ensure all requests include Authorization header

**Validation:**
- Single token read path across client/server
- No token leakage in browser console/localStorage (if using cookies)
- CSRF protection active for mutations

### 2.2 Server-Side RBAC Enforcement
**Files:** `/lib/authorization/policies.ts`, `/lib/middleware/auth.ts`, route handlers

**Current state:** RBAC policies exist but server routes use ad-hoc role checks  
**Goal:** Reuse centralized policies on server

**Requirements:**
- [ ] Create `/lib/authorization/checkPolicy.ts` helper that imports `POLICIES`
- [ ] Signature: `checkPolicy<P extends Policy>(user: AuthUser, policy: P, resource?: PolicyResourceMap[P]): boolean`
- [ ] Update `withAuth` middleware to optionally accept policy name instead of role array
- [ ] Refactor route handlers to call `checkPolicy()` instead of manual role checks
- [ ] Examples: course update/delete should call `checkPolicy(user, 'course:update', course)`

**Validation:**
- Server and client reject same unauthorized actions
- Policy updates propagate to both client and server automatically

---

## 3. Testing Foundation ✅ Priority: HIGH

### 3.1 Unit/Integration Tests with Vitest
**New files:** `vitest.config.ts`, `/tests/unit/`, `/tests/integration/`

**Requirements:**
- [ ] Install: `vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Create `vitest.config.ts` with path aliases matching `tsconfig.json`
- [ ] Add test scripts to `package.json`: `"test": "vitest"`, `"test:ui": "vitest --ui"`
- [ ] Write tests for:
  - [ ] `/lib/services/authService.ts` (login, register, getCurrentUser)
  - [ ] `/lib/services/courseService.ts` (CRUD operations)
  - [ ] `/lib/authorization/policies.ts` (all 11 policies)
  - [ ] `/lib/middleware/auth.ts` (token validation, role checks)
- [ ] Set coverage threshold: 80% lines
- [ ] Add `coverage/` to `.gitignore`

**Validation:**
- `yarn test` passes with green output
- Coverage report shows ≥80%
- Tests can run in CI pipeline

### 3.2 Mock Service Worker (MSW)
**New files:** `/tests/mocks/handlers.ts`, `/tests/mocks/server.ts`

**Requirements:**
- [ ] Install: `msw`
- [ ] Create mock handlers for API routes (`/api/auth/login`, `/api/courses`, etc.)
- [ ] Set up MSW server for Node (tests)
- [ ] Integrate with Vitest setup file
- [ ] Use in React Query hook tests to avoid real API calls

**Validation:**
- React Query hooks tested without hitting real database
- Mock data returns match production API shapes

### 3.3 Playwright E2E Tests
**New files:** `playwright.config.ts`, `/tests/e2e/`

**Requirements:**
- [ ] Install: `@playwright/test`
- [ ] Configure base URL, test artifacts directory
- [ ] Create fixtures for each role (admin, instructor, student) with pre-seeded tokens
- [ ] Write smoke tests:
  - [ ] Login flow (all roles)
  - [ ] Course CRUD (instructor/admin)
  - [ ] Enroll/unenroll (student)
- [ ] Add `test:e2e` script
- [ ] Configure CI to run against test database

**Validation:**
- `yarn test:e2e` passes locally
- Trace/video artifacts saved on failure
- Tests run in headless mode in CI

---

## 4. Feature Migration ✅ Priority: MEDIUM

### 4.1 Complete Feature Modules
**New directories:** `/features/enrollments/`, `/features/admin/`, `/features/users/`

**Current state:** Only `auth` and `courses` modules exist  
**Goal:** Move all domain logic into feature modules

**Requirements per module:**
- [ ] `/features/enrollments/`
  - [ ] `api/use-enrollments.ts` (useEnroll, useUnenroll, useMyEnrollments)
  - [ ] `components/enrollment-list.tsx`
  - [ ] `index.ts` barrel export
  
- [ ] `/features/admin/`
  - [ ] `api/use-admin.ts` (useUsers, useUpdateRole, useDeleteUser)
  - [ ] `components/user-table.tsx`
  - [ ] `index.ts`
  
- [ ] `/features/users/`
  - [ ] `api/use-user.ts` (useUserProfile, useUpdateProfile)
  - [ ] `components/profile-form.tsx`
  - [ ] `index.ts`

**Validation:**
- Page files import from feature barrels: `import { useEnroll } from '@/features/enrollments'`
- No direct imports from `/lib/api/*` in page components
- Each feature has colocated query keys

### 4.2 Standardize React Query Patterns
**Files:** All `use-*.ts` hooks in `/features/*/api/`

**Requirements:**
- [ ] Add optimistic updates for `useEnroll`/`useUnenroll` mutations
- [ ] Wrap mutation-heavy pages with `<ErrorBoundary>`
- [ ] Add `enabled` option to queries that depend on user auth state
- [ ] Use `Suspense` boundaries for course lists (streaming pattern)
- [ ] Create centralized query key factory in `/lib/query/keys.ts`

**Validation:**
- UI updates instantly before server confirms (optimistic)
- Errors render fallback UI instead of crashing
- Query keys follow consistent pattern: `['feature', 'action', ...params]`

---

## 5. API Hardening ✅ Priority: MEDIUM

### 5.1 Normalize Error Responses
**Files:** All route handlers in `/app/api/`

**Current state:** Mixed error formats  
**Goal:** Consistent `ApiResponse<T>` structure

**Requirements:**
- [ ] Create `/lib/api/errors.ts` with:
  - [ ] `ApiError` class extending `Error` with `statusCode`, `code` properties
  - [ ] Helper: `handleApiError(error: unknown): NextResponse<ApiResponse>`
  - [ ] Error code enum: `AUTH_FAILED`, `VALIDATION_ERROR`, `NOT_FOUND`, etc.
- [ ] Wrap all route handlers with try/catch using `handleApiError`
- [ ] Log errors with request ID from middleware

**Validation:**
- All errors return `{ success: false, message: string, error: string, code?: string }`
- Status codes match error types (400 validation, 401 auth, 403 forbidden, 404 not found, 500 server)

### 5.2 Validation Coverage
**Files:** `/lib/validators/`, route handlers

**Requirements:**
- [ ] Audit routes for missing input validation
- [ ] Add schemas for: pagination params, sorting, filtering
- [ ] Validate all user inputs before database calls
- [ ] Return 400 with field-level errors from Zod

**Validation:**
- No route accepts unvalidated user input
- Zod errors return helpful messages

### 5.3 Request Observability
**Files:** `/app/middleware.ts`, route handlers

**Current state:** Request ID already added in middleware ✅  
**Goal:** Add timing and structured logging

**Requirements:**
- [ ] Add timing header: `x-response-time` in middleware
- [ ] Log: `[${requestId}] ${method} ${path} ${status} ${duration}ms`
- [ ] Use `console.info` for success, `console.error` for failures with stack traces

**Validation:**
- Server logs show request timing for debugging
- Request IDs linkable across client errors and server logs

---

## 6. Next.js 16 Alignment ✅ Priority: MEDIUM

### 6.1 Server Component Optimization
**Files:** Page components in `/app/`

**Requirements:**
- [ ] Audit pages: mark data-reading components as Server Components (remove `'use client'`)
- [ ] Move interactivity (forms, buttons) to leaf Client Components
- [ ] Fetch data directly in Server Components using `fetch` with `next: { revalidate }`
- [ ] Example: Course list page fetches in SC, passes to Client Component for filtering

**Validation:**
- Reduced client bundle size (check `yarn build` output)
- Initial HTML includes data (view page source)

### 6.2 Server Actions for Mutations
**Files:** `/app/actions/`, form components

**Current state:** Using API routes for mutations  
**Goal:** Prefer Server Actions where suitable

**Requirements:**
- [ ] Convert simple mutations (create course, enroll) to Server Actions with `'use server'`
- [ ] Use `revalidatePath` or `revalidateTag` instead of manual cache invalidation
- [ ] Keep complex mutations (multi-step, external API calls) as route handlers
- [ ] Use `useFormStatus` hook for pending states

**Validation:**
- Forms work without JavaScript (progressive enhancement)
- Cache updates automatically after mutations

### 6.3 Performance Tuning
**Files:** `next.config.ts`, image components, route segments

**Requirements:**
- [ ] Add `metadataBase` to `/app/layout.tsx` metadata (removes warning)
- [ ] Use `<Image>` component for all images with `priority` for above-fold
- [ ] Add `export const dynamic = 'force-static'` to static pages
- [ ] Add caching headers via `export const revalidate = 3600` where appropriate

**Validation:**
- Build warnings removed
- Lighthouse score >90 for performance
- Static pages prerendered at build time

---

## 7. Linting & DX ✅ Priority: LOW

### 7.1 ESLint Module Boundaries
**Files:** `eslint.config.mjs`

**Requirements:**
- [ ] Install: `eslint-plugin-import`
- [ ] Add rules:
  - [ ] `import/no-cycle` (detect circular deps)
  - [ ] Custom rule: features can't import from other features
  - [ ] Enforce `@/lib/*` vs `@/features/*` separation
- [ ] Add `@tanstack/eslint-plugin-query` for React Query best practices

**Validation:**
- Linter catches cross-feature imports
- Catches missing query keys

### 7.2 TypeScript Strictness
**Files:** `tsconfig.json`

**Requirements:**
- [ ] Enable: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [ ] Fix new type errors introduced
- [ ] Add `@ts-expect-error` only with justification comments

**Validation:**
- `yarn build` passes with stricter checks
- Fewer runtime null/undefined bugs

### 7.3 Pre-commit Hooks
**New files:** `.husky/pre-push`

**Requirements:**
- [ ] Install: `husky`, `lint-staged`
- [ ] Add pre-push hook: run `yarn lint && yarn test`
- [ ] Add lint-staged config for Prettier auto-format on staged files

**Validation:**
- Commits blocked if tests fail
- Code auto-formatted on commit

---

## 8. Database & Seeding ✅ Priority: LOW

### 8.1 Seed Scripts
**New files:** `/scripts/seed.ts`

**Requirements:**
- [ ] Create seed script using Knex
- [ ] Seed data:
  - [ ] 1 admin, 2 instructors, 5 students
  - [ ] 10 courses with varied statuses
  - [ ] 20 enrollments
- [ ] Add `db:seed` script
- [ ] Document in README

**Validation:**
- Fresh database seeded with test data
- E2E tests can run against seeded state

---

## Success Criteria
- [ ] All tests green (`yarn test` + `yarn test:e2e`)
- [ ] Build succeeds with zero TypeScript errors
- [ ] Coverage ≥80%
- [ ] No axios dependency
- [ ] Auth uses single token source (cookies OR bearer, not both)
- [ ] All features migrated to `/features/*`
- [ ] API errors consistent across all routes
- [ ] ESLint enforces module boundaries
- [ ] Pre-push hooks active
