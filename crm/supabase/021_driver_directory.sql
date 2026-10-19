-- Drivers who can be assigned to a case, even before they have a CRM login.
-- Run after 020_role_backend_executive.sql.
create table if not exists public.driver_directory (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  phone      text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.driver_directory enable row level security;
revoke all on public.driver_directory from anon;
grant select, insert, update on public.driver_directory to authenticated;
drop policy if exists "staff can read driver directory" on public.driver_directory;
create policy "staff can read driver directory" on public.driver_directory for select to authenticated using (true);
drop policy if exists "admins manage driver directory" on public.driver_directory;
create policy "admins manage driver directory" on public.driver_directory for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Dummy drivers for testing; replace with your real drivers.
insert into public.driver_directory (name) values
  ('Ramesh Kumar'), ('Suresh Yadav'), ('Mahesh Singh'), ('Anil Sharma'), ('Deepak Verma')
on conflict (name) do nothing;
