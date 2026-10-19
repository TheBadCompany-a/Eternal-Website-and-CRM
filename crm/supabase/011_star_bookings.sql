-- "Book a Star" bookings. Requests from the website form land here (via
-- create_star_booking) together with a matching CRM lead (arrangement), so
-- staff can follow up, record payment against the lead, and activate the star.
-- Staff can also enter a star by hand from the CRM's Stars screen.
-- Run after 010_website_lead_source.sql.

create table if not exists public.star_bookings (
  id              uuid primary key default gen_random_uuid(),
  arrangement_id  text references public.arrangements(id),
  name            text not null check (char_length(name) between 1 and 80),
  relationship    text check (char_length(relationship) <= 60),
  about           text check (char_length(about) <= 2000),
  birth_date      date,
  death_date      date,
  photo_path      text,
  requester_name  text not null check (char_length(requester_name) between 1 and 80),
  requester_phone text not null check (char_length(requester_phone) between 5 and 20),
  owner_email     text not null check (owner_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  slug            text unique check (slug is null or slug ~ '^[a-z0-9-]{3,80}$'),
  status          text not null default 'requested' check (status in ('requested', 'active', 'rejected')),
  notes           text check (char_length(notes) <= 1000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_star_bookings_arrangement on public.star_bookings(arrangement_id);

create or replace function public.touch_star_bookings_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.touch_star_bookings_updated_at() from public, anon, authenticated;

drop trigger if exists star_bookings_touch_updated_at on public.star_bookings;
create trigger star_bookings_touch_updated_at
  before update on public.star_bookings
  for each row execute function public.touch_star_bookings_updated_at();

alter table public.star_bookings enable row level security;
revoke all on public.star_bookings from anon;
grant select, insert, update on public.star_bookings to authenticated;

drop policy if exists "staff can read star bookings" on public.star_bookings;
create policy "staff can read star bookings" on public.star_bookings for select to authenticated using (true);
drop policy if exists "staff can create star bookings" on public.star_bookings;
create policy "staff can create star bookings" on public.star_bookings for insert to authenticated with check (true);
drop policy if exists "staff can update star bookings" on public.star_bookings;
create policy "staff can update star bookings" on public.star_bookings for update to authenticated using (true) with check (true);

-- Single entry point for website visitors AND staff: creates the lead and the
-- star row together. Visitors (anon) are always tagged 'Website'; only a
-- signed-in staff member may choose another lead source.
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
    service_date, service_time, services, notes, lead_source
  ) values (
    split_part(p_requester_name, ' ', 1) || ' Family', p_requester_name, p_phone, p_email,
    coalesce(nullif(p_relationship, ''), 'Next of Kin'), p_name,
    'Book a Star — Signature Farewell', 'Not Sure — Guide Me', 'To be confirmed', 'To be confirmed',
    coalesce(p_death_date, current_date), 'To be confirmed', '{}',
    'Book a Star request for ' || p_name, v_source
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

revoke all on function public.create_star_booking(text, text, text, text, text, text, date, date, text, text) from public;
grant execute on function public.create_star_booking(text, text, text, text, text, text, date, date, text, text) to anon, authenticated;

do $$ begin
  alter publication supabase_realtime add table public.star_bookings;
exception when duplicate_object then null; end $$;
