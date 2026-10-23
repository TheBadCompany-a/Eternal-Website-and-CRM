-- Records: one place for uploaded documents, either attached to a case or filed under a general folder.
-- Run after 007_hr_overview.sql (uses public.is_hr_or_admin()).
--
-- Model: only HR and admins can see, upload, open or delete records.

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  category text not null default 'Case' check (category in ('Case', 'HR', 'Vehicles', 'Legal', 'Finance', 'Other')),
  arrangement_id text references public.arrangements(id) on delete set null,
  file_path text not null unique,
  file_name text not null,
  mime_type text not null default '',
  size_bytes bigint not null default 0,
  note text not null default '',
  uploaded_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_records_category on public.records(category);
create index if not exists idx_records_arrangement on public.records(arrangement_id);

alter table public.records enable row level security;
revoke all on public.records from anon;
grant select, insert, update, delete on public.records to authenticated;

drop policy if exists "hr reads records" on public.records;
create policy "hr reads records" on public.records for select to authenticated using (public.is_hr_or_admin());
drop policy if exists "hr adds records" on public.records;
create policy "hr adds records" on public.records for insert to authenticated with check (public.is_hr_or_admin());
drop policy if exists "hr edits records" on public.records;
create policy "hr edits records" on public.records for update to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());
drop policy if exists "hr deletes records" on public.records;
create policy "hr deletes records" on public.records for delete to authenticated using (public.is_hr_or_admin());

-- Private bucket: files are opened through short-lived signed links, never a public URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'records', 'records', false, 20971520,
  array[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'text/plain'
  ]
)
on conflict (id) do nothing;

drop policy if exists "hr reads record files" on storage.objects;
create policy "hr reads record files" on storage.objects for select to authenticated
  using (bucket_id = 'records' and public.is_hr_or_admin());
drop policy if exists "hr uploads record files" on storage.objects;
create policy "hr uploads record files" on storage.objects for insert to authenticated
  with check (bucket_id = 'records' and public.is_hr_or_admin());
drop policy if exists "hr deletes record files" on storage.objects;
create policy "hr deletes record files" on storage.objects for delete to authenticated
  using (bucket_id = 'records' and public.is_hr_or_admin());
