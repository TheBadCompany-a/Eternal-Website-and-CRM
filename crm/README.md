# Eternal Repos — Internal Operations CRM

Staff-only CRM for Eternal Repos: public booking wizard + internal Operations CRM (arrangements, quotations, payments, fleet, team, communications), backed by Supabase (Postgres + Auth + RLS + Realtime).

## Stack
Vite + React 19 + TypeScript + React Router + TanStack Query + Supabase.

## Develop
```
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

## Backend setup
See `supabase/` — run `001_schema.sql`, `002_functions_triggers.sql`, `003_rls_policies.sql` (in order) in your Supabase project's SQL Editor, then create your own login via Dashboard → Authentication → Add User and promote yourself to admin per `supabase/004_bootstrap_admin.sql.example`. Optional demo data: `supabase/999_seed_demo_data.sql`.

## Build
```
npm run build   # tsc && vite build -> dist/
```

## Deploy
Vercel project, auto-builds on push to `main`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in the Vercel project settings (Project → Settings → Environment Variables) — these are not committed to git.

In the combined `Eternal-Website-and-CRM` repo this CRM lives in `crm/`, so the CRM Vercel project must have its Root Directory set to `crm`.
