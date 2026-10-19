-- Platform expansion: roles, sensitive lead controls, driver operations,
-- sales configuration, shared customer sessions, and management reporting data.
-- Run after 005_lead_attribution.sql.

alter type public.app_role add value if not exists 'sales';
alter type public.app_role add value if not exists 'accounts';
alter type public.app_role add value if not exists 'hr';
alter type public.app_role add value if not exists 'operations';
alter type public.app_role add value if not exists 'driver';

alter table public.arrangements
  add column if not exists customer_classification text not null default 'New customer',
  add column if not exists priority text not null default 'Standard',
  add column if not exists is_sensitive boolean not null default false,
  add column if not exists booking_status text not null default 'Inquiry',
  add column if not exists next_follow_up_at timestamptz;

do $$ begin
  alter table public.arrangements add constraint arrangements_customer_classification_check
    check (customer_classification in ('New customer', 'Returning customer', 'Corporate', 'Partner referral', 'VIP'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.arrangements add constraint arrangements_priority_check
    check (priority in ('Standard', 'High', 'Urgent'));
exception when duplicate_object then null; end $$;

create table if not exists public.lead_access (
  arrangement_id text not null references public.arrangements(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (arrangement_id, profile_id)
);

create or replace function public.can_access_arrangement(p_arrangement_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.arrangements a
    where a.id = p_arrangement_id
      and (not a.is_sensitive or public.is_admin() or exists (
        select 1 from public.lead_access la where la.arrangement_id = a.id and la.profile_id = auth.uid()
      ))
  );
$$;

revoke execute on function public.can_access_arrangement(text) from public, anon;
grant execute on function public.can_access_arrangement(text) to authenticated;

alter table public.lead_access enable row level security;
revoke all on public.lead_access from anon;
grant select, insert, delete on public.lead_access to authenticated;
drop policy if exists "staff can view own lead access" on public.lead_access;
create policy "staff can view own lead access" on public.lead_access for select to authenticated using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "admins manage sensitive lead access" on public.lead_access;
create policy "admins manage sensitive lead access" on public.lead_access for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Replace the broad arrangement policies from 003 with sensitive-lead aware policies.
drop policy if exists "staff can read arrangements" on public.arrangements;
create policy "staff can read permitted arrangements" on public.arrangements for select to authenticated using (deleted_at is null and public.can_access_arrangement(id));
drop policy if exists "staff can update arrangements" on public.arrangements;
create policy "staff can update permitted arrangements" on public.arrangements for update to authenticated using (deleted_at is null and public.can_access_arrangement(id)) with check (public.can_access_arrangement(id));

create table if not exists public.driver_tasks (
  id uuid primary key default gen_random_uuid(),
  arrangement_id text not null references public.arrangements(id) on delete cascade,
  driver_id uuid references public.profiles(id),
  status text not null default 'Assigned' check (status in ('Assigned', 'Accepted', 'En route to pickup', 'Arrived', 'Picked up', 'Completed')),
  pickup_lat numeric(9,6), pickup_lng numeric(9,6),
  arrival_at timestamptz, pickup_confirmed_at timestamptz, completed_at timestamptz,
  attendance_confirmed_at timestamptz, last_location_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (arrangement_id)
);

create table if not exists public.driver_task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.driver_tasks(id) on delete cascade,
  status text not null, note text,
  latitude numeric(9,6), longitude numeric(9,6),
  created_at timestamptz not null default now()
);

create table if not exists public.driver_expenses (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.driver_tasks(id) on delete cascade,
  category text not null, amount numeric(10,2) not null check (amount >= 0),
  note text, receipt_url text, submitted_at timestamptz not null default now(), approved_at timestamptz
);

create table if not exists public.service_catalog (
  id uuid primary key default gen_random_uuid(), name text not null, category text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0), active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.package_configurations (
  id uuid primary key default gen_random_uuid(),
  arrangement_id text references public.arrangements(id) on delete set null,
  created_by uuid references public.profiles(id), customer_name text not null default '',
  status text not null default 'Draft' check (status in ('Draft', 'Shared', 'Accepted', 'Converted')),
  shared_token uuid not null default gen_random_uuid() unique,
  total numeric(10,2) not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.package_configuration_items (
  id uuid primary key default gen_random_uuid(), configuration_id uuid not null references public.package_configurations(id) on delete cascade,
  service_id uuid references public.service_catalog(id), label text not null, quantity integer not null default 1 check (quantity > 0), unit_price numeric(10,2) not null default 0
);

alter table public.driver_tasks enable row level security;
alter table public.driver_task_updates enable row level security;
alter table public.driver_expenses enable row level security;
alter table public.service_catalog enable row level security;
alter table public.package_configurations enable row level security;
alter table public.package_configuration_items enable row level security;

grant select, insert, update on public.driver_tasks, public.driver_task_updates, public.driver_expenses, public.service_catalog, public.package_configurations, public.package_configuration_items to authenticated;
drop policy if exists "staff can read driver tasks" on public.driver_tasks;
create policy "staff can read driver tasks" on public.driver_tasks for select to authenticated using (true);
drop policy if exists "staff can manage driver tasks" on public.driver_tasks;
create policy "staff can manage driver tasks" on public.driver_tasks for all to authenticated using (true) with check (true);
drop policy if exists "staff can read driver updates" on public.driver_task_updates;
create policy "staff can read driver updates" on public.driver_task_updates for select to authenticated using (true);
drop policy if exists "staff can manage driver updates" on public.driver_task_updates;
create policy "staff can manage driver updates" on public.driver_task_updates for all to authenticated using (true) with check (true);
drop policy if exists "staff can read driver expenses" on public.driver_expenses;
create policy "staff can read driver expenses" on public.driver_expenses for select to authenticated using (true);
drop policy if exists "staff can manage driver expenses" on public.driver_expenses;
create policy "staff can manage driver expenses" on public.driver_expenses for all to authenticated using (true) with check (true);
drop policy if exists "staff can read catalog" on public.service_catalog;
create policy "staff can read catalog" on public.service_catalog for select to authenticated using (true);
drop policy if exists "staff can manage catalog" on public.service_catalog;
create policy "staff can manage catalog" on public.service_catalog for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "staff can read configurations" on public.package_configurations;
create policy "staff can read configurations" on public.package_configurations for select to authenticated using (true);
drop policy if exists "staff can manage configurations" on public.package_configurations;
create policy "staff can manage configurations" on public.package_configurations for all to authenticated using (true) with check (true);
drop policy if exists "staff can read configuration items" on public.package_configuration_items;
create policy "staff can read configuration items" on public.package_configuration_items for select to authenticated using (true);
drop policy if exists "staff can manage configuration items" on public.package_configuration_items;
create policy "staff can manage configuration items" on public.package_configuration_items for all to authenticated using (true) with check (true);

drop trigger if exists set_updated_at on public.driver_tasks;
create trigger set_updated_at before update on public.driver_tasks for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.package_configurations;
create trigger set_updated_at before update on public.package_configurations for each row execute function public.set_updated_at();

create index if not exists idx_driver_tasks_driver_status on public.driver_tasks(driver_id, status);
create index if not exists idx_driver_updates_task_created on public.driver_task_updates(task_id, created_at desc);
create index if not exists idx_package_configurations_token on public.package_configurations(shared_token);
