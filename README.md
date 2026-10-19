# Eternal Repos: Website and CRM

- `website/` is the public website (Vite, React, Tailwind).
- `crm/` is the staff CRM (Vite, React, Supabase). Database migrations are in `crm/supabase/`.

Each folder is its own app: run `npm install` and `npm run dev` inside it.
In the CRM, copy `.env.local.example` to `.env.local` and fill in the Supabase URL and anon key.
