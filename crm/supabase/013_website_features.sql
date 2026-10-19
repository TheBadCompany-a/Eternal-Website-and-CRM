-- Website -> CRM features: UPI payment claims, lead tagging by form with an
-- automatic first follow-up, and Name a Star tributes with staff moderation.
-- Run after 012_public_sky_stars.sql.

-- ---------------------------------------------------------------------------
-- 1. Payment claims: a family pays by UPI (QR) and reports it with the UTR /
--    transaction reference. Staff verify it against the bank and record it.
-- ---------------------------------------------------------------------------
create table if not exists public.payment_claims (
  id              uuid primary key default gen_random_uuid(),
  arrangement_id  text not null references public.arrangements(id),
  amount          numeric not null check (amount > 0),
  utr             text not null check (char_length(utr) between 6 and 40),
  status          text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at      timestamptz not null default now()
);
create index if not exists idx_payment_claims_arrangement on public.payment_claims(arrangement_id);

alter table public.payment_claims enable row level security;
revoke all on public.payment_claims from anon;
grant select, update on public.payment_claims to authenticated;
drop policy if exists "staff can read payment claims" on public.payment_claims;
create policy "staff can read payment claims" on public.payment_claims for select to authenticated using (true);
drop policy if exists "staff can update payment claims" on public.payment_claims;
create policy "staff can update payment claims" on public.payment_claims for update to authenticated using (true) with check (true);

create or replace function public.report_payment_claim(p_ref text, p_amount numeric, p_utr text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.arrangements where id = p_ref and deleted_at is null) then
    raise exception 'Unknown booking reference';
  end if;
  insert into public.payment_claims (arrangement_id, amount, utr) values (p_ref, p_amount, trim(p_utr));
