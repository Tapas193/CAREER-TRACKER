# CAREER TRACK — COMPLETE PROJECT CONTEXT

> **Purpose of this document:** A complete technical handoff/context file for the entire Career
> Track project. It is intentionally exhaustive so that any AI coding assistant (GPT, Claude,
> Gemini, OpenCode, Cursor, etc.) or human developer can understand the architecture, business
> rules, and constraints before safely modifying the code.
>
> **Authority of source:** This document was generated from the **actual repository** (files,
> directory tree, Prisma schema, migrations, routes/controllers/services/repositories,
> package.json files, env examples, README, IMPORTANT.md, docs/DEPLOYMENT.md, and Vercel
> config). Where a feature does not exist it is explicitly marked **"Not currently
> implemented"** rather than assumed.
>
> **Secrets:** No real credentials are included. All environment variables are shown with
> placeholder values only.

---

## 1. Project Overview

- **Project name:** Career Track
- **What it is:** A role-based, full-stack college management / ERP web application that tracks a
  student's complete career lifecycle within an institution.
- **What problem it solves:** It gives admins, placement officers, students, and alumni a single
  system to manage the whole journey — academics, skills, certifications, projects, internships,
  placement preparation, placement drives, interview rounds, feedback, offer letters,
  graduation, and post-graduation alumni career history and feedback.
- **Target users (4 experiences):**
  - **Admin** — institution-wide student lifecycle management.
  - **Placement Head** — placement drives, rounds, results, feedback, and offers.
  - **Student** — owns their academic, skill, certification, project, internship, and placement records.
  - **Alumni** — post-graduation career history and feedback (same account as a student, driven by `currentStatus = ALUMNI`).

- **Overall student career lifecycle:**
  ```
  Admission
    → Student (active)
    → Academic tracking (semesters, SGPA/CGPA, backlogs)
    → Skills
    → Certifications
    → Projects
    → Internships
    → Placement preparation (resources library)
    → Placement (application / drive)
    → Placement rounds
    → Round feedback
    → Offer letter
    → Graduation
    → Alumni
    → Career history
    → Alumni feedback
  ```

- **Important — Alumni is a lifecycle/status transition, not a separate login role.**
  There are exactly **three** auth roles (`ADMIN`, `STUDENT`, `PLACEMENT_HEAD`). An Alumni
  account is `role = STUDENT` with `Student.currentStatus = ALUMNI` (which also implies
  `graduationStatus = GRADUATED`). The frontend routes alumni to `/alumni/*` and adjusts what
  they can edit.

- **Main objective:** Provide a production-grade, secure, server-side-authoritative platform
  that tracks every student from admission through active study, placement, and beyond into
  their alumni career.

- **Major modules:**
  - Authentication (JWT via HTTP-only cookie) + optional university SSO (OIDC)
  - Admin: students, users, courses, skills, placements, reports, preparation resources
  - Placement Head: drives, rounds, results, feedback, offers
  - Student: own profile, academics, backlogs, skill development, certifications, projects,
    internships, placements, documents, placement preparation, intelligence tools (readiness,
    roadmap, resume analyzer, companies, analytics, at-risk, mentors, mock interviews, skill
    gap, career XP, alumni network, internship hub, learning)
  - Alumni: read-only academic history + editable career history + alumni feedback
  - Role-based analytics dashboards (Recharts)

---

## 2. Technology Stack

Only technologies actually present in `package.json` / config are listed.

### Frontend (`frontend/package.json`)
| Concern | Technology |
|---------|-----------|
| Framework | React 18.3 (SPA) |
| Language | TypeScript 5.7 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3.4 (shadcn-style CSS-variable theme via `tailwind.config.js`) + `tailwind-merge`/`clsx` (`cn()`) |
| UI library | Custom shadcn-style components in `src/components/ui.tsx` (Button, Card, DataTable, Modal, Toast, Badge, etc.) + `src/components/intelligence.tsx` |
| Routing | React Router 6 (`react-router-dom`) |
| State / data fetching | TanStack Query 5 (`@tanstack/react-query`) via `useApi` hook |
| Forms | React Hook Form 7 (`react-hook-form`) — present in deps; many pages also use uncontrolled `form` state + `api.post/patch` |
| Validation | Zod 3 |
| Charts | Recharts 2 |
| Icons | Lucide React |

### Backend (`backend/package.json`)
| Concern | Technology |
|---------|-----------|
| Runtime | Node.js (dev-run via `tsx`; Express server) |
| Framework | Express 4 |
| Language | TypeScript 5.7 |
| ORM | Prisma 5.22 / `@prisma/client` |
| Validation | Zod 3 |
| Authentication | JWT (`jsonwebtoken`) in HTTP-only cookie |
| Password hashing | `bcryptjs` (SALT_ROUNDS = 10) |
| Storage | Multer (memory) + `StorageService` abstraction (local-disk impl) |
| Dev runner | `tsx` |
| Serverless adapter | `@vercel/node` (`backend/api/index.ts`) |

### Database
| Concern | Technology |
|---------|-----------|
| Database | PostgreSQL (managed via Prisma migrations) |
| ORM | Prisma 5.22 |
| Migration system | Prisma Migrate (`prisma migrate dev` / `deploy`) |

### Deployment
| Host | Notes |
|------|-------|
| Frontend hosting | Vercel (root directory `frontend`) |
| Backend hosting | Vercel (root directory `backend`, via `@vercel/node` + `backend/vercel.json`) |
| Database hosting | Neon (managed PostgreSQL; pooled connection string recommended) — see `docs/DEPLOYMENT.md` |

---

## 3. Repository Structure

