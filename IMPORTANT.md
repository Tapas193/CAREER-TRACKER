# CAREER TRACK — Student Career Lifecycle Tracking System

A full-stack web application that tracks a student's journey from **admission → academic progress → skills → certifications → projects → internships → placement → rounds → feedback → offer letter → graduation → alumni/career life**.

**Current status: BACKEND 100% COMPLETE & TESTED. FRONTEND NOT YET BUILT.**

---

## 1. Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui, Lucide React, TanStack Query, React Hook Form, Zod, Recharts — **not yet scaffolded** |
| Backend   | Node.js, Express.js, TypeScript, Prisma ORM, Zod, JWT (httpOnly cookies), bcryptjs |
| Database  | PostgreSQL (managed via Prisma migrations) |
| Storage   | StorageService abstraction (local-disk impl; swap for Cloudinary/Supabase later) |
| Auth      | JWT in httpOnly cookies, RBAC middleware |

---

## 2. Project Structure

```
career-track/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # full schema (16 tables)
│   │   ├── seed.ts              # seed data (1 admin, 1 placement head, 14 students)
│   │   └── migrations/          # 20260830133306_init applied
│   ├── src/
│   │   ├── config/              # config + prisma client
│   │   ├── controllers/         # 16 controllers
│   │   ├── services/            # 15 services (business logic)
│   │   ├── repositories/        # 12 repositories (Prisma queries)
│   │   ├── routes/              # 20 route files
│   │   ├── middleware/          # auth, rbac, scope, graduationLock, validate, upload, error
│   │   ├── validators/          # 15 Zod schema files
│   │   ├── utils/               # http envelope, jwt, password
│   │   ├── types/               # AuthUser + Express augmentation
│   │   └── index.ts             # server entry
│   ├── uploads/                 # local storage dir (offer letters, certs)
│   ├── .env                     # DB + JWT + storage config
│   └── package.json
├── frontend/                    # EMPTY — not yet created
├── docs/                        # (empty)
├── .env.example
└── README.md
```

**Layering:** routes → controllers → services → repositories → Prisma. **No business logic in route files.**

---

## 3. Database Setup (IMPORTANT)

There are **two** PostgreSQL servers on this machine:

| Server | Binary | Port | Auth |
|--------|--------|------|------|
| **Homebrew** `postgresql@18` | `/opt/homebrew/opt/postgresql@18` | **5433** | trust (no password for OS user) |
| EDB/Installer | `/Library/PostgreSQL/18` | 5432 | requires password |

**The project is connected to the Homebrew instance on port 5433.**

### Connection URL (backend/.env)
```
DATABASE_URL="postgresql://career_track:career_track_dev@127.0.0.1:5433/career_track?schema=public"
```

