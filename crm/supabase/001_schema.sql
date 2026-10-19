-- Eternal Repos CRM — core schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Run 001, then 002, then 003, in order, in a NEW/DEDICATED Supabase project
-- for the CRM (do not run this against the public website's project).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums (mirror the TypeScript unions in src/types/index.ts exactly)
-- ---------------------------------------------------------------------------

do $$ begin
  create type app_role as enum ('admin', 'coordinator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type need_category as enum (
    'Immediate Arrangement', 'Planned Arrangement', 'Transfer / Transportation', 'Not Sure — Guide Me'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type arrangement_status as enum (
    'New Inquiry', 'Contacted', 'Plan Review', 'Quotation', 'Confirmed', 'In Execution', 'Completed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type quotation_status as enum ('Draft', 'Sent', 'Viewed', 'Approved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum (
    'Estimate', 'Final Amount', 'Payment Requested', 'Payment Received', 'Receipt Generated', 'Advance Received'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type vehicle_status as enum ('On Duty', 'Available', 'Under Maintenance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comm_channel as enum ('WhatsApp', 'Call', 'SMS', 'Email');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles — one row per staff login (auth.users), the RBAC role lives here.
-- NOTE: app_role (admin/coordinator) is the PERMISSION role. job_title
-- (e.g. "Hearse Pilot") is just a display string — do not confuse the two.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  app_role    app_role not null default 'coordinator',
  full_name   text not null default '',
  job_title   text not null default '',
  phone       text,
  duty_status text not null default 'Available' check (duty_status in ('On Duty', 'Available', 'Off Duty')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- arrangements — the core case/booking entity, and the lead/arrangement
-- lifecycle backbone (status). Server-generated id (see function below),
-- server-computed audit trail (see 002), soft-delete only (deleted_at).
-- ---------------------------------------------------------------------------

create sequence if not exists public.arrangement_ref_seq;

create or replace function public.generate_arrangement_id()
returns text
language sql
set search_path = public
as $$
  select 'ER-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.arrangement_ref_seq')::text, 3, '0');
$$;

create table if not exists public.arrangements (
  id                       text primary key default public.generate_arrangement_id(),
  family                   text not null,
  contact_name             text not null,
  phone                    text not null,
  email                    text,
  relationship             text,
  deceased_name            text,
  service_type             text not null,
  need_category            need_category not null,
  pickup_location          text not null,
  destination_location     text not null,
  service_date             date not null,
  service_time             text not null,
  distance_km              numeric(6, 2),
  est_duration             text,
  services                 text[] not null default '{}',
  notes                    text not null default '',
  status                   arrangement_status not null default 'New Inquiry',
  paid_amount              numeric(10, 2) not null default 0 check (paid_amount >= 0),
  payment_method           text,
  payment_status           payment_status not null default 'Estimate',
  coordinator_id           uuid references public.profiles(id),
  driver                   text,
  vehicle                  text,
  support_staff            text[] not null default '{}',

  checklist_vehicle_available              boolean not null default false,
  checklist_vehicle_cleaned                boolean not null default false,
  checklist_equipment_ready                boolean not null default false,
  checklist_driver_assigned                boolean not null default false,
  checklist_destination_confirmed          boolean not null default false,
  checklist_customer_contacted             boolean not null default false,
  checklist_docs_checked                   boolean not null default false,
  checklist_additional_services_confirmed  boolean not null default false,

  field_execution_stage    smallint not null default 1 check (field_execution_stage between 1 and 5),
  customer_tracking_stage  smallint not null default 1 check (customer_tracking_stage between 1 and 6),

  access_token             uuid not null default gen_random_uuid() unique,
  created_by               uuid references auth.users(id),
  deleted_at               timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_arrangements_status on public.arrangements(status);
create index if not exists idx_arrangements_coordinator on public.arrangements(coordinator_id);
create index if not exists idx_arrangements_created_at on public.arrangements(created_at desc);
create index if not exists idx_arrangements_not_deleted on public.arrangements(id) where deleted_at is null;
create index if not exists idx_arrangements_created_by on public.arrangements(created_by);

grant usage on sequence public.arrangement_ref_seq to anon, authenticated;
grant execute on function public.generate_arrangement_id() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- quotations — 1:1 with arrangements. total is server-computed (never
-- trust a client-submitted total).
-- ---------------------------------------------------------------------------

create table if not exists public.quotations (
  arrangement_id       text primary key references public.arrangements(id) on delete cascade,
  vehicle              numeric(10, 2) not null default 0,
  distance             numeric(10, 2) not null default 0,
  staff                numeric(10, 2) not null default 0,
  additional_services  numeric(10, 2) not null default 0,
  florals              numeric(10, 2) not null default 0,
  rituals              numeric(10, 2) not null default 0,
  waiting_charges      numeric(10, 2) not null default 0,
  other                numeric(10, 2) not null default 0,
  total                numeric(10, 2) generated always as (
                          vehicle + distance + staff + additional_services + florals + rituals + waiting_charges + other
                        ) stored,
  status               quotation_status not null default 'Draft',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- feedback — 1:1 optional with arrangements.
-- ---------------------------------------------------------------------------

create table if not exists public.feedback (
  arrangement_id  text primary key references public.arrangements(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 5),
  comment         text,
  status          text not null default 'Submitted',
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- arrangement_status_history — the audit trail. Populated ONLY by trigger
-- (see 002) — no client ever writes to this table directly.
-- ---------------------------------------------------------------------------

create table if not exists public.arrangement_status_history (
  id             bigserial primary key,
  arrangement_id text not null references public.arrangements(id) on delete cascade,
  from_status    arrangement_status,
  to_status      arrangement_status not null,
  changed_by     uuid references auth.users(id),
  changed_at     timestamptz not null default now()
);

create index if not exists idx_status_history_arrangement
  on public.arrangement_status_history(arrangement_id, changed_at desc);
create index if not exists idx_arrangement_status_history_changed_by
  on public.arrangement_status_history(changed_by);

-- ---------------------------------------------------------------------------
-- callbacks — public priority-callback requests + staff handling.
-- ---------------------------------------------------------------------------

create table if not exists public.callbacks (
  id           uuid primary key default gen_random_uuid(),
  family       text not null,
  phone        text not null,
  waiting_mins int not null default 1,
  reason       text,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- fleet — internal only. assigned_case_id is a loose text reference (not an
-- FK) since it mirrors today's free-text "—"/case-id field.
-- ---------------------------------------------------------------------------

create table if not exists public.fleet (
  id               uuid primary key default gen_random_uuid(),
  model            text not null,
  reg              text not null unique,
  type             text,
  status           vehicle_status not null default 'Available',
  assigned_case_id text,
  driver           text,
  location         text,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- communications — immutable message log per arrangement.
-- ---------------------------------------------------------------------------

create table if not exists public.communications (
  id             uuid primary key default gen_random_uuid(),
  arrangement_id text not null references public.arrangements(id) on delete cascade,
  channel        comm_channel not null,
  sender         text not null,
  body           text not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_communications_arrangement on public.communications(arrangement_id, created_at desc);