```
CAREER-TRACKER/
├── .env.example                 # root env template (backend vars)
├── .gitignore
├── README.md                    # current project README (frontend described as built)
├── IMPORTANT.md                 # legacy design-decisions doc (partially outdated — see below)
├── docs/
│   └── DEPLOYMENT.md            # Vercel + Neon deployment guide
├── .vercel/                     # Vercel project link metadata (gitignored, not for sharing)
│
├── frontend/                    # Vite + React + TS SPA
│   ├── index.html
│   ├── vite.config.ts           # port 5179, dev proxy /api + /uploads → :4000
│   ├── tailwind.config.js       # shadcn HSL color tokens
│   ├── postcss.config.js
│   ├── vercel.json              # SPA fallback rewrite → /index.html
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── main.tsx             # ReactDOM root; QueryClient + BrowserRouter + AuthProvider
│       ├── App.tsx              # ALL routes + RoleGate (role-aware guard)
│       ├── index.css            # Tailwind + CSS-variable theme + .field-input/.field-label/.app-shell
│       ├── api/
│       │   └── client.ts        # fetch wrapper (cookie auth), api.get/post/patch/delete, authApi, ssoApi
│       ├── components/
│       │   ├── ui.tsx           # all reusable UI primitives
│       │   └── intelligence.tsx # ScoreRing, ScoreBar, LocalNote (intelligence widgets)
│       ├── hooks/
│       │   ├── useAuth.tsx      # AuthProvider + useAuth (context, login/logout/me)
│       │   └── useApi.ts        # useApi (query) + useApiMutation (mutation + invalidation)
│       ├── layouts/
│       │   └── AppLayout.tsx    # sidebar nav (NAV per panel), breadcrumbs (CRUMBS), header
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── admin/           # AdminDashboard, AdminStudents, AdminStudentDetail, AdminUsers,
│       │   │                    #   AdminCourses, AdminSkills, AdminPlacements, AdminReports,
│       │   │                    #   AdminPreparationResources
│       │   ├── placement/       # PlacementDashboard, PlacementDrives, PlacementDriveDetail,
│       │   │                    #   PlacementPipeline, PlacementStudentProfile, PlacementReports,
│       │   │                    #   PlacementList
│       │   ├── student/         # 40+ pages (see §14)
│       │   └── alumni/          # AlumniDashboard, AlumniProfile, AlumniCareer, AlumniFeedback
│       ├── types/
│       │   └── index.ts         # shared TS types (mirrors backend model shapes)
│       └── utils/
│           ├── cn.ts            # cn() (class merge), formatDate, formatLpa, asArray
│           ├── status.ts        # statusTone/statusLabel/BadgeTone
│           ├── career.ts
│           └── intelligence/    # readiness, roadmap, resume, skillGap, mockInterview, risk,
│                                #   xp, companies, learning, roles, storage (local JSON knowledge base)
│
├── backend/                     # Express + TS + Prisma API
│   ├── api/
│   │   └── index.ts             # Vercel serverless entry (exports createApp())
│   ├── vercel.json              # backend Vercel config (prisma generate → build → strip)
│   ├── scripts/
│   │   └── prisma-vercel-strip.mjs  # (build-time Prisma/Vercel fix)
│   ├── uploads/                 # local storage dir (gitignored)
│   ├── tsconfig.json
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma        # schema (17 tables + enums)
│   │   ├── seed.ts              # idempotent (destructive) seed
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       ├── 20260830133306_init/          # initial schema (16 tables)
│   │       └── 20260904041708_add_preparation_resource/  # adds PreparationResource
│   └── src/
│       ├── index.ts             # dev server entry
│       ├── app.ts               # createApp() — mounts all /api routes + error handling
│       ├── config/
│       │   ├── index.ts         # central config (env → config object)
│       │   └── prisma.ts        # shared PrismaClient instance
│       ├── middleware/          # auth, rbac, scope, graduationLock, validate, upload, error
│       ├── controllers/         # 17 controllers
│       ├── services/            # 18 services incl. storage/
│       ├── repositories/        # 13 repositories (Prisma queries)
│       ├── routes/              # 21 route files
│       ├── validators/          # 17 Zod schema files incl. common.ts
│       ├── utils/               # http.ts (envelope), jwt.ts, password.ts, cookies.ts
│       └── types/               # index.ts (AuthUser + Express Request augmentation)
```

### Notable insight about existing docs
- **`README.md`** reflects the **current** state (frontend fully built; all four experiences).
- **`IMPORTANT.md`** is **outdated**: its header still says *"FRONTEND NOT YET BUILT"* and
  references 16 tables, but the frontend now exists and the DB has **17** tables (the
  `Preparation_resource` table was added later). Its **design decisions (§7, §9), authorization
  model, and DB setup notes remain authoritative** for the parts they describe. Prefer the
  actual code + `README.md` over `IMPORTANT.md` for current inventory.

---

## 4. Frontend Architecture

- **Entry point:** `frontend/src/main.tsx` — creates `QueryClient` (retry:1,
  refetchOnWindowFocus:false), wraps `<App>` in `QueryClientProvider` → `BrowserRouter` →
  `AuthProvider`.
- **Routing:** `frontend/src/App.tsx` — a single `<Routes>` tree with lazy-loaded pages. Every
  page is wrapped in `<RoleGate panel=...>` which enforces the role/lifecycle before rendering.
  `ProtectedLayout` wraps all authenticated routes inside `AppLayout`.
- **Authentication state:** `useAuth` context (`hooks/useAuth.tsx`). On mount calls
  `authApi.me()`; listens to the `auth:unauthorized` window event to clear the user; exposes
  `login`, `logout`, `user`, `loading`.
- **API client:** `api/client.ts`. `fetch` with `credentials: 'include'`; unwraps `body.data`;
  on 401 dispatches `auth:unauthorized`; friendly error messages; `BASE` resolved from
  `VITE_API_URL` (dev → empty → Vite proxy; prod → backend origin).
- **Protected routes:** handled by `RoleGate` + `ProtectedLayout` in `App.tsx`.
- **Role-based routing:** `RoleGate` checks `user.role` — `ADMIN` for `/admin/*`,
  `PLACEMENT_HEAD` for `/placement/*`, `STUDENT` for `/student/*` (redirects alumni to
  `/alumni`), and `/alumni/*` only for students with `currentStatus === 'ALUMNI'` (redirects
  non-alumni to `/student`). `homeFor(u)` maps a user to their default home route.

### Important frontend files

| File/Folder | Purpose |
|-------------|---------|
| `src/main.tsx` | App bootstrap (QueryClient, Router, AuthProvider) |
| `src/App.tsx` | All routes, lazy imports, `RoleGate`/`ProtectedLayout` role guards, `homeFor` |
| `src/hooks/useAuth.tsx` | Auth context — login/logout/me, unauthorized handling |
| `src/hooks/useApi.ts` | `useApi` (TanStack Query) + `useApiMutation` |
| `src/api/client.ts` | HTTP client with cookie auth + `authApi`/`ssoApi` |
| `src/layouts/AppLayout.tsx` | Role-aware sidebar (`NAV`), breadcrumbs (`CRUMBS`), header, avatar |
| `src/components/ui.tsx` | Reusable UI: Button, Card, DataTable, Modal, ConfirmDialog, Toast, Badge, ActionMenu, Tabs, FormField, FilterBar, PageHeader, StatCard, etc. |
| `src/components/intelligence.tsx` | `ScoreRing`, `ScoreBar`, `LocalNote` widgets |
| `src/types/index.ts` | Shared TS interfaces (mirrors Prisma shapes) |
| `src/utils/cn.ts`, `status.ts`, `career.ts` | Helpers (`cn`, `asArray`, `formatDate`, `formatLpa`, status tone/label) |
| `src/utils/intelligence/*` | Client-side "intelligence" knowledge base (readiness, roadmap, resume, skillGap, mockInterview, risk, xp, companies, learning, roles, storage) |
| `src/pages/student/*` | Student panel pages (see §14) |
| `src/pages/admin/*` | Admin panel pages (see §13) |
| `src/pages/placement/*` | Placement Head pages (see §15) |
| `src/pages/alumni/*` | Alumni pages (see §16) |

---

## 5. Backend Architecture

### Request flow
```
Frontend (React)
  → HTTP (fetch, cookie auth)
  → API Route (backend/src/routes/*)      [middleware: authenticate, requireRole, scope, validate, graduationLock]
    → Controller (backend/src/controllers/*)  [HTTP concerns, ownership scoping]
      → Service (backend/src/services/*)      [business logic, throws AppError]
        → Repository (backend/src/repositories/*)  [Prisma queries]
          → Prisma (schema model)
            → PostgreSQL
```

### Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Route | `src/routes/*` | Declares endpoints, composes middleware + validator + controller. **No business logic.** |
| Middleware | `src/middleware/*` | `authenticate`, `requireRole`, `ensureStudentScope`, `requireWritableStudent`, `validate`, `upload`, `error`/`notFound` |
| Controller | `src/controllers/*` | Parses request, derives `ownerStudentId` from `req.user`, calls service, returns `success(res, data, msg, status)` |
| Service | `src/services/*` | Business rules, ownership checks, throws `AppError` (404/403/400) |
| Repository | `src/repositories/*` | Thin Prisma CRUD/query functions |
| Validator | `src/validators/*` | Zod schemas; `common.ts` has shared date/number validators |
| Config | `src/config/*` | `config/index.ts` (env) + `prisma.ts` (PrismaClient) |
| Utils | `src/utils/*` | `http.ts` (envelope `success`/`failure`/`AppError`/`asyncHandler`), `jwt.ts`, `password.ts`, `cookies.ts` |
| Entry | `src/index.ts`, `app.ts` | Server bootstrap + route mounting + error handlers |

- **Consistent response envelope:**
  - Success: `{ success: true, data, message }`
  - Error: `{ success: false, message, errors? }` — never leaks stack traces in production (`error.ts`).
- **Ownership scoping:** controllers derive `ownerStudentId` from `req.user.role === ADMIN ? (<query studentId> | undefined) : req.user.studentId`. Non-admin users are always forced to their own rows.
- **Configuration:** `src/config/index.ts` reads env into a `config` object (port, nodeEnv, jwt, cors/frontendUrl, cookieSecure, storage, SSO). Defaults are safe for dev.

---

## 6. Authentication

**Mechanism (as implemented):**
- **Login:** `POST /api/auth/login` (`authController.login`) → validates credentials (Zod `loginSchema`), `authService.login` verifies the bcrypt password for the matching `User`, signs a JWT (`signToken` in `utils/jwt.ts`) with the `AuthUser` payload, sets it as an **HTTP-only cookie** named `token` (`authCookieOptions()` in `utils/cookies.ts`), and returns `{ user }` (never the password/hash/token in the body).
- **Logout:** `POST /api/auth/logout` → `res.clearCookie('token', ...)`.
- **Current user:** `GET /api/auth/me` (requires `authenticate`) → returns the JWT `AuthUser`; for `STUDENT` roles it also enriches `currentStatus`/`graduationStatus` from `studentRepo.getLifecycleStatus`.
- **JWT:** signed with `config.jwtSecret`, expires after `JWT_EXPIRES_IN` (default `7d`). Verified in `authenticate` middleware; invalid/expired → 401.
- **Cookie config:** `authCookieOptions()` → `httpOnly: true`, `secure: config.cookieSecure`, `sameSite: production ? 'none' : 'lax'`, `maxAge` 7 days, `path: '/'`. (The comment notes the deployed split-origin requires `SameSite=None` + `Secure`; local is same-origin via the Vite proxy with `Lax`.)
- **Credential handling:** passwords hashed with `bcryptjs` (`hashPassword`, SALT_ROUNDS 10; `comparePassword`).
- **Authentication middleware:** `src/middleware/auth.ts` reads the token from `req.cookies.token` or `Authorization: Bearer <token>`, verifies it, and sets `req.user`. Must run before any route needing auth.
- **Protected endpoints:** every route other than login/health calls `authenticate` first. `login`/`logout` do not require it.
- **Session behavior:** stateless JWT; frontend keeps no token — `useAuth` re-fetches `/me` on mount. On any 401 the client dispatches `auth:unauthorized` and the frontend clears the user.

### Login flow (as implemented)
```
User → /api/auth/login
  → validate email/password (Zod)
  → find User by email
  → comparePassword (bcrypt)
  → sign JWT (AuthUser payload)
  → res.cookie('token', jwt, { httpOnly, ... })
  → frontend: login() then refreshMe() → GET /api/auth/me
  → AuthProvider.setUser(me)
  → RoleGate renders role-based dashboard
```

---

## 7. Authorization / RBAC

**Roles (from the `Role` enum):** `ADMIN`, `STUDENT`, `PLACEMENT_HEAD`.

**Alumni:** not a role — it is `role = STUDENT` + `Student.currentStatus = ALUMNI`.

**Middleware:**
- `authenticate` — verifies JWT, populates `req.user` (auth required).
- `requireRole(...roles)` (`rbac.ts`) — 403 if `req.user.role` not in the list.
- `ensureStudentScope` (`scope.ts`) — non-admin must match `req.params.id` to their own `studentId`.
- `requireWritableStudent` (`graduationLock.ts`) — admin bypasses; non-admin whose student is `GRADUATED`/`ALUMNI` (or not ACTIVE) is blocked (403) from writing pre-graduation entities.
- `validate(schema, source)` — Zod validation on body/params/query; attaches `req.validated`; 400 on failure.

**Ownership rules:** For student-scoped features (academic records, backlogs, skills, certifications, projects, internships, placements), the controller/service force `ownerStudentId` from `req.user.studentId` unless the user is ADMIN. Students cannot write `PlacementRound.result`, `Round_feedback`, or `Offer_letter` (403); those are ADMIN/Placement-Head only.

**Graduation lock:** Once GRADUATED/ALUMNI, a student loses write access to academics, backlogs, skills, certifications, projects, internships, placements. They may still freely create/edit `Career_history` and `Alumini_feedback` (those routes are not graduation-locked).

### Permission matrix (actual implementation)

| Feature / Action | Admin | Student (active) | Placement Head | Alumni |
|------------------|-------|------------------|----------------|--------|
| Login / view own data | ✅ | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Manage courses, skills master | ✅ (CRUD) / ✅ | Read | Read | Read |
| Create/update students, graduate, mark-alumni | ✅ | ❌ | List only | ❌ |
| Student-scoped writes (academics, backlogs, skills, certs, projects, internships) | ✅ (bypass lock) | ✅ (own, while active) | ❌ | ❌ (graduation lock) |
| Read own student-scoped data | ✅ (any) | ✅ (own) | ✅ (list) | ✅ (read-only) |
| Create placement drive (create-many placements) | ✅ | ❌ | ✅ | ❌ |
| Apply/create own placement | ✅ | ✅ (own, active) | ✅ | ❌ |
| Write placement round result / remark | ✅ | ❌ | ✅ | ❌ |
| Write round feedback | ✅ | ❌ | ✅ | ❌ |
| Upload/write offer letter | ✅ | ❌ | ✅ | ❌ |
| View placements/rounds/offers | ✅ (any) | ✅ (own) | ✅ | ✅ (own, read-only) |
| Career history (post-grad) write | ✅ | ❌ (pre-grad) | ❌ | ✅ |
| Alumni feedback write | ✅ | ❌ | ❌ | ✅ |
| Manage preparation resources (view only for non-admin) | ✅ CRUD | Read | Read | Read |
| Dashboard/analytics | ✅ (institution) | ✅ (own) | ✅ (institution) | ✅ (own) |

---

## 8. Student Lifecycle

