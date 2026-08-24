# Chambers

A daily rule-of-life, prayer, and brotherhood app for men, built around the desert fathers' discipline of *praktike*. Next.js (App Router) + TypeScript + Prisma/Postgres, deployable to Vercel.

## Local development

Requires a Postgres database.

```bash
cp .env.example .env      # fill in DATABASE_URL and AUTH_SECRET
npm install
npx prisma migrate dev    # creates tables
npm run dev
```

Open http://localhost:3000. Generate an `AUTH_SECRET` with `openssl rand -base64 32`.

## Build

```bash
npm run build
npm run start
```

## Deploy

Push to GitHub and import the repo at https://vercel.com/new — Next.js is auto-detected, no build config needed. Before the first deploy, set two environment variables in the Vercel project settings:

- `DATABASE_URL` — a Postgres connection string (Vercel Postgres, Neon, and Supabase all work; add the integration from the Vercel dashboard and it fills this in for you).
- `AUTH_SECRET` — output of `openssl rand -base64 32`.

Then run the migration against that database once (`npx prisma migrate deploy`, with `DATABASE_URL` pointed at production) so the tables exist before anyone signs up.

## Current state

Two tiers of data:

- **Personal devotional data** (rule-of-life progress, prayer log, journal, notification preferences) stays in the browser via `localStorage`, namespaced per-device. It does not sync across devices or survive clearing site data — by design, for now.
- **Brotherhood** (accounts, Cells, check-ins, the Cell feed, and personal contacts like a pastor) is real, server-backed state via Postgres + Prisma, with email/password accounts (Auth.js). A Cell is created or joined with a 6-character invite code; every member sees real check-ins and posts from every other member.

Next likely step: move personal devotional data to the same account system so it follows a signed-in user across devices too.
