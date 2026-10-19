-- Admin-only credentials. Secrets are encrypted in Supabase Vault; the table holds only label/username/link/notes.
create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null default 'Other',
  username text, url text, notes text,
  vault_secret_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.credentials enable row level security;
revoke all on public.credentials from anon, authenticated;
grant select on public.credentials to authenticated;
create policy "admins read credentials" on public.credentials for select to authenticated using (public.is_admin());
-- Functions credential_create / credential_update / credential_reveal / credential_delete
-- (all SECURITY DEFINER, admin-only, reveal/save/change/delete are written to activity_log)
-- were applied as migration "admin_credentials_vault"; see the Supabase migration history for the full body.
-- staff_logins(): admin-only list of every staff member's login email/role (applied as migration "admin_staff_logins_list").
