-- Eternal Repos — "Name a Star" tributes
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- How privacy and moderation work
--   * Visitors can only ADD a tribute, and it always starts as 'pending'. They cannot read the table.
--   * The website reads tributes only from the view `approved_tributes`, which shows approved rows
--     and never includes the submitter's name or contact details.
--   * You approve a tribute by changing its `status` to 'approved' in Table Editor -> tributes
--     (or reject it with 'rejected'). Nothing appears in the sky, or on a tribute page, until then.
--   * To remove a tribute later (a family asks), set status back to 'rejected' or delete the row.
--   * Photos are re-encoded in the browser before upload (metadata such as GPS is stripped) and are
--     stored under unguessable names. The bucket only accepts JPEG/PNG/WebP up to 5 MB.

create table if not exists public.tributes (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  name              text not null check (char_length(name) between 1 and 80),
  born_year         int  check (born_year between 1800 and 2100),
  passed_year       int  check (passed_year between 1800 and 2100),
  message           text check (char_length(message) <= 400),
  photo_path        text check (photo_path is null or photo_path ~ '^incoming/[0-9a-f-]{36}\.jpg$'),
  -- private: never exposed by the public view
  submitter_name    text not null check (char_length(submitter_name) between 1 and 80),
  submitter_contact text not null check (char_length(submitter_contact) between 5 and 120),
  consent           boolean not null check (consent = true),
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz not null default now()
);

alter table public.tributes enable row level security;

-- Visitors may add a tribute, but only as 'pending'. No select/update/delete policies exist for them.
drop policy if exists "anyone can submit a pending tribute" on public.tributes;
create policy "anyone can submit a pending tribute"
  on public.tributes for insert to anon
  with check (status = 'pending' and consent = true);

-- The only thing the website can read: approved tributes, safe columns only.
create or replace view public.approved_tributes as
  select id, slug, name, born_year, passed_year, message, photo_path, created_at
  from public.tributes
  where status = 'approved';

revoke all on public.tributes from anon;
grant insert on public.tributes to anon;
grant select on public.approved_tributes to anon;

-- Photo bucket: public read (so approved photos display), 5 MB limit, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tribute-photos', 'tribute-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Visitors may upload into incoming/ only. They cannot overwrite or delete.
drop policy if exists "anyone can upload a tribute photo" on storage.objects;
create policy "anyone can upload a tribute photo"
  on storage.objects for insert to anon
  with check (bucket_id = 'tribute-photos' and name like 'incoming/%');