**Statuses (from `StudentStatus` enum and `Student.currentStatus`):**
- **ADMITTED** — newly admitted; writes allowed (subject to graduation lock).
- **ACTIVE** — normal active student; full write access to own records.
- **ON_PLACEMENT** — actively in the placement phase.
- **GRADUATED** — graduated; **graduation lock** makes pre-graduation records read-only.
- **ALUMNI** — graduated and transitioned to alumni.

**Related fields:** `GraduationStatus` (`IN_PROGRESS` | `GRADUATED`). A `GRADUATED`/`ALUMNI`
student has `graduationStatus = GRADUATED`.

**What changes when a student graduates (Admin action):**
- Writes to pre-graduation entities become blocked (403) via `requireWritableStudent`.
- The student is redirected to the `/alumni` experience in the frontend.
- They keep read access to their academic/career history and can edit `Career_history`
  (post-graduation jobs) and `Alumini_feedback`.

**Restrictions for graduated/alumni students** (enforced server-side in
`middleware/graduationLock.ts`): cannot modify academics, backlogs, skills, certifications,
projects, internships, placements. Admins bypass the lock for corrections.

**Graduation trigger:** Only via the Admin `POST /api/students/:id/graduate` action
(blocked if there are unresolved backlogs or no academic record, with an admin
confirmation-override). `mark-alumni` only allowed for graduated students.

---

## 9. Database

**Schema file:** `backend/prisma/schema.prisma`. Currently **17 models** + enums. PostgreSQL, `prisma-client-js`, preview feature `omitApi`.

**Enums:** `Role` (ADMIN/STUDENT/PLACEMENT_HEAD), `AccountStatus`,
`StudentStatus` (ADMITTED/ACTIVE/ON_PLACEMENT/GRADUATED/ALUMNI), `GraduationStatus`,
`ResultStatus` (PASS/FAIL), `PlacementStatus`, `RoundType`, `RoundResult`,
`PreparationResourceType`, `PreparationDifficulty`.

**Business models** (each has a surrogate `id Int @id @default(autoincrement())` primary key unless noted):

| Model | Purpose | Important fields | FKs | Relationships / delete behavior |
|-------|---------|------------------|-----|---------------------------------|
| `User` | Login account | email (unique), passwordHash, role, accountStatus | `studentId → Student` (unique, Restrict) | 1:1 optional to Student |
| `Course` | Reference data | courseCode (unique), courseName, department, degree | — | 1→N Students |
| `Student` | Central person record | enrollmentNo/rollNumber/admissionNo (unique), currentSemester, currentStatus, graduationStatus | `courseId → Course` (Restrict) | 1→N owned tables |
| `AcademicRecord` | Per-semester marks | semester, academicYear, sgpa/cgpa (Decimal 4,2), creditsEarned, totalCredits, resultStatus | `studentId → Student` (Restrict) | owned by Student |
| `Backlog` | Unresolved/cleared failed subjects | attemptedNo, semester, subject, status, clearedDate, attemptedAgain | `studentId → Student` (Restrict) | owned by Student |
| `Skill` | Skill master | skillName (unique), category | — | N↔M with Student via StudentSkill |
| `StudentSkill` | Junction (composite PK `[studentId, skillId]`) | — | `studentId → Student` (**Cascade**), `skillId → Skill` (Restrict) | the only cascade-delete junction |
| `Certification` | Student certifications | certificationName, issuingOrganisation, issuingDate, expiryDate, certificationUrl | `studentId → Student` (Restrict) | owned by Student |
| `Project` | Student projects | projectTitle, description, startDate, endDate, technologyUsed, projectUrl, teamSize | `studentId → Student` (Restrict) | owned by Student |
| `Internship` | Student internships | companyName, role, startDate, endDate, stipend, certificateUrl | `studentId → Student` (Restrict) | owned by Student |
| `Placement` | Placement/company record per student | companyName, jobRole, placementDate, packageLpa, placementStatus, location | `studentId → Student` (Restrict) | owned by Student; has rounds + offer |
| `PlacementRound` | A round of a placement | roundNumber, roundType, roundDate, result, remark | `placementId → Placement` (Restrict) | unique(placementId, roundNumber); 1:1 feedback |
| `RoundFeedback` | Feedback on a round (Placement Head only) | rating, feedbackDate, comments | `placementRoundId → PlacementRound` (unique, Restrict) | 1:1 to PlacementRound |
| `OfferLetter` | Offer for a placement | companyName, packageLpa, offerDate, joiningDate, designation, location, documentUrl | `placementId → Placement` (unique, Restrict) | 1:1 to Placement |
| `CareerHistory` | Post-graduation jobs | companyName, jobTitle, startDate, endDate, role, location, currentJob | `studentId → Student` (Restrict) | owned by Student (post-grad) |
| `AlumniFeedback` | Post-graduation feedback | rating, comment, feedback, feedbackDate | `studentId → Student` (Restrict) | owned by Student (post-grad) |
| `PreparationResource` | Placement-preparation learning resource | title, description, category, topic, resourceType, url, thumbnailUrl, duration, difficulty, isActive | — (standalone, admin-managed) | independent table |

**Note on enums/columns:** `isActive` maps to `is_active`, `createdAt`→`created_at`, etc.

### Unusual database-level names (these are `@map` COLUMN/TABLE names, not application names)

The Prisma models use camelCase in TypeScript; the **database-level** names (via `@map` /
`@@map`) contain historical typos/quirks. These are **database-level** names. Application code
(Prisma client / API / frontend TS types) always uses the clean camelCase model/field names.

| Prisma model / field | DB name (`@map`/`@@map`) | Note |
|----------------------|--------------------------|------|
| `Course.courseId` (on Student) | `course_couse_id` | Historical typo "couse" |
| `CareerHistory` (table) | `Carrer_history` | Historical typo "Carrer" |
| `AlumniFeedback` (table) | `Alumini_feedback` | Historical typo "Alumini" |
| `AcademicRecord.resultStatus` | `result_stauts` | Historical typo "stauts" |
| `AcademicRecord.creditsEarned` / `totalCredits` | `credits_earn` / `total_credit` | Plural dropped |
| `AcademicRecord` (table) | `Academic_record` | Mixed case |
| `PlacementRound.placementId` | `placement_placement_id` | Redundant prefix |
| `RoundFeedback.placementRoundId` | `placement_round_placement_round_id` | Redundant prefix |
| `OfferLetter.placementId` | `placement_placement_id` | Redundant prefix |
| `User.studentId` / Student-owned FKs | `student_student_id` | Redundant prefix |

**Do not rename these.** The existing schema is authoritative; migrations only ever add
new columns/tables. See §24 "Rules that must not be violated".

---

## 10. Database Relationship Overview

Only relationships that actually exist:

```
User  (role = ADMIN | STUDENT | PLACEMENT_HEAD)
└── Student (1:1 optional, via user.studentId)

Course
└── Student (1:N). N.

Student
├── Academic_record      (1:N)
├── Backlog              (1:N)
├── Student_skill        (N:M junction to Skill; the ONLY Cascade delete)
├── Certification        (1:N)
├── Project              (1:N)
├── Internship           (1:N)
├── Placement            (1:N)
│   ├── Placement_round  (1:N; @@unique[placementId, roundNumber])
│   │   └── Round_feedback (1:1)
│   └── Offer_letter     (1:1)
├── Carrer_history       (1:N; post-graduation)
└── Alumini_feedback     (1:N; post-graduation)

Skill ──< Student_skill >── Student   (N:M)

Preparation_resource     (standalone, no FK to Student)
```

---

## 11. Placement System

**Important — "Placement Drive" is a UI/business concept, not a database table.** There is no
`PlacementDrive` table. A "drive" is represented by **one `Placement` row per eligible student**
created in bulk for a (company, date, role) grouping by the Placement Head (Decision 2). The UI
and analytics group these rows by company + date + role to render "drives".

**Placement pipeline:**
1. **Placement** (`Placement`) — one row per student-company engagement: `companyName`, `jobRole`, `placementDate`, `packageLpa`, `placementStatus`, `location`.
   - A student applies/creates their own placement (writable while active); Admin/Placement Head creates placements and drives.
2. **PlacementRound** (`PlacementRound`) — rounds belong to a placement: `roundNumber`, `roundType` (APPLICATION/APTITUDE/TECHNICAL/INTERVIEW_HR), `roundDate`, `result` (PENDING/PASS/FAIL/SELECTED/REJECTED), `remark`. Unique `(placementId, roundNumber)`. Admin/Placement Head write rounds.
3. **RoundFeedback** (`RoundFeedback`) — 1:1 with a round: `rating`, `feedbackDate`, `comments`. **Placement Head / Admin only** (Decision 3.3). Students cannot write feedback.
4. **OfferLetter** (`OfferLetter`) — 1:1 with a placement: `companyName`, `packageLpa`, `offerDate`, `joiningDate`, `designation`, `location`, `documentUrl`. Admin/Placement Head write offers.

**Placement status values:** `APPLIED`, `IN_PROGRESS`, `SELECTED`, `REJECTED`, `OFFER_RECEIVED`.

**Placement Head workflow:** Create drives (`POST /api/placements/drive/create` → create-many),
manage rounds/results/remarks (`/:placementId/rounds`), write round feedback
(`/:placementId/rounds/:roundId/feedback`), and upload offer letters (`/:placementId/offer`).

**Standalone routes** also expose rounds (`/api/placement-rounds`), feedback
(`/api/round-feedback`), and offers (`/api/offer-letters`) for spec compatibility.

---

## 12. Preparation Module

**Implemented** (added recently). Provides a placement-preparation learning-resource library.

- **Location (frontend):**
  - `src/pages/student/StudentPreparation.tsx` — category hub (`/student/preparation`)
  - `src/pages/student/StudentPreparationInterview.tsx` — `/student/preparation/interview` (11 topics: Tell me about yourself, Strengths & weaknesses, Why should we hire you?, Why join this company?, Common HR questions, Technical interview questions, Resume-based questions, Behavioral questions, STAR method, Interview etiquette, Body language)
  - `src/pages/student/StudentPreparationCategory.tsx` — reusable per-category page (`/student/preparation/:category` for technical, hr, aptitude, dsa, communication, resume, gd, mock)
  - `src/pages/admin/AdminPreparationResources.tsx` — admin management (`/admin/preparation-resources`)
- **Components:** resource cards render title, description, resource type badge, difficulty badge, duration, and an **Open Resource** anchor using `target="_blank" rel="noopener noreferrer"`.
- **APIs (backend, base `backend/src/routes/preparationRoutes.ts`):**
  - `GET /api/student/preparation` (filters: `category`, `topic`, `resourceType`, `difficulty`; admin-only `includeInactive`)
  - `GET /api/student/preparation/:id`
  - `POST /api/student/preparation` — ADMIN only
  - `PATCH /api/student/preparation/:id` — ADMIN only
  - `DELETE /api/student/preparation/:id` — ADMIN only
  - Layering: `controller` (`preparationController.ts`) → `service` → `repo` (`preparationRepo.ts`) → Prisma; validators in `preparationValidators.ts` (URLs must be `http(s)://`).
- **Database model:** `PreparationResource` (category, topic, resourceType, url, thumbnailUrl, duration, difficulty, isActive).
- **Resource types (enum `PreparationResourceType`):** `YOUTUBE`, `ARTICLE`, `PDF`, `DOCUMENT`, `PRACTICE`, `OTHER`.
- **Difficulties (enum `PreparationDifficulty`):** `BEGINNER`, `INTERMEDIATE`, `ADVANCED`.
- **Student permission:** view only (search + category + resource-type + difficulty filters). Inactive resources are hidden from students.
- **Admin permission:** full CRUD + activate/deactivate.
- **Seed data:** `backend/prisma/seed.ts` seeds 27 Interview Preparation resources across the 11 topics.

> The original "Placement Preparation" page (`StudentPlacementPreparation.tsx`) and its route
> `/student/placement-preparation` still exist and are untouched; the new Preparation module uses
> its own `/student/preparation` routes.

---

## 13. Admin Panel

Admin routes base `/admin/*`. Frontend pages under `frontend/src/pages/admin/`. All admin
routes and endpoints are server-side guarded.

| Feature | UI (frontend) | API endpoint(s) | Backend route | Controller/Service | DB model |
|---------|---------------|-----------------|---------------|--------------------|----------|
| Dashboard | `AdminDashboard.tsx` | `GET /api/dashboard` | `dashboardRoutes.ts` | `dashboardController/Service` | aggregate |
| Students list | `AdminStudents.tsx` | `GET /api/students` | `studentRoutes.ts` | `studentController/Service` | Student |
| Student detail | `AdminStudentDetail.tsx` | `GET /api/students/:id` | `studentRoutes.ts` | studentController/Service | Student + owned |
| Create/update student | (in detail) | `POST/PATCH /api/students(/:id)` | studentRoutes | studentController/Service | Student |
| Graduation / mark-alumni / activate / deactivate | (in detail) | `POST /api/students/:id/graduate`, `POST .../mark-alumni`, `PATCH .../activate`, `.../deactivate` | studentRoutes | studentController/Service | Student + status |
| Users | `AdminUsers.tsx` | `/api/users` (CRUD) | `userRoutes.ts` (admin-only by default) | userController/Service | User |
| Courses | `AdminCourses.tsx` | `/api/courses` (CRUD) | `courseRoutes.ts` | courseController/Service | Course |
| Skill Catalogue | `AdminSkills.tsx` | `/api/skills` (CRUD) | `skillRoutes.ts` | skillController/Service | Skill |
| Placements | `AdminPlacements.tsx` | `/api/placements` + nested | `placementRoutes.ts` | placementController/Service | Placement/Round/Feedback/Offer |
| Reports | `AdminReports.tsx` | `GET /api/dashboard` | dashboardRoutes | dashboardController/Service | aggregate |
| Preparation Resources | `AdminPreparationResources.tsx` | `/api/student/preparation` (CRUD) | `preparationRoutes.ts` | preparationController/Service | PreparationResource |

Admin can also read/edit any student-scoped data (bypasses ownership scope and graduation lock).

