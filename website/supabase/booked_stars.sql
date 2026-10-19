-- Eternal Repos — "Book a Star" (Signature Farewell paid memorial with a dedicated family login)
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- How this works, end to end:
--   1. A family submits a booking REQUEST from the site and sets a password at the same time
--      (status 'requested'). This is a lead, not a payment — your team follows up by phone/email
--      to confirm the Signature Farewell package and collect payment, same as every other
--      enquiry on this site. Nothing is public yet.
--   2. Once confirmed, you activate the star in Table Editor -> booked_stars:
--        - set status = 'active'
--        - fill in slug (lowercase, hyphenated, must be unique — this becomes the public URL
--          eternalrepos.com/star/<slug>)
--      The family's login account already exists from step 1 — there's nothing further to set up
--      for them. They sign in at eternalrepos.com/my-star/login with the exact email address
--      stored in owner_email and the password they chose when booking.
--   3. Once logged in, a family can only ever see or edit the star(s) whose owner_email matches
--      their verified login email, and only while that star is 'active' — enforced by row-level
--      security below, not by application code, so this holds even if the frontend has a bug.
--   4. Public profile pages (/star/:slug) only ever show stars with status = 'active' and a slug,
--      through the public_booked_stars view, and only the safe/public columns — never
--      requester_name, requester_phone, or internal notes.
--
-- Before this works, in the Supabase dashboard:
--   - Authentication -> Providers -> Email: ensure the Email provider is enabled (default on new
--     projects). If "Confirm email" is turned on there (also the default), a family must click
--     the confirmation link Supabase emails them before they can sign in for the first time —
--     the site already tells them this after they submit a booking.
--   - Authentication -> URL Configuration -> Redirect URLs: add your site's URL, e.g.
--     https://eternalrepos.com/my-star and https://eternalrepos.com/my-star/reset-password
--     (plus the equivalent http://localhost:.../my-star... URLs for local testing) — the second
--     one is where the "forgot password" email link lands.

create table if not exists public.booked_stars (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique check (slug is null or slug ~ '^[a-z0-9-]{3,80}$'),
  owner_email     text not null check (owner_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name            text not null check (char_length(name) between 1 and 80),
  relationship    text check (char_length(relationship) <= 60),
  about           text check (char_length(about) <= 2000),
  birth_date      date,
  death_date      date,
  photo_path      text,
  requester_name  text not null check (char_length(requester_name) between 1 and 80),
  requester_phone text not null check (char_length(requester_phone) between 5 and 20),
  notes           text check (char_length(notes) <= 1000), -- internal, staff-only, never shown on the site
  status          text not null default 'requested' check (status in ('requested', 'active', 'rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists booked_stars_owner_email_idx on public.booked_stars (owner_email);

-- Keeps updated_at current whenever a family edits their star.
create or replace function public.touch_booked_stars_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists booked_stars_touch_updated_at on public.booked_stars;
create trigger booked_stars_touch_updated_at
  before update on public.booked_stars
  for each row execute function public.touch_booked_stars_updated_at();

alter table public.booked_stars enable row level security;

-- Visitors may submit a booking REQUEST, but only ever as 'requested'. No select/update/delete for them.
drop policy if exists "anyone can request a star booking" on public.booked_stars;
create policy "anyone can request a star booking"
  on public.booked_stars for insert to anon
  with check (status = 'requested');

-- A logged-in family can see only the star(s) whose owner_email matches their verified login email.
drop policy if exists "owners can view their own stars" on public.booked_stars;
create policy "owners can view their own stars"
  on public.booked_stars for select to authenticated
  using (owner_email = auth.jwt() ->> 'email');

-- A logged-in family can edit the content of their own star(s), only once staff has activated it.
-- (The frontend only ever sends content fields — name/relationship/about/dates/photo — never
-- slug/status/owner_email, so there is no UI path to editing those; this policy is the backstop.)
drop policy if exists "owners can update their own active star" on public.booked_stars;
create policy "owners can update their own active star"
  on public.booked_stars for update to authenticated
  using (owner_email = auth.jwt() ->> 'email' and status = 'active')
  with check (owner_email = auth.jwt() ->> 'email' and status = 'active');

revoke all on public.booked_stars from anon, authenticated;
grant insert on public.booked_stars to anon;
grant select, update on public.booked_stars to authenticated;

-- Public profile pages: only active, slugged stars, and only the columns that are safe to show.
create or replace view public.public_booked_stars as
  select id, slug, name, relationship, about, birth_date, death_date, photo_path, created_at
  from public.booked_stars
  where status = 'active' and slug is not null;

grant select on public.public_booked_stars to anon, authenticated;

-- Photo bucket for booked-star photos (separate from the free "Name a Star" tribute-photos bucket).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('star-photos', 'star-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Visitors may upload a photo with their booking request, into incoming/ only (staff moves/renames
-- it when activating the star — this keeps anonymous uploads from ever overwriting a live photo).
drop policy if exists "anyone can upload a star request photo" on storage.objects;
create policy "anyone can upload a star request photo"
  on storage.objects for insert to anon
  with check (bucket_id = 'star-photos' and name like 'incoming/%');

-- A logged-in family may upload/replace a photo only under owned/<their star's id>/...
drop policy if exists "owners can upload their own star photo" on storage.objects;
create policy "owners can upload their own star photo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'star-photos'
    and name like 'owned/%'
    and split_part(name, '/', 2) in (
      select id::text from public.booked_stars where owner_email = auth.jwt() ->> 'email' and status = 'active'
    )
  );

drop policy if exists "owners can replace their own star photo" on storage.objects;
create policy "owners can replace their own star photo"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'star-photos'
    and name like 'owned/%'
    and split_part(name, '/', 2) in (
      select id::text from public.booked_stars where owner_email = auth.jwt() ->> 'email' and status = 'active'
    )
  );
