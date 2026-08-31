# Career Track — Vercel Deployment Guide

This project is deployed as **two separate Vercel projects** (frontend + backend), sharing one
custom apex domain so the `SameSite=Lax` authentication cookie works across origins.

> **Important — domain requirement:** the backend sets its auth cookie with `SameSite=Lax`
> (backend is locked). For the cookie to be sent by the browser on cross-origin requests, the
> frontend and backend must be on the **same site** — i.e. share the same registrable domain.
> The free `*.vercel.app` domains for two independent projects are *different sites*, so cookies
> will NOT work. You MUST use a custom apex domain with two subdomains, e.g.:
>
> - `app.yourdomain.com` → frontend
> - `api.yourdomain.com` → backend
>
> (Both subdomains share apex `yourdomain.com`, making them same-site.)

---

## 1. Database (Neon PostgreSQL)

1. Create a Neon project and copy its connection string (the pooled one is recommended).
2. **Rotate/regenerate the connection password** before first use — the previous DB password is
   considered compromised and must not be reused.
3. Create the production admin account **manually** (do **not** run the seed in production).

### Apply schema (migrate only — do NOT seed)

```bash
cd backend
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/career_track?sslmode=require" \
  npx prisma migrate deploy
```

> **Why not seed?** `backend/prisma/seed.ts` first `deleteMany()`s every table (destructive),
> then creates ~17 demo accounts that all share one known dev password (`KeepSecret@123`).
> Running it in production would wipe any real data and expose insecure shared credentials.
> Schema is applied with `prisma migrate deploy` (never `reset` / `db push`).

---

## 2. Backend project (Root Directory: `backend`)

The backend is a conventional Express server. A thin serverless adapter was added at
`backend/api/index.ts` (exports `createApp()`) so Vercel can host it via `@vercel/node`.

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Framework Preset | Other (`@vercel/node` via `backend/vercel.json`) |
| Install Command | `npm install` |
| Build Command | `npx prisma generate && npm run build` |
| Output Directory | (managed by `@vercel/node`) |

### Backend environment variables

Set these in the Vercel project's Environment Variables. **Never commit real values.**

| Variable | Value / note |
|----------|--------------|
| `DATABASE_URL` | Neon connection string (rotated credential) |
| `PORT` | `4000` (unused by serverless, harmless) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | **New, strong, random value** (regenerate — old may be exposed) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://app.yourdomain.com` (CORS is locked to this) |
| `COOKIE_SECURE` | `true` |
| `STORAGE_DRIVER` | `local` |
| `STORAGE_LOCAL_DIR` | `uploads` |
| `STORAGE_BASE_URL` | `https://api.yourdomain.com/uploads` |

> **Vercel limitation — file uploads:** Vercel serverless functions are stateless/ephemeral.
> `STORAGE_DRIVER=local` writes to the function's filesystem, which does **not** persist across
> invocations or instances. Uploaded files will not survive between requests/instances. For
> durable uploads you must implement an S3-compatible `StorageService` (per README §13) — the
> app/business logic is already designed for that swap.

---

## 3. Frontend project (Root Directory: `frontend`)

Standard Vite/React SPA. `frontend/vercel.json` provides the SPA fallback rewrite.

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework Preset | Vite (auto-detected) |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Frontend environment variable

| Variable | Value / note |
|----------|--------------|
| `VITE_API_URL` | `https://api.yourdomain.com` (backend origin). Only `VITE_*` is exposed to the browser. **No secrets here.** |

The browser calls `https://api.yourdomain.com/api/...` directly, so `SameSite=Lax` cookies set
by the backend are sent normally (same site). No `/api` rewrite is needed in the frontend.

---

## 4. Custom domains

1. Add `app.yourdomain.com` → frontend Vercel project.
2. Add `api.yourdomain.com` → backend Vercel project.
3. Point DNS records as Vercel instructs (usually a CNAME to `cname.vercel-dns.com`).
4. Both must resolve to HTTPS (Vercel provisions certs automatically).

---

## 5. After deploy — smoke test

```
https://api.yourdomain.com/api/health          → {"success":true,...}
https://app.yourdomain.com                     → login page renders
admin login (manually created admin)           → dashboard loads, cookie set on api subdomain
```

---

## 6. Git / secrets checklist

- `.env`, `*.env`, `node_modules`, `dist/`, `*.tsbuildinfo`, `.npm-cache/` are all gitignored.
- Real `DATABASE_URL` / `JWT_SECRET` values live only in Vercel env vars, never in the repo.
- Never put backend secrets (DB, JWT) in frontend env vars — only `VITE_API_URL`.
