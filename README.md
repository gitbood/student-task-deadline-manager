# Student Task & Deadline Manager

Beginner-friendly web app to manage:
- user accounts (register/login)
- courses
- assignments with due dates, priority, and status
- dashboard sections for upcoming, overdue, and completed work
- assignment filters by course, status, and priority

## Tech Stack
- Next.js (App Router + TypeScript)
- Prisma ORM + SQLite
- NextAuth (Credentials provider)
- bcrypt password hashing
- Zod validation
- Tailwind CSS
- Vitest (unit + minimal integration-style tests)

## Prerequisites
- Node.js `18.19+` (or newer)
- npm

## Setup
1. Install dependencies
```bash
npm install
```

2. Create env file
```bash
cp .env.example .env
```

3. Set a secure auth secret in `.env`
```env
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

4. Run Prisma migration (creates SQLite DB)
```bash
npm run prisma:migrate -- --name init
```

5. Seed demo users (idempotent)
```bash
npm run db:seed
```

6. Start the app
```bash
npm run dev
```

Open `http://localhost:3000`.

## Default Environment Variables
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
DEMO_PASSWORD="DemoPass123!"
```

## Available Scripts
- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm test` - run Vitest tests
- `npm run build` - production build check
- `npm run db:seed` - create/update local demo accounts
- `npm run prisma:migrate -- --name <name>` - create/apply Prisma migration
- `npm run prisma:generate` - regenerate Prisma client
- `npm run prisma:studio` - open Prisma Studio

## Test Coverage Included
- Unit: upcoming/overdue date logic
- Integration-style: create assignment and mark it done in DB

## Auth + Data Safety Notes
- Protected pages: `/dashboard`, `/courses`, `/courses/[id]`
- All course/assignment queries and mutations are scoped to the current user ID
- Passwords are hashed with `bcryptjs` before storage

## Test Accounts
Demo accounts are for local development only. Change `DEMO_PASSWORD` in `.env.local`.

| Email | Password | Role | Notes |
| --- | --- | --- | --- |
| `admin@demo.local` | `DEMO_PASSWORD` (default local fallback: `DemoPass123!`) | `ADMIN` | Can sign in as demo admin. Role is visible on Dashboard and in session/JWT. |
| `student@demo.local` | `DEMO_PASSWORD` (default local fallback: `DemoPass123!`) | `STUDENT` | Can sign in as demo student. Role is visible on Dashboard and in session/JWT. |

## Main Routes
- `/auth/register`
- `/auth/login`
- `/dashboard`
- `/courses`
- `/courses/[id]`
