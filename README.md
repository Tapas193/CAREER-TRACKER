# Career Track — Student Career Lifecycle Tracking System

A full-stack web application that tracks a student's journey from **admission → academic progress → skills → certifications → projects → internships → placement → rounds → feedback → offer letter → graduation → alumni/career life**.

> **Backend:** complete, migrated, seeded, and tested. **Frontend:** full production-grade UI for all four experiences.

---

## 1. Project Overview

Career Track is a role-based SaaS-style college management system with four distinct user experiences:

- **Admin** — institution-wide student lifecycle management
- **Placement Head** — placement drives, rounds, results, feedback, and offers
- **Student** — owns their academic, skill, certification, project, internship, and placement records
- **Alumni** — post-graduation career history and feedback (same account as a student, driven by `currentStatus = ALUMNI`)

All authorization is enforced **server-side**. The frontend only reflects what the backend permits.

---

## 2. Architecture

```
frontend/ (Vite + React + TS)  ──HTTP──▶  backend/ (Express + TS)  ──Prisma──▶  PostgreSQL
```

**Backend layering:** `routes → controllers → services → repositories → Prisma`. No business logic in route files.

**Storage:** A `StorageService` abstraction with a local-disk implementation (used in dev). Swap in S3-compatible, Cloudinary, or Supabase storage without rewriting business logic.

**Auth:** JWT stored in an **HTTP-only cookie**. RBAC middleware guards every route. No passwords or tokens ever reach the frontend.

---

## 3. Features

- JWT authentication via HTTP-only cookie, protected routes, role-based sessions
- Full RBAC for `ADMIN`, `STUDENT`, and `PLACEMENT_HEAD`
- Alumni behaviour driven by `Student.currentStatus = ALUMNI` (no separate role)
- **Graduation workflow** with admin-overridable blocking rules (unresolved backlogs / missing academic records)
- **Graduation lock** — pre-graduation records become read-only for graduated/alumni students
- Placement "drives" represented by existing `Placement` records grouped by company + job role + date (no separate `PlacementDrive` table)
- Role-based analytics dashboards (Recharts)
- File uploads (offer letters, certificates) with type/size validation
- Professional, responsive UI with loading / empty / error states, form validation, and confirmation dialogs

---

## 4. The Four User Experiences

| Experience | Route base | Notes |
|-----------|-----------|-------|
| **Admin** | `/admin/*` | Manage students, users, courses, skills; graduation + mark-alumni actions; complete lifecycle view |
| **Placement Head** | `/placement/*` | Create/manage drives (placements), participating students, rounds, results, feedback, offers |
| **Student** (active) | `/student/*` | Own-profile, academics, backlogs, skills, certifications, projects, internships, placements, rounds, offers |
| **Alumni** | `/alumni/*` | Read-only academic history + read-only pre-graduation records; editable career history & feedback |

**Alumni is NOT a separate authentication role.** An alumni account is `role = STUDENT` with `currentStatus = ALUMNI`.

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, Recharts, Lucide React |
| Backend | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT (HTTP-only cookies), bcryptjs, Multer |
| Database | PostgreSQL (managed via Prisma migrations) |
| Storage | StorageService abstraction (local-disk impl; swappable for S3/Cloudinary/Supabase) |

---

## 6. Folder Structure

```
career-track/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # schema (16 tables)
│   │   ├── seed.ts              # seed data (admin, placement head, students, alumni)
│   │   └── migrations/          # applied migrations
│   ├── src/
│   │   ├── config/              # config + prisma client
│   │   ├── controllers/         # 16 controllers
│   │   ├── services/            # business logic (incl. storage/)
│   │   ├── repositories/        # Prisma queries
│   │   ├── routes/              # route definitions
│   │   ├── middleware/          # auth, rbac, scope, graduationLock, validate, upload, error
│   │   ├── validators/          # Zod schemas
│   │   ├── utils/               # http envelope, jwt, password
│   │   ├── types/               # AuthUser + Express augmentation
│   │   └── index.ts             # server entry
│   ├── uploads/                 # local storage dir
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # HTTP client (cookie auth)
│   │   ├── components/          # reusable UI (Button, Card, Table, Dialog, Toast, ...)
│   │   ├── hooks/               # useAuth, useApi
│   │   ├── layouts/             # AppLayout (role-aware sidebar/nav)
│   │   ├── pages/               # admin/ placement/ student/ alumni/ + login
│   │   ├── types/               # shared TS types
│   │   └── utils/               # helpers
│   ├── .env.example
│   └── package.json
├── .env.example
└── README.md
```

---

## 7. Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (this project uses the Homebrew instance on **port 5433**)

### Backend

```bash
cd backend
cp .env.example .env      # then edit to match your environment
npm install
npx prisma migrate deploy # apply schema
npx tsx prisma/seed.ts    # seed initial data
npm run dev               # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env      # optional; empty VITE_API_URL uses the Vite proxy
npm install
npm run dev               # http://localhost:5179
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:4000`, so no API base URL is needed locally.

---

## 8. PostgreSQL Setup

The project connects to a Homebrew PostgreSQL instance on port **5433**:

