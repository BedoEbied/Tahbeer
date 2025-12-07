# Phase 3 Implementation Checklist for Tahbeer LMS

## Overview
Phase 3 focuses on scaling, production readiness, advanced features, and operational excellence. Build on Phase 1 (React Query, RBAC, notifications) and Phase 2 (testing, fetch client, feature modules, API hardening).

---

## 1. Mobile App & Cross-Platform ✅ Priority: HIGH

### 1.1 React Native/Expo Migration Path
**Goal:** Share auth, types, and business logic with mobile app

**Requirements:**
- [ ] Extract shared code into `/packages/shared/`:
  - [ ] Types (move `/types/` here)
  - [ ] Auth logic (move `/lib/auth/server.ts`, JWT verification)
  - [ ] Validators (move Zod schemas)
  - [ ] Services (move `/lib/services/`)
  - [ ] Policies (move `/lib/authorization/policies.ts`)
- [ ] Monorepo setup: add `tsconfig.base.json`, configure path aliases for `@/shared`
- [ ] Scaffold `/apps/mobile` with Expo + React Native + React Query
- [ ] Share fetch client wrapper (adapt for React Native's fetch polyfill)
- [ ] Setup: Monorepo tooling (Turbo/Nx), shared CI/CD for build+test+deploy

**Validation:**
- Web and mobile import types from `@/shared`
- Authentication flow identical across platforms
- Shared validators prevent drift
- Monorepo build succeeds for both web and mobile

### 1.2 Push Notifications (APNS/Firebase)
**Files:** `/lib/notifications/`, `/app/api/notifications/`

**Requirements:**
- [ ] Set up Firebase Cloud Messaging (or APNS)
- [ ] Create `/lib/notifications/provider.ts` to abstract FCM/APNS
- [ ] API endpoint: `POST /api/notifications/subscribe` (register device token)
- [ ] Trigger notifications from:
  - [ ] Course enrollment confirmation
  - [ ] Course updates/announcements
  - [ ] Admin messages to users
- [ ] Store device tokens in database (new `device_tokens` table)
- [ ] Test with mock notification service in tests

**Validation:**
- Device tokens persist after app restart
- Notifications send to subscribed users
- E2E test can send mock notification

---

## 2. Advanced Authorization & Multi-Tenancy ✅ Priority: HIGH

### 2.1 Granular RBAC & Custom Roles
**Files:** `/lib/authorization/`, database migration

**Current state:** 3 hardcoded roles (admin, instructor, student)  
**Goal:** Dynamic, composable permissions system

**Requirements:**
- [ ] New database tables:
  - [ ] `roles` (id, name, description, created_at)
  - [ ] `permissions` (id, name, action, resource, created_at)
  - [ ] `role_permissions` (role_id, permission_id)
- [ ] Refactor `POLICIES` to load from DB instead of hardcoded
- [ ] Create admin UI: `/app/(dashboard)/admin/roles/` CRUD
- [ ] Support permission inheritance (instructor role includes all student permissions)
- [ ] Audit trail: log who assigned/changed permissions

**Validation:**
- Custom roles creatable via admin UI
- Permissions enforced on server and client
- Audit logs show permission history

### 2.2 Organization/Workspace Support
**Goal:** Scale to multi-tenant SaaS (future)

**Requirements:**
- [ ] Add `organization_id` to users, courses, enrollments
- [ ] Middleware check: user can only access resources in their org
- [ ] API routes scoped to org: `/api/orgs/:orgId/courses`
- [ ] Admin panel scoped to org
- [ ] Row-level security pattern (use organization context)

**Validation:**
- Users from different orgs can't access each other's data
- Queries automatically filtered by org context

---

## 3. Performance & Scalability ✅ Priority: MEDIUM

### 3.1 Database Optimization
**Files:** Database queries, migrations

**Requirements:**
- [ ] Add indexes:
  - [ ] `courses(instructor_id, status, created_at)`
  - [ ] `enrollments(user_id, course_id)`
  - [ ] `enrollments(course_id, user_id)`
- [ ] Query optimization:
  - [ ] Replace N+1 queries with JOINs in services
  - [ ] Add pagination limits (max 100 items per page)
  - [ ] Use database views for complex aggregations (e.g., course stats)
- [ ] Add query analyzer: log slow queries (>100ms) with stack traces
- [ ] Consider connection pooling (PgBouncer if using PostgreSQL)

**Validation:**
- Indexes present in migration files
- Slow query logging active
- API response times <200ms for typical requests

### 3.2 Caching Strategy (Redis)
**Goal:** Reduce database load and improve response times

**Requirements:**
- [ ] Evaluate: Redis as session store + cache layer (optional, can defer if app is small)
- [ ] If implemented:
  - [ ] Cache course lists (10 min TTL)
  - [ ] Cache user profiles (5 min TTL)
  - [ ] Cache RBAC policies (recompute on role change)
  - [ ] Use React Query's `staleTime` + Redis for optimal hit rates
- [ ] Add cache invalidation on mutations
- [ ] Monitor cache hit ratio

**Validation:**
- Redis connects and stores cache
- Queries skip database when cache hits
- Hit rate >60% for course lists

### 3.3 CDN & Static Asset Delivery
**Files:** `next.config.ts`, deployment config

**Requirements:**
- [ ] Configure Next.js Image Optimization for CDN
- [ ] Add static asset caching headers (Cache-Control: max-age=31536000 for /public)
- [ ] Deploy images to CDN (Vercel, Cloudflare, S3)
- [ ] Add image compression & WebP format support

**Validation:**
- Images serve from CDN (check DevTools Network)
- Lighthouse CLS/LCP scores improve

---

## 4. Advanced Features ✅ Priority: MEDIUM

### 4.1 Search & Filtering
**Files:** `/features/courses/`, `/app/api/courses/search`

**Requirements:**
- [ ] Add full-text search endpoint: `GET /api/courses/search?q=python`
- [ ] Filters:
  - [ ] By instructor, category, price range, rating
  - [ ] Pagination with cursor-based pagination for large datasets
- [ ] Frontend:
  - [ ] Search box in course list with debounce
  - [ ] Filter sidebar with checkboxes
  - [ ] Show result count
- [ ] Optional: Add Elasticsearch/MeiliSearch for advanced search (defer if not needed)

**Validation:**
- Search returns relevant courses
- Filters combine correctly
- Response <500ms for 10k courses

### 4.2 Ratings & Reviews
**Files:** `/features/reviews/`, migrations

**Requirements:**
- [ ] New table: `reviews` (id, user_id, course_id, rating, comment, created_at)
- [ ] RBAC: only enrolled students can review, instructors can't review own courses
- [ ] API:
  - [ ] `POST /api/courses/:id/reviews` (create)
  - [ ] `GET /api/courses/:id/reviews` (list)
  - [ ] `PUT /api/reviews/:id` (update)
  - [ ] `DELETE /api/reviews/:id` (delete)
- [ ] Course stats: avg rating, review count (denormalized in courses table)
- [ ] UI: star rating component, review list in course detail

**Validation:**
- Reviews persist and display
- Average rating updates on new review
- Instructor can't rate own course

### 4.3 Instructor Analytics Dashboard
**Files:** `/features/analytics/`, `/app/(dashboard)/instructor/analytics`

**Requirements:**
- [ ] Metrics per course:
  - [ ] Total enrollments, active students, completion rate
  - [ ] Revenue (if courses are paid)
  - [ ] Student feedback (avg rating, recent reviews)
  - [ ] Engagement (avg time on course, quiz scores)
- [ ] Charts: enrollment trends, revenue over time, student cohort analysis
- [ ] Export: CSV reports for instructors
- [ ] API: aggregate data efficiently (avoid per-student queries)

**Validation:**
- Instructor dashboard loads in <1s
- Metrics accurate and update real-time
- Charts render smoothly with 1000+ data points

---

## 5. Email & Communication ✅ Priority: MEDIUM

### 5.1 Email Notifications
**Files:** `/lib/email/`, `/lib/services/emailService.ts`

**Requirements:**
- [ ] Email provider integration (SendGrid, Resend, Mailgun)
- [ ] Email templates (using mjml or react-email):
  - [ ] Welcome email (on registration)
  - [ ] Course enrollment confirmation
  - [ ] Course announcement
  - [ ] Password reset
  - [ ] Admin digest (daily stats)
- [ ] Email queue: store pending emails, retry on failure
- [ ] User preferences: email opt-in/out per notification type
- [ ] Test: mock email service for tests

**Validation:**
- Transactional emails deliver <1min
- Email preferences respected (no spam)
- E2E test mocks email sending

### 5.2 In-App Messaging
**Goal:** Real-time announcements, instructor messages

**Requirements:**
- [ ] WebSocket/SSE setup (or polling fallback)
- [ ] Broadcast instructor announcement to enrolled students
- [ ] Direct messaging between instructor and student (optional, Phase 4)
- [ ] Mark messages as read/unread

**Validation:**
- Announcement appears instantly on student dashboard
- Unread count updates

---

## 6. Payment Integration ✅ Priority: MEDIUM-LOW

### 6.1 Stripe Integration
**Goal:** Enable paid courses

**Requirements:**
- [ ] Add `price` column to courses (nullable, null = free)
- [ ] Stripe setup:
  - [ ] Create products and prices in Stripe
  - [ ] Implement checkout flow via Stripe Checkout or Payment Element
- [ ] API endpoints:
  - [ ] `POST /api/student/checkout` (create checkout session)
  - [ ] `POST /api/webhooks/stripe` (handle payment events)
- [ ] Database:
  - [ ] `payments` table (user_id, course_id, amount, stripe_id, status)
  - [ ] Only allow enrollment after successful payment
- [ ] UI:
  - [ ] Show price on course cards
  - [ ] "Enroll" button triggers checkout for paid courses
  - [ ] Payment success/failure pages

**Validation:**
- Checkout flow works end-to-end
- Webhook handles success/failure
- Enrollment only after payment confirmed

---

## 7. DevOps & Deployment ✅ Priority: MEDIUM

### 7.1 CI/CD Pipeline Enhancement
**Files:** `.github/workflows/`, Docker config

**Requirements:**
- [ ] GitHub Actions:
  - [ ] Lint + test on every PR
  - [ ] Build + push Docker image on main
  - [ ] Deploy to staging on PR merge
  - [ ] Deploy to production on release tag
- [ ] Docker:
  - [ ] Multi-stage build for lean images
  - [ ] Health check endpoint: `GET /api/health`
  - [ ] Graceful shutdown handling
- [ ] Database migrations: auto-run on deploy
- [ ] Secrets management: use GitHub Secrets for sensitive env vars

**Validation:**
- PR blocks merge if tests fail
- Merged PRs auto-deploy to staging
- Production deploys are one-click from release tag

### 7.2 Monitoring & Logging
**Files:** `/lib/logger/`, `/app/api/health/`

**Requirements:**
- [ ] Structured logging (JSON format with requestId)
- [ ] Log aggregation service (Datadog, Sentry, LogRocket)
- [ ] Error tracking: Sentry for client and server errors
- [ ] Performance monitoring: track API latency, database query times
- [ ] Uptime monitoring: external health check pings
- [ ] Alerts: slack/email on critical errors

**Validation:**
- Errors logged with stack traces and context
- Dashboards show error rate, latency, throughput
- Alerts trigger on anomalies

### 7.3 Database Backups & Disaster Recovery
**Requirements:**
- [ ] Automated daily backups (cloud provider or tool like Backblaze)
- [ ] Test restore procedure weekly
- [ ] Document recovery runbook (RTO/RPO targets)
- [ ] Consider read replicas for high availability (defer if not needed)

**Validation:**
- Backup job completes daily
- Restore test passes monthly

---

## 8. Security Hardening ✅ Priority: MEDIUM

### 8.1 Input Validation & Sanitization
**Current state:** Zod validation in place  
**Goal:** Defense in depth

**Requirements:**
- [ ] Sanitize HTML in user inputs (course descriptions, reviews)
- [ ] Rate limiting on auth endpoints (already in middleware)
- [ ] Request size limits (body size, multipart file size)
- [ ] SQL injection: Knex parameterized queries (already done)
- [ ] XSS protection: CSP headers, no `dangerouslySetInnerHTML`
- [ ] CORS: restrict to known origins only

**Validation:**
- XSS payloads in user input are escaped/sanitized
- Oversized uploads rejected
- CSP headers present in responses

### 8.2 Secrets & Environment Management
**Files:** `.env.example`, deployment docs

**Requirements:**
- [ ] Never commit real secrets (use `dotenv` for local, GitHub Secrets for CI/CD)
- [ ] Rotate API keys regularly
- [ ] Use managed secrets service (AWS Secrets Manager, HashiCorp Vault)
- [ ] Document which env vars are required for each environment

**Validation:**
- `.env` is in `.gitignore`
- No secrets in git history
- CI/CD uses injected secrets, not checked-in values

### 8.3 Dependency Scanning
**Requirements:**
- [ ] Add GitHub Dependabot or Snyk for vulnerability scanning
- [ ] Audit dependencies weekly: `npm audit`
- [ ] Pin major versions in package.json to avoid breaking changes
- [ ] Update dependencies monthly (security patches immediately)

**Validation:**
- No high-severity vulnerabilities reported
- Dependabot PRs auto-created and tested

---

## 9. Documentation & Knowledge Base ✅ Priority: LOW

### 9.1 API Documentation
**Files:** `/docs/api.md` or Swagger/OpenAPI

**Requirements:**
- [ ] Document all endpoints:
  - [ ] URL, method, auth requirement
  - [ ] Request/response examples (actual cURL + JSON)
  - [ ] Error codes and meanings
  - [ ] Rate limits, pagination
- [ ] Use OpenAPI/Swagger for auto-generated docs
- [ ] Host at `/api/docs` (Swagger UI)

**Validation:**
- Every route documented with examples
- API docs auto-generated from OpenAPI spec

### 9.2 Architecture Decision Records (ADRs)
**Files:** `/docs/adr/`

**Requirements:**
- [ ] Document major decisions: auth approach, token storage, RBAC system, caching strategy
- [ ] Format: title, context, decision, consequences, alternatives considered
- [ ] Review process for ADRs in PRs

**Validation:**
- New architecture decisions documented in ADRs before implementation
- Team aligns on decisions

### 9.3 Runbooks
**Files:** `/docs/runbooks/`

**Requirements:**
- [ ] "Database migration failed" runbook
- [ ] "API is down" troubleshooting guide
- [ ] "Student can't enroll" debugging steps
- [ ] "How to reset a user's password" (admin)

**Validation:**
- Runbooks followed successfully by team
- Incidents resolved faster with runbook guidance

---

## 10. Analytics & Growth ✅ Priority: LOW

### 10.1 User Analytics
**Goal:** Understand user behavior, growth metrics

**Requirements:**
- [ ] Segment users: instructor, student, admin
- [ ] Cohort analysis: retention by signup date
- [ ] Funnel analysis: signup → first course enrollment → course completion
- [ ] Session tracking: time on site, pages visited
- [ ] Tool: Mixpanel, Amplitude, or PostHog

**Validation:**
- Dashboard shows DAU, MAU, growth rate
- Retention curves visible for cohorts

### 10.2 Course Analytics
**Requirements:**
- [ ] Most popular courses, trending topics
- [ ] Completion rates and drop-off points
- [ ] Student feedback sentiment analysis
- [ ] Recommendations: content gaps, popular topics instructors should add

**Validation:**
- Instructor sees course performance metrics
- Admin sees platform-wide trends

---

## Success Criteria
- [ ] Mobile app (Expo) bootstrapped and shares code with web
- [ ] Push notifications working on both platforms
- [ ] Granular RBAC system deployed (dynamic roles)
- [ ] Organization/workspace support enables multi-tenancy
- [ ] Database indexes added, slow queries eliminated (<200ms API response)
- [ ] Redis cache reduces DB load by 40%+
- [ ] Full-text search, ratings, instructor analytics live
- [ ] Email and payment (Stripe) integrated
- [ ] CI/CD pipeline auto-deploys and auto-tests
- [ ] Monitoring & logging dashboard active
- [ ] Security audit passed (no high vulnerabilities)
- [ ] API docs complete and hosted
- [ ] Runbooks and ADRs in place
- [ ] User analytics dashboard shows growth metrics

---

## Timeline Estimate
- Weeks 1-2: Mobile setup, shared packages, push notifications
- Weeks 3-4: Advanced RBAC, org/workspace, database optimization
- Weeks 5-6: Search, ratings, instructor analytics
- Weeks 7-8: Email, Stripe, payment flow
- Weeks 9-10: DevOps (CI/CD, monitoring, backups)
- Weeks 11-12: Security hardening, dependency scanning
- Weeks 13+: Documentation, analytics, growth features

*Adjust based on team capacity and business priorities.*