### Recreate from scratch (if ever needed)
```bash
# 1. connect
psql -h 127.0.0.1 -p 5433 -U shivang_mishra -d postgres
# 2. create role + db
CREATE USER career_track WITH PASSWORD 'career_track_dev' CREATEDB;
CREATE DATABASE career_track OWNER career_track;
# 3. run migration + seed (from backend/)
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### Inspect data
```bash
PGPASSWORD=career_track_dev psql -h 127.0.0.1 -p 5433 -U career_track -d career_track
# e.g. SELECT first_name, current_status FROM "Student";
# list tables: \dt
```

---

## 4. Roles & Login Credentials (seed)

Password for **all** accounts below: `KeepSecret@123`

| Role | Email | Notes |
|------|-------|-------|
| Admin | `admin@careertrack.com` | full control |
| Placement Head | `placement@careertrack.com` | drives, rounds, offers |
| Student | `aarav@student.com` | active, placed (Google offer) |
| Student | `diya@student.com` | active, placed (Flipkart) |
| Student | `aditya@student.com` | active |
| Alumni | `rahul@student.com` | GRADUATED → ALUMNI |

**Three login roles only** (ADMIN, STUDENT, PLACEMENT_HEAD). **Alumni is NOT a separate account** — it's `Student.currentStatus = ALUMNI`; the same STUDENT account changes what it can do.

---

## 5. Database Schema (16 tables, from the ERD)

Enums: `Role` (ADMIN/STUDENT/PLACEMENT_HEAD), `AccountStatus`, `StudentStatus` (ADMITTED/ACTIVE/ON_PLACEMENT/GRADUATED/ALUMNI), `GraduationStatus`, `ResultStatus`, `PlacementStatus`, `RoundType`, `RoundResult`.

- **User** — user_id, first/middle/last name, email (unique), phone, password_hash, role, account_status, optional student_id FK
- **Student** — student_id, names, dob, gender, enrollment_no/roll_number/admission_no (all unique), admission_year, expected_passing_year, current_semester, current_status, graduation_status, account_status, address, course FK
- **Course** — course_id, course_code (unique), name, department, degree, duration_years, total_semester
- **Academic_record** — semester, academic_year, sgpa/cgpa (0–10), credits_earn, total_credit, result_status; owned by Student
- **Backlog** — attempted_no, semester, subject, status, cleared_date, attempted_again; owned by Student
- **Skill** — skill_id, skill_name (unique), category
- **Student_skill** — junction (student_id + skill_id composite PK)
- **Certification** — name, issuing_organisation, issuing_date, expiry_date, url; owned by Student
- **Project** — title, description, start/end dates, technology_used, url, team_size; owned by Student
- **Internship** — company_name, role, start/end dates, stipend, certificate_url; owned by Student
- **Placement** — company_name, job_role, placement_date, package_lpa, placement_status, location; owned by Student
- **Placement_round** — round_number, round_type, round_date, result, remark; owned by Placement
- **Round_feedback** — rating (1–5), feedback_date, comments; owned 1:1 by Placement_round
- **Offer_letter** — company_name, package_lpa, offer_date, joining_date, designation, location, document_url; 1:1 with Placement
- **Carrer_history** — company_name, job_title, start/end dates, role, location, current_job; owned by Student (post-grad)
- **Alumini_feedback** — rating, comment, feedback, feedback_date; owned by Student (post-grad)

**No cascading deletes** on any Student/Placement/Academic-linked table (uses `onDelete: Restrict`) except the `Student_skill` junction (Cascade).

---

## 6. REST API Surface

Consistent envelope — success: `{ success, data, message }` · error: `{ success, message, errors[] }`. No stack traces in production.

| Base path | Purpose |
|-----------|---------|
| `/api/auth` | login, logout, me |
| `/api/users` | admin user CRUD |
| `/api/students` | student CRUD + `me`, `/:id/graduate`, `/:id/mark-alumni`, activate/deactivate |
| `/api/courses` | course reference data |
| `/api/academic-records` | owned, admin-editable |
| `/api/backlogs` | owned |
| `/api/skills` | skill master data |
| `/api/student-skills` | junction assign/unassign |
| `/api/certifications` | owned |
| `/api/projects` | owned |
| `/api/internships` | owned |
| `/api/placements` | placements + nested `/drive/create`, `/:id/rounds`, `/rounds/:r/feedback`, `/:id/offer`, `/eligible-students`, `/drives` |
| `/api/placement-rounds` | standalone rounds |
| `/api/round-feedback` | standalone round feedback |
| `/api/offer-letters` | standalone offers |
| `/api/career-history` | alumni-owned |
| `/api/alumni-feedback` | alumni-owned |
| `/api/dashboard` | role-based dashboards/analytics (Recharts-ready) |
| `/api/upload` | file upload → returns `{ url, key }` (multer validation: 5MB, PDF/JPEG/PNG/WEBP/DOC) |
| `/api/health` | health check |

---

## 7. Authorization Model (enforced server-side)

- **ADMIN**: everything.
- **Student**: read/write only their own `studentId`-scoped rows. Cannot touch `Placement_round.result`, `Round_feedback`, or `Offer_letter` writes (403). Cannot access another student's placement (403).
- **Placement Head**: creates drives (create-many placements), manages rounds/results/remarks, writes round feedback (`Decision 3.3`), uploads offer letters.
- **Graduation lock** (`middleware/graduationLock.ts`): once a student is `GRADUATED`/`ALUMNI`, they **lose write access** to pre-graduation entities (academics, backlogs, skills, certifications, projects, internships, placements). ADMINS bypass it. Alumni can still freely create/edit `Career_history` and `Alumini_feedback`.
- **Graduation trigger** (`Decision 5`): only via explicit Admin "Graduate Student" action, blocked if unresolved backlogs or no academic record (admin can override with confirmation).

| Protect something | How |
|---|---|
| JWT auth | `authenticate` middleware (httpOnly cookie `token`) |
| Role gate | `requireRole(...)` |
| Own-data scope | controller/service derives `ownerStudentId` from `req.user.studentId` unless ADMIN |
| Post-grad lock | `requireWritableStudent` on pre-grad write routes |

---

## 8. How to Run

### Backend (working now)
```bash
cd backend
npx tsx src/index.ts        # starts on http://localhost:4000
curl http://localhost:4000/api/health
```

### Validation commands (all pass)
```bash
cd backend
npx tsc --noEmit            # typecheck ✓
npx eslint src --ext .ts    # lint (no errors) ✓
npx prisma migrate deploy   # DB migration
npx tsx prisma/seed.ts      # seed data
```

### Frontend
Not built yet. Will run on `http://localhost:5173` once created (Vite), with API at `http://localhost:4000` (CORS locked to the frontend origin).

