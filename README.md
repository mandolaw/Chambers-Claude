# Chambers

A daily rule-of-life, prayer, and brotherhood app for men, built around the desert fathers' discipline of *praktike*. Next.js (App Router) + TypeScript, deployable to Vercel with zero config.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm run start
```

## Deploy

This is a standard Next.js app — push to GitHub and import the repo at https://vercel.com/new. No environment variables or build settings are required for the current version.

## Current state

All app data (rule-of-life progress, brothers, prayer log, journal, notification preferences) is stored in the browser via `localStorage`, namespaced per-device by a generated UUID. There is no backend, no accounts, and no cross-device sync yet — data does not follow a user between browsers or devices, and clearing site data or reinstalling erases it. See project notes for the plan to add real accounts and sync.
