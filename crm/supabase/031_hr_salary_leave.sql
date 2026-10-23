-- HR salary records and yearly paid-leave allowance.
-- Run after 007_hr_overview.sql.
--
-- Model: HR and admins manage everything; each staff member can read only their own row.

create table if not exists public.hr_salary (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  monthly_salary numeric(12,2) not null default 0 check (monthly_salary >= 0),
  paid_leave_quota integer not null default 12 check (paid_leave_quota >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.hr_salary_payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  pay_month text not null check (pay_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Paid')),
  paid_on date,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (profile_id, pay_month)
);

alter table public.hr_salary enable row level security;
alter table public.hr_salary_payments enable row level security;

revoke all on public.hr_salary, public.hr_salary_payments from anon;
grant select, insert, update on public.hr_salary, public.hr_salary_payments to authenticated;

drop policy if exists "own or hr can read salary" on public.hr_salary;
create policy "own or hr can read salary" on public.hr_salary for select to authenticated
  using (profile_id = (select auth.uid()) or public.is_hr_or_admin());
drop policy if exists "hr writes salary" on public.hr_salary;
create policy "hr writes salary" on public.hr_salary for insert to authenticated with check (public.is_hr_or_admin());
drop policy if exists "hr updates salary" on public.hr_salary;
create policy "hr updates salary" on public.hr_salary for update to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

drop policy if exists "own or hr can read payments" on public.hr_salary_payments;
create policy "own or hr can read payments" on public.hr_salary_payments for select to authenticated
  using (profile_id = (select auth.uid()) or public.is_hr_or_admin());
drop policy if exists "hr writes payments" on public.hr_salary_payments;
create policy "hr writes payments" on public.hr_salary_payments for insert to authenticated with check (public.is_hr_or_admin());
drop policy if exists "hr updates payments" on public.hr_salary_payments;
create policy "hr updates payments" on public.hr_salary_payments for update to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());