---

## 9. Key Design Decisions (per spec — these are binding)

1. **Every table** gets a surrogate PK; ERD weak-key composites become `@@unique`/indexes.
2. **Placement "drives"** = create-many (one Placement row per eligible student). No separate PlacementDrive table. Grouped by (company, date, role) in the UI/analytics layer.
3. **Round_feedback** ownership = Placement Head only. Any future student-facing comment is a separate nullable field (`studentComment` on Placement_round), never a repurpose of Round_feedback.
4. **Redundant FKs dropped.** `Placement_round` and `Offer_letter` have a single `placementId` FK; student is always derived by joining through `Placement`. Enforced in the repository layer, never trusting client input.
5. **Graduation** is explicit (Admin action), blocked on unresolved backlogs / missing academic record unless overridden with confirmation.
6. **Historical record locking** on graduation (see §7 graduation lock). Admins retain correction access.
7. **No cascade deletes** except Student_skill junction.

---

## 10. Validation Rules (enforced frontend + backend via Zod)

- SGPA/CGPA ∈ [0, 10]; Rating ∈ [1, 5]; Package/Stipend ≥ 0; Team_size ≥ 1
- End_date ≥ Start_date; Expiry_date ≥ Issuing_date; Joining after Offer
- Valid email; phone format; required fields non-empty
- Unique: User.Email, Student.Enrollment_no/Roll_number/Admission_no, Course.Course_code
- bcrypt password hashing; JWT in httpOnly cookie; CORS locked; no password in API responses; file type/size/name validation; ownership checks on every student-scoped route

---

## 11. Verified Working (manually tested via curl)

- ✅ Login/logout/me for all 4 roles (httpOnly JWT cookie, no password leaked)
- ✅ All 4 role dashboards return correct analytics
- ✅ Student scope isolation (cannot read another student's placements → 403)
- ✅ Student cannot write round feedback (→ 403)
- ✅ Alumni graduation lock (pre-grad writes → 403; career-history create → 201)
- ✅ Placement Head: create drive (create-many), create rounds, write feedback, upload offer letter
- ✅ Date handling (Zod transforms strings → Date for Prisma)
- ✅ Seed data (14 students across 4 courses, 3 full placement pipelines, 2 alumni)

---

## 12. Roadmap / What's Left

- [ ] **Phase 4–7: Frontend** — React UI for Admin, Student, Placement Head, Alumni panels (the empty `frontend/` dir)
- [ ] **Phase 8: Dashboards** — Recharts charts wiring to `/api/dashboard`
- [ ] **Phase 9: Final security hardening pass**
- [ ] **Phase 10: Tests (unit/integration), README, docs/** folder

**The backend is complete, secure, migrated, and seeded. The remaining work is entirely the frontend + polish.**