---

## 14. Student Panel

Student routes base `/student/*`; pages under `frontend/src/pages/student/`. All are read-write
on the student's **own** data (unless graduated). Pages present (actual list):

| Page | Route | Purpose |
|------|-------|---------|
| `StudentDashboard` | `/student` | Overview dashboard |
| `StudentOverview` / `StudentProfile` | `/student/overview`, `/student/profile` | Profile & overview |
| `StudentAcademics`, `StudentAcademicProgress`, `StudentAttendance` | `/student/academics`, `/student/academic-progress`, `/student/attendance` | Academic tracking |
| `StudentBacklogs` | `/student/backlogs` | Backlogs |
| `StudentSkillDevelopment`, `StudentSkills` | `/student/skill-development`, `/student/skills` | Skills |
| `StudentCertifications` | `/student/certifications` | Certifications |
| `StudentProjects` | `/student/projects` | Projects |
| `StudentInternships`, `StudentInternshipHub` | `/student/internships`, `/student/internship-hub` | Internships |
| `StudentPlacements`, `StudentPlacementTracker` | `/student/placements`, `/student/tracker` | Placements + tracker |
| `StudentPlacementPreparation` | `/student/placement-preparation` | Legacy preparation page (kept) |
| `StudentPreparation` + Interview/Category | `/student/preparation`, `/student/preparation/interview`, `/student/preparation/:category` | **Preparation module** |
| `StudentCareerProfile`, `StudentCareerGoals`, `StudentCareerTimeline` | `/student/career-profile`, `/student/career-goals`, `/student/timeline` | Career info |
| `StudentResumeCenter`, `StudentResumeAnalyzer` | `/student/resume`, `/student/resume-analyzer` | Resume tools |
| `StudentAchievements` | `/student/achievements` | Achievements |
| `StudentDocumentCenter` | `/student/documents` | Documents |
| Intelligence: `StudentReadiness`, `StudentRoadmap`, `StudentCompanies`, `StudentAnalytics`, `StudentRiskOverview`, `StudentMentors`, `StudentMockInterviews`, `StudentSkillGap`, `StudentCareerXp`, `StudentAlumniNetwork`, `StudentLearning` | `/student/readiness`, `/student/roadmap`, `/student/companies`, `/student/analytics`, `/student/at-risk`, `/student/mentors`, `/student/mock-interviews`, `/student/skill-gap`, `/student/career-xp`, `/student/alumni-network`, `/student/learning` | Client-side intelligence knowledge-base tools (many browser-local; see `utils/intelligence/*`) |
| `StudentNotifications`, `StudentSupport` | `/student/notifications`, `/student/support` | System |

---

## 15. Placement Head Panel

Placement Head routes base `/placement/*`; pages under `frontend/src/pages/placement/`.

| Page | Route | Purpose |
|------|-------|---------|
| `PlacementDashboard` | `/placement` | Institution dashboard |
| `PlacementDrives` | `/placement/drives` | Create/list drives (grouped placements) |
| `PlacementDriveDetail` | `/placement/drive-detail` | Drive details (students, rounds, results) |
| `PlacementPipeline` | `/placement/pipeline` | Pipeline view |
| `PlacementStudentProfile` | `/placement/student-profiles` | View student profiles |
| `PlacementList` | `/placement/placements` | Placement list |
| `PlacementReports` | `/placement/reports` | Reports/analytics |

Placement Head can create drives (`POST /api/placements/drive/create`), manage rounds/results/
remarks, write round feedback, and upload offer letters. They cannot manage users/courses/skills
or edit student academic records.

---

## 16. Alumni

- **No separate role.** Alumni = `role = STUDENT` with `Student.currentStatus = ALUMNI`
  (set via Admin `POST /api/students/:id/mark-alumni`, only allowed after graduation).
- **Frontend:** `/alumni/*` pages under `frontend/src/pages/alumni/`: `AlumniDashboard`,
  `AlumniProfile`, `AlumniCareer` (career history), `AlumniFeedback`.
- **What alumni can edit:** `Career_history` (post-graduation jobs) and `Alumini_feedback`
  (the corresponding routes are NOT graduation-locked).
- **What becomes read-only:** all pre-graduation entities (academics, backlogs, skills,
  certifications, projects, internships, placements) — enforced by `requireWritableStudent`.
- **RoleGate:** students with `currentStatus === 'ALUMNI'` are redirected to `/alumni`; the
  `/alumni` panel is only reachable by alumni.

---

## 17. API Documentation

**Base URL:** backend origin (dev `http://localhost:4000`; prod `https://api.<domain>`).
All endpoints return the envelope `{ success, data, message }` (errors: `{ success:false, message, errors? }`).
All endpoints below require `authenticate` unless noted.

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| POST | `/api/auth/login` | public | — | body `{email,password}` → sets httpOnly `token` cookie |
| POST | `/api/auth/logout` | optional | — | clears cookie |
| GET | `/api/auth/me` | ✅ | any | returns JWT AuthUser (+ student lifecycle status for STUDENT) |
| GET | `/api/auth/sso/status` | public | — | SSO configured? |
| GET | `/api/auth/sso` | public | — | initiate OIDC (503 until configured) |
| GET | `/api/auth/sso/callback` | public | — | OIDC callback (503 until configured) |

### Admin / reference
| Method | Endpoint | Role | Notes |
|--------|----------|------|-------|
| GET/POST, GET/PATCH | `/api/users` (+`/:id`) | ADMIN | user management |
| GET | `/api/courses` (+`/:id`) | any (read) | course list |
| POST/PATCH/DELETE | `/api/courses`(+`/:id`) | ADMIN | course CRUD |
| GET | `/api/skills` (+`/:id`) | any (read) | skill master |
| POST/PATCH/DELETE | `/api/skills`(+`/:id`) | ADMIN | skill CRUD |

### Student / student-scoped
| Method | Endpoint | Role | Notes |
|--------|----------|------|-------|
| GET | `/api/students/me` | STUDENT | own profile + lifecycle |
| GET | `/api/students` | ADMIN, PLACEMENT_HEAD | list all |
| GET/POST/PATCH | `/api/students(/:id)` | ADMIN (getById ADMIN) | student CRUD |
| PATCH | `/api/students/:id/activate` / `deactivate` | ADMIN | status toggle |
| POST | `/api/students/:id/graduate` | ADMIN | explicit graduation (blocked on backlogs/academic gap) |
| POST | `/api/students/:id/mark-alumni` | ADMIN | alumni transition |
| GET/POST/PATCH/DELETE | `/api/academic-records`, `/api/backlogs`, `/api/certifications`, `/api/projects`, `/api/internships` | own or ADMIN; writes need writable | student-owned CRUD |
| GET/POST/DELETE | `/api/student-skills` | own or ADMIN | skill assignment/unassign |