end;
$$;
revoke all on function public.report_payment_claim(text, numeric, text) from public;
grant execute on function public.report_payment_claim(text, numeric, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Lead tagging by website form + automatic first follow-up (2 hours).
--    lead_campaign carries the form name so Leads can be filtered by it.
-- ---------------------------------------------------------------------------
create or replace function public.create_website_lead(
  p_form text,
  p_name text,
  p_phone text,
  p_email text,
  p_service text,
  p_message text,
  p_services text[],
  p_relationship text,
  p_deceased text,
  p_date date
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
begin
  insert into public.arrangements (
    family, contact_name, phone, email, relationship, deceased_name,
    service_type, need_category, pickup_location, destination_location,
    service_date, service_time, services, notes, lead_source, lead_campaign, next_follow_up_at
  ) values (
    split_part(coalesce(nullif(p_name, ''), 'Website Enquiry'), ' ', 1) || ' Family',
    coalesce(nullif(p_name, ''), 'Website Enquiry'),
    coalesce(nullif(p_phone, ''), '+91 9XXXXXXXXX'),
    nullif(p_email, ''),
    coalesce(nullif(p_relationship, ''), 'Enquirer'),
    coalesce(p_deceased, ''),
    coalesce(nullif(p_service, ''), 'Website Enquiry'),
    'Not Sure — Guide Me', 'To be confirmed', 'To be confirmed',
    coalesce(p_date, current_date), 'To be confirmed',
    coalesce(p_services, '{}'), coalesce(p_message, ''),
    'Website', left(coalesce(nullif(p_form, ''), 'Website form'), 80),
    now() + interval '2 hours'
  )
  returning arrangements.id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_website_lead(text, text, text, text, text, text, text[], text, text, date) from public;
grant execute on function public.create_website_lead(text, text, text, text, text, text, text[], text, text, date) to anon, authenticated;

-- The Arrange-a-Service wizard (same signature as before): tag it and set a follow-up.
create or replace function public.create_public_booking(
  p_family text,
  p_contact_name text,
  p_phone text,
  p_email text,
  p_relationship text,
  p_deceased_name text,
  p_service_type text,
  p_need_category need_category,
  p_pickup_location text,
  p_destination_location text,
  p_service_date date,
  p_service_time text,
  p_services text[],
  p_notes text
)
returns table (id text, access_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
  v_token uuid;
begin
  insert into public.arrangements (
    family, contact_name, phone, email, relationship, deceased_name,
    service_type, need_category, pickup_location, destination_location,
    service_date, service_time, services, notes, lead_source, lead_campaign, next_follow_up_at
  ) values (
    p_family, p_contact_name, p_phone, p_email, p_relationship, p_deceased_name,
    p_service_type, p_need_category, p_pickup_location, p_destination_location,
    p_service_date, p_service_time, coalesce(p_services, '{}'), coalesce(p_notes, ''),
    'Website', 'Arrange a Service wizard', now() + interval '2 hours'
  )
  returning arrangements.id, arrangements.access_token into v_id, v_token;

  return query select v_id, v_token;
end;
$$;

-- Book a Star (same signature as 011): tag the lead and set a follow-up.
create or replace function public.create_star_booking(
  p_requester_name text,
  p_phone text,
  p_email text,
  p_name text,
  p_relationship text,
  p_about text,
  p_birth_date date,
  p_death_date date,
  p_photo_path text,
  p_lead_source text default 'Website'
)
returns table (id uuid, arrangement_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_arr text;
  v_id uuid;
  v_source text := 'Website';
begin
  if auth.role() = 'authenticated' and p_lead_source is not null then
    v_source := p_lead_source;
  end if;

  insert into public.arrangements (
    family, contact_name, phone, email, relationship, deceased_name,
    service_type, need_category, pickup_location, destination_location,
    service_date, service_time, services, notes, lead_source, lead_campaign, next_follow_up_at
  ) values (
    split_part(p_requester_name, ' ', 1) || ' Family', p_requester_name, p_phone, p_email,
    coalesce(nullif(p_relationship, ''), 'Next of Kin'), p_name,
    'Book a Star — Signature Farewell', 'Not Sure — Guide Me', 'To be confirmed', 'To be confirmed',
    coalesce(p_death_date, current_date), 'To be confirmed', '{}',
    'Book a Star request for ' || p_name, v_source, 'Book a Star', now() + interval '2 hours'
  )
  returning arrangements.id into v_arr;

  insert into public.star_bookings (
    arrangement_id, name, relationship, about, birth_date, death_date, photo_path,
    requester_name, requester_phone, owner_email
  ) values (
    v_arr, p_name, nullif(p_relationship, ''), nullif(p_about, ''), p_birth_date, p_death_date, p_photo_path,
    p_requester_name, p_phone, lower(p_email)
  )
  returning star_bookings.id into v_id;

  return query select v_id, v_arr;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Name a Star tributes, moderated by staff in the CRM.
-- ---------------------------------------------------------------------------
create table if not exists public.tributes (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  name              text not null check (char_length(name) between 1 and 80),
  born_year         int check (born_year between 1800 and 2100),
  passed_year       int check (passed_year between 1800 and 2100),
  message           text check (char_length(message) <= 400),
  photo_path        text,
  submitter_name    text not null check (char_length(submitter_name) between 1 and 80),
  submitter_contact text not null check (char_length(submitter_contact) between 5 and 120),
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz not null default now()
);
alter table public.tributes enable row level security;
revoke all on public.tributes from anon;
grant select, update on public.tributes to authenticated;
drop policy if exists "staff can read tributes" on public.tributes;
create policy "staff can read tributes" on public.tributes for select to authenticated using (true);
drop policy if exists "staff can update tributes" on public.tributes;
create policy "staff can update tributes" on public.tributes for update to authenticated using (true) with check (true);

create or replace function public.submit_tribute(
  p_slug text, p_name text, p_born_year int, p_passed_year int, p_message text,
  p_photo_path text, p_submitter_name text, p_submitter_contact text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.tributes (slug, name, born_year, passed_year, message, photo_path, submitter_name, submitter_contact)
  values (p_slug, p_name, p_born_year, p_passed_year, nullif(p_message, ''), p_photo_path, p_submitter_name, p_submitter_contact);
$$;
revoke all on function public.submit_tribute(text, text, int, int, text, text, text, text) from public;
grant execute on function public.submit_tribute(text, text, int, int, text, text, text, text) to anon, authenticated;

create or replace function public.list_approved_tributes()
returns table (id uuid, slug text, name text, born_year int, passed_year int, message text, photo_path text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select t.id, t.slug, t.name, t.born_year, t.passed_year, t.message, t.photo_path, t.created_at
  from public.tributes t where t.status = 'approved' order by t.created_at asc limit 80;
$$;
revoke all on function public.list_approved_tributes() from public;
grant execute on function public.list_approved_tributes() to anon, authenticated;

create or replace function public.get_approved_tribute(p_slug text)
returns table (id uuid, slug text, name text, born_year int, passed_year int, message text, photo_path text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select t.id, t.slug, t.name, t.born_year, t.passed_year, t.message, t.photo_path, t.created_at
  from public.tributes t where t.status = 'approved' and t.slug = p_slug limit 1;
$$;
revoke all on function public.get_approved_tribute(text) from public;
grant execute on function public.get_approved_tribute(text) to anon, authenticated;

do $$ begin
  alter publication supabase_realtime add table public.payment_claims;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.tributes;
exception when duplicate_object then null; end $$;