```
DATABASE_URL="postgresql://career_track:career_track_dev@127.0.0.1:5433/career_track?schema=public"
```

To recreate the database from scratch (only if ever needed):

```bash
psql -h 127.0.0.1 -p 5433 -U <os-user> -d postgres
# then:
CREATE USER career_track WITH PASSWORD 'career_track_dev' CREATEDB;
CREATE DATABASE career_track OWNER career_track;
```

Inspect data:

```bash
PGPASSWORD=career_track_dev psql -h 127.0.0.1 -p 5433 -U career_track -d career_track
```

---

## 9. Environment Variables

### Backend (`backend/.env`)
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Backend port (default 4000) |
| `NODE_ENV` | `development` / `production` |
| `JWT_SECRET` | JWT signing secret (use a strong value in production) |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `FRONTEND_URL` | Allowed CORS origin |
| `COOKIE_SECURE` | `true` in production (HTTPS) |
| `STORAGE_DRIVER` | Storage backend (`local`, future: `s3`) |
| `STORAGE_LOCAL_DIR` | Local upload directory |
| `STORAGE_BASE_URL` | Public base URL for stored files |

### Frontend (`frontend/.env`)
| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL. Leave empty to use the Vite dev proxy; set to the backend origin in production |

Only `VITE_` prefixed variables are exposed to the browser. **Never put secrets** (DB credentials, JWT secrets) in frontend env files.

---

## 10. Database Migration

```bash
cd backend
npx prisma migrate dev      # create/apply a new migration during development
npx prisma migrate deploy   # apply existing migrations (CI / production)
npx prisma generate         # regenerate the Prisma client
```

**Important:** Existing database schema is authoritative. Do not drop, reset, truncate, or recreate the database unless explicitly required.

---

## 11. Seed Data

Seeding is idempotent and creates:

- 1 Admin
- 1 Placement Head
- 14 Students (across 4 courses), including placed and alumni students

```bash
cd backend
npx tsx prisma/seed.ts
```

Seed login credentials are documented in `backend/prisma/seed.ts`. Do not write real credentials into source code beyond the dev seed.

---

## 12. Development Commands

| Task | Backend | Frontend |
|------|---------|----------|
| Run dev server | `npm run dev` (port 4000) | `npm run dev` (port 5179) |
| Typecheck | `npx tsc --noEmit` | `npx tsc --noEmit` |
| Lint | `npm run lint` | `npm run lint` |
| Build | `npm run build` | `npm run build` |
| Preview build | — | `npm run preview` |

---

## 13. Deployment Requirements

- **Provider-neutral:** no hardcoded localhost URLs; all servers, CORS, and storage config come from environment variables.
- **Backend:** build with `npm run build` (outputs to `dist/`), then run `npm start`. Set `NODE_ENV=production`, a strong `JWT_SECRET`, `FRONTEND_URL`, and `COOKIE_SECURE=true`.
- **Frontend:** build with `npm run build` (outputs to `dist/`). Set `VITE_API_URL` to the backend's public origin and serve `dist/` with any static host or CDN.
- **Database:** run `npx prisma migrate deploy` against the production PostgreSQL instance.
- **Storage:** `STORAGE_DRIVER=local` is fine for single-instance deployments. For horizontal scaling, implement an S3-compatible `StorageService` (no business-logic changes required).

---

## 14. API Overview

Consistent envelope — success: `{ success, data, message }` · error: `{ success, message, errors[] }`.

| Base path | Purpose |
|-----------|---------|
| `/api/auth` | login, logout, me |
| `/api/users` | admin user management |
| `/api/students` | student CRUD + `me`, `/:id/graduate`, `/:id/mark-alumni` |
| `/api/courses` | course reference data (admin CRUD) |
| `/api/academic-records`, `/api/backlogs` | student-owned academic data |
| `/api/skills`, `/api/student-skills` | skill master + student assignments |
| `/api/certifications`, `/api/projects`, `/api/internships` | student-owned records |
| `/api/placements` | placements + `/drive/create`, `/:id/rounds`, `/eligible-students`, `/drives` |
| `/api/placement-rounds`, `/api/round-feedback`, `/api/offer-letters` | rounds, feedback, offers |
| `/api/career-history`, `/api/alumni-feedback` | alumni-owned post-graduation data |
| `/api/dashboard` | role-based analytics (Recharts-ready) |
| `/api/upload` | file upload → `{ url, key }` (5MB, PDF/JPEG/PNG/WEBP/DOC) |
| `/api/health` | health check |

**Authorization model (server-side):**
- **Admin:** everything
- **Student:** read/write only their own `studentId`-scoped rows; cannot write round results, round feedback, or offers
- **Placement Head:** creates drives, manages rounds/results/remarks, writes round feedback, uploads offers
- **Graduation lock:** graduated/alumni students lose write access to pre-graduation entities; admins bypass it
- **Graduation trigger:** only via explicit Admin action (blocked on unresolved backlogs / no academic record, overridable with confirmation)

---

## 15. Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5179 |
| Backend | http://localhost:4000 |
| Health check | http://localhost:4000/api/health |
| PostgreSQL | 127.0.0.1:5433 |