### Placements
| Method | Endpoint | Role | Notes |
|--------|----------|------|-------|
| GET | `/api/placements` | any (own for student) | placements list |
| GET | `/api/placements/drives` | ADMIN, PLACEMENT_HEAD | drives |
| GET | `/api/placements/eligible-students` | ADMIN, PLACEMENT_HEAD | eligible students |
| GET | `/api/placements/:id` | any (own) | placement detail |
| POST | `/api/placements` | ADMIN/HEAD/STUDENT (writable) | create/apply placement |
| POST | `/api/placements/drive/create` | ADMIN, PLACEMENT_HEAD | create-many drive |
| PATCH/DELETE | `/api/placements/:id` | ADMIN/HEAD (PATCH also STUDENT own) | update/delete |
| GET/POST/PATCH/DELETE | `/api/placements/:placementId/rounds(/:roundId)` | read any; write ADMIN/HEAD | rounds |
| POST/PATCH | `/api/placements/:placementId/rounds/:roundId/feedback(/:feedbackId)` | ADMIN, PLACEMENT_HEAD | round feedback |
| GET/POST/PATCH | `/api/placements/:placementId/offer(/:offerId)` | read any; write ADMIN/HEAD | offers |
| GET/POST/PATCH | `/api/placement-rounds`, `/api/round-feedback`, `/api/offer-letters` | read / ADMIN·HEAD write | standalone spec surface |

### Alumni
| Method | Endpoint | Role | Notes |
|--------|----------|------|-------|
| GET/POST/PATCH/DELETE | `/api/career-history` (+`/:id`) | any / own; writes not grad-locked | post-graduation jobs |
| GET/POST/PATCH/DELETE | `/api/alumni-feedback` (+`/:id`) | any / own; writes not grad-locked | alumni feedback |

### Preparation
| Method | Endpoint | Role | Notes |
|--------|----------|------|-------|
| GET | `/api/student/preparation` | any | filters `category`,`topic`,`resourceType`,`difficulty` (admin `includeInactive`) |
| GET | `/api/student/preparation/:id` | any | detail (inactive hidden from non-admin) |
| POST/PATCH/DELETE | `/api/student/preparation(/:id)` | **ADMIN only** | CRUD |

### Dashboard / uploads / health
| Method | Endpoint | Role | Notes |
|--------|----------|------|-------|
| GET | `/api/dashboard` | any (role-scoped) | role-based analytics (Recharts-ready) |
| POST | `/api/upload` | any | multipart `file` → `{ url, key }` (5MB; PDF/JPEG/PNG/WEBP/DOC) |
| GET | `/api/health` | public | health check |

---

## 18. Environment Variables

**Never use real values.** Placeholders below.

| Variable | Used By | Purpose | Example |
|----------|---------|---------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection string | `postgresql://USER:PASSWORD@HOST:PORT/career_track?schema=public` |
| `PORT` | Backend | Server port | `4000` |
| `NODE_ENV` | Backend | `development`/`production` (enables SameSite=None in prod) | `development` |
| `JWT_SECRET` | Backend | JWT signing secret | `YOUR_JWT_SECRET` |
| `JWT_EXPIRES_IN` | Backend | Token TTL | `7d` |
| `FRONTEND_URL` | Backend | CORS origin + SSO redirect | `http://localhost:5179` |
| `COOKIE_SECURE` | Backend | `true` in prod (HTTPS) | `false` |
| `STORAGE_DRIVER` | Backend | Storage backend (`local`, future `s3`) | `local` |
| `STORAGE_LOCAL_DIR` | Backend | Local upload directory | `uploads` |
| `STORAGE_BASE_URL` | Backend | Public base URL for stored files | `http://localhost:4000` |
| `SSO_PROVIDER`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, `SSO_ISSUER` | Backend | Optional OIDC (SSO disabled until set) | `SSO_ISSUER=https://idp.example.com`, `SSO_CLIENT_SECRET=YOUR_CLIENT_SECRET` |
| `SSO_REDIRECT_URI`, `SSO_SCOPE`, `SSO_ALLOWED_DOMAIN`, `SSO_ADMIN_EMAILS` | Backend | Optional SSO tuning | `openid email profile` |
| `VITE_API_URL` | Frontend (browser) | Backend origin; empty = Vite proxy | `https://api.yourdomain.com` |
| `PRISMA_SKIP_POSTINSTALL_GENERATE` | Backend (Vercel) | Disables prisma postinstall generation on Vercel | `true` |

> Only `VITE_*` vars are exposed to the browser. Never place backend secrets (DB, JWT,
> SSO client secret) in frontend env vars.

---

## 19. Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (this project uses a Homebrew instance on **port 5433**; see README/IMPORTANT for
  recreate commands). The actual dev DB connection string lives in `backend/.env` (gitignored).

### Backend
```bash
cd ~/CAREER-TRACKER/backend
cp .env.example .env      # then edit to match your environment (DATABASE_URL, JWT_SECRET, ...)
npm install
npx prisma migrate deploy # apply migrations to the DB
npx tsx prisma/seed.ts    # seed initial data (DEV ONLY — seed deletes all rows)
npm run dev               # http://localhost:4000  (tsx watch; use npx tsx src/index.ts for one-off)
```

### Frontend
```bash
cd ~/CAREER-TRACKER/frontend
cp .env.example .env      # optional; empty VITE_API_URL uses the Vite dev proxy
npm install
npm run dev               # http://localhost:5179
```
The Vite dev server proxies `/api` and `/uploads` to `http://localhost:4000`, so no API base
URL is needed locally.

### Useful commands
| Task | Backend | Frontend |
|------|---------|----------|
| Run dev | `npm run dev` (port 4000) | `npm run dev` (port 5179) |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | `npm run typecheck` (`tsc --noEmit`) |
| Lint | `npm run lint` | `npm run lint` |
| Build | `npm run build` (→ `dist/`) | `npm run build` (→ `dist/`) |
| Prisma generate | `npm run prisma:generate` | — |
| Prisma migrate (dev) | `npm run prisma:migrate` | — |
| Prisma migrate (deploy) | `npm run prisma:deploy` | — |
| Seed | `npm run prisma:seed` | — |

### Local URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5179 |
| Backend | http://localhost:4000 |
| Health check | http://localhost:4000/api/health |
| PostgreSQL | 127.0.0.1:5433 |

---

## 20. Production Deployment

Deployment is described in detail in `docs/DEPLOYMENT.md`. Summary:

- **Two separate Vercel projects** (frontend + backend) sharing one custom apex domain (two
  subdomains: `app.*` → frontend, `api.*` → backend) so the auth cookie is same-site.
- **Backend project:** root directory `backend`, preset `@vercel/node` (`backend/vercel.json`
  rewrite `/api/:path*` → `/api/index.ts`; build = `npx prisma generate && npm run build &&
  node scripts/prisma-vercel-strip.mjs`). Thin serverless entry `backend/api/index.ts` exports
  `createApp()`.
- **Frontend project:** root directory `frontend`, Vite build → `dist`; `frontend/vercel.json`
  SPA fallback rewrite.
- **Database:** Neon PostgreSQL; apply schema with `npx prisma migrate deploy` — **never**
  `migrate reset`/`db push`, and **never seed production** (seed deletes all rows).
- **Production env vars** (Vercel): `DATABASE_URL`, `NODE_ENV=production`, `JWT_SECRET`
  (strong, rotated), `JWT_EXPIRES_IN=7d`, `FRONTEND_URL`, `COOKIE_SECURE=true`,
  `PRISMA_SKIP_POSTINSTALL_GENERATE=true` (backend); `VITE_API_URL` (frontend).
