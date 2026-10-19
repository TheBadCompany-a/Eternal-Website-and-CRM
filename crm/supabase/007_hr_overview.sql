-- HR overview: daily attendance and leave requests.
-- Run after 006_platform_expansion.sql.
--
-- Model: every staff member can read the HR data and record/request for
-- themselves; only HR and admins can write for others or decide leave.

create or replace function public.is_hr_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and app_role in ('admin', 'hr')
  );
$$;

revoke execute on function public.is_hr_or_admin() from public, anon;
grant execute on function public.is_hr_or_admin() to authenticated;

create table if not exists public.hr_attendance (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null default current_date,
  status text not null default 'Present' check (status in ('Present', 'Half day', 'Absent', 'On leave')),
  check_in timestamptz,
  check_out timestamptz,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (profile_id, work_date)
);

create table if not exists public.hr_leave_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null default 'Casual' check (leave_type in ('Casual', 'Sick', 'Earned', 'Unpaid', 'Other')),
  start_date date not null,
  end_date date not null,
  reason text not null default '',
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists idx_hr_attendance_date on public.hr_attendance(work_date);
create index if not exists idx_hr_leave_status on public.hr_leave_requests(status);

alter table public.hr_attendance enable row level security;
alter table public.hr_leave_requests enable row level security;

revoke all on public.hr_attendance, public.hr_leave_requests from anon;
grant select, insert, update on public.hr_attendance to authenticated;
grant select, insert, update on public.hr_leave_requests to authenticated;

drop policy if exists "staff can read attendance" on public.hr_attendance;
create policy "staff can read attendance" on public.hr_attendance for select to authenticated
  using (profile_id = (select auth.uid()) or public.is_hr_or_admin());

drop policy if exists "own or hr can record attendance" on public.hr_attendance;
create policy "own or hr can record attendance" on public.hr_attendance for insert to authenticated
  with check (profile_id = (select auth.uid()) or public.is_hr_or_admin());

drop policy if exists "own or hr can update attendance" on public.hr_attendance;
create policy "own or hr can update attendance" on public.hr_attendance for update to authenticated
  using (profile_id = (select auth.uid()) or public.is_hr_or_admin())
  with check (profile_id = (select auth.uid()) or public.is_hr_or_admin());

drop policy if exists "staff can read leave" on public.hr_leave_requests;
create policy "staff can read leave" on public.hr_leave_requests for select to authenticated
  using (profile_id = (select auth.uid()) or public.is_hr_or_admin());

-- Staff may only file a Pending request for themselves; HR/admin may file for anyone.
drop policy if exists "staff can request leave" on public.hr_leave_requests;
create policy "staff can request leave" on public.hr_leave_requests for insert to authenticated
  with check (
    public.is_hr_or_admin()
    or (profile_id = (select auth.uid()) and status = 'Pending' and decided_by is null)
  );

drop policy if exists "hr decides leave" on public.hr_leave_requests;
create policy "hr decides leave" on public.hr_leave_requests for update to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());