- **Vercel upload limitation:** serverless filesystems are ephemeral — `STORAGE_DRIVER=local`
  does not persist uploads across invocations/instances. For durable uploads, implement an
  S3-compatible `StorageService` (the abstraction is ready; no business-logic change needed).
- **Vercel SPA routing:** `frontend/vercel.json` rewrites all paths to `index.html`.

---

## 21. Vercel Configuration (summary)

- `backend/vercel.json`: `buildCommand` runs prisma generate → build → strip; rewrites `/api/*`
  → `/api/index.ts`.
- `frontend/vercel.json`: `buildCommand: npm run build`, `outputDirectory: dist`, rewrite all →
  `/index.html`.
- `backend/api/index.ts`: imports `dotenv/config` + `createApp()`, default-exports the Express
  app for `@vercel/node`.
- `backend/scripts/prisma-vercel-strip.mjs`: build-time helper (strips generated client artifacts
  incompatible with Vercel).
- `.vercel/repo.json`: metadata linking the `backend` directory to the Vercel project
  `career-tracker-fsov` (gitignored, not for sharing).

---

## 22. Existing Implementation Status

- **Backend:** complete, migrated, seeded, and tested (README §1; verification listed in
  IMPORTANT.md §11). Includes auth, RBAC, student lifecycle, placements, dashboards, uploads,
  SSO (optional, disabled by default), and the **Preparation module**.
- **Frontend:** fully built — all four experiences (Admin, Placement Head, Student, Alumni) with
  routing, role gates, shared UI components, dashboards, and the Preparation module.
- **Preparation module:** implemented (model, migration, seed, student pages, admin page,
  view/CRUD APIs, filters, RBAC admin-only writes).
- **SSO:** code present, **disabled** until `SSO_PROVIDER`/`SSO_ISSUER`/`SSO_CLIENT_ID` are set
  (routes return 503 until configured).
- **Storage:** local-disk implementation only; no S3/Cloudinary/Supabase implementation yet.
- **Tests:** **Not currently implemented** — no unit/integration test harness is present in
  `package.json` scripts or repo.
- **`docs/`:** contains only `DEPLOYMENT.md`; no further docs.

---

## 23. Known Limitations

- **Local-only uploads on Vercel:** serverless file storage is ephemeral; durable uploads require
  an S3-compatible `StorageService` (not yet implemented).
- **`IMPORTANT.md` is stale** (states frontend not built, 16 tables) — the code/README are the
  source of truth for current inventory.
- **Unusual DB table/column names** contain legacy typos (see §9). They work but are awkward;
  do not "fix" them via schema edits.
- **No automated tests** currently exist.
- **SSO** optional and disabled by default.
- **No pagination on the Preparation list endpoint** (returns all matching resources).
- **Legacy duplicate page:** `/student/placement-preparation`
  (`StudentPlacementPreparation.tsx`) coexists with the newer Preparation module (intentional).
- **API responses** reflect DB `Date`/`DateTime` as ISO strings (frontend `formatDate` /
  `status.ts` handle formatting).

---

## 24. Rules That Must NOT Be Violated

1. **Architecture layering is strict:** `routes → controllers → services → repositories → Prisma`.
   No business logic in route files.
2. **All authorization is enforced server-side.** The frontend only reflects backend permissions;
   never trust the client for authorization.
3. **Three roles only:** `ADMIN`, `STUDENT`, `PLACEMENT_HEAD`. Alumni is a status transition of a
   STUDENT account, **not** a fourth role.
4. **Placement "drives" have no dedicated table** — they are groups of `Placement` rows. Do not
   add a `PlacementDrive` table; keep the create-many pattern.
5. **No cascade deletes** on owned business tables (they use `onDelete: Restrict`) except the
   `StudentSkill` junction.
6. **Graduation lock** must remain: graduated/alumni students cannot write pre-graduation
   entities; admins bypass. Alumni may edit only `Career_history` and `Alumini_feedback`.
7. **Round feedback** (Decision 3.3) is Placement Head / Admin only; never repurpose it for
   student-facing comments.
8. **Do not rename existing @map/@@map names or existing schema** — the DB is authoritative.
   Only add new columns/tables via migrations; never `migrate reset`/`db push` on real data.
9. **Never seed production** — the seed `deleteMany`s all tables and creates demo accounts with
   a shared dev password. Production schema is applied with `migrate deploy` and admin accounts
   are created manually.
10. **HTTP-only cookie for the JWT; passwords hashed with bcrypt.** Never return the token,
    password, or hash in API responses. Frontend env vars must never contain backend secrets.
11. **External links** must open in a new tab with `target="_blank" rel="noopener noreferrer"`.
12. **Do not expose real secrets** in code, docs, or commits (DB URL, JWT secret, SSO client
    secret). Use `*.env.example` placeholders.
13. **Response envelope** must stay consistent: `{ success, data, message }` /
    `{ success, message, errors[] }`; never leak stack traces in production.
14. **Don't redesign unrelated pages** — match the existing design (Tailwind + custom
    `components/ui.tsx` + Lucide + TanStack Query). Follow existing naming conventions.

---

## 25. How a Developer / AI Should Safely Modify the Project

1. **Read `README.md`, `docs/DEPLOYMENT.md`, this file, and the relevant source before editing.**
   Note that `IMPORTANT.md` is partially outdated.
2. **Mirror the existing pattern** for any new feature:
   - Backend: add a Zod schema in `validators/`, a repository, a service, a controller, and a
     route; mount it in `app.ts`. Wrap handlers with `asyncHandler`; throw `AppError`.
   - Guard new routes with `authenticate` + `requireRole(...)` (+ `requireWritableStudent` /
     `ensureStudentScope` as appropriate).
   - Frontend: add a page under `pages/<panel>/`, a lazy route in `App.tsx` wrapped in
     `RoleGate`, and (optionally) nav/breadcrumb entries in `AppLayout.tsx`. Use existing UI
     primitives from `components/ui.tsx` and `useApi`.
3. **For schema changes:** edit `prisma/schema.prisma`, then `npx prisma migrate dev --name <x>`
   locally (this applies to dev DB and regenerates the client), then `npx prisma generate`.
   Verify with `npm run typecheck` on both `frontend/` and `backend/`, and `npm run build`.
   For production, apply with `npx prisma migrate deploy` — never reset/push, never seed.
4. **Verify types/builds:** after changes run both `npm run typecheck` (or `npm run build`) in
   `frontend/` and `backend/`. Backend also has `npm run lint`.
5. **Test end-to-end minimally:** start backend on :4000 and frontend on :5179; login with a
   seeded account and exercise the affected flows; confirm RBAC (e.g. students can't create
   preparation resources, admins can).
6. **Do not commit** unless explicitly asked. Stage only intended files; never commit `.env`,
   secrets, `node_modules`, `dist/`, or uploads.
7. **Keep the envelope, naming, and design conventions**; reuse existing code rather than adding
   duplicate dependencies.

---

*End of document.*
