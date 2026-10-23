-- Every day at 23:55 India time the database files that day's attendance in Records (HR folder).
-- Run after 033_records.sql and 007_hr_overview.sql.
--
-- The sheet is stored in the record itself (records.content) and opened as a spreadsheet (CSV),
-- so no file upload is involved. Days with no attendance create nothing.

create extension if not exists pg_cron;

alter table public.records add column if not exists content text;

create or replace function public.save_daily_attendance(p_date date default (now() at time zone 'Asia/Kolkata')::date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_csv text;
  v_rows integer;
begin
  select count(*) into v_rows from public.hr_attendance where work_date = p_date;
  if v_rows = 0 then
    return;
  end if;

  select
    E'﻿' || 'Date,Name,Job title,Status,Check in,Check out' || E'\r\n' ||
    string_agg(
      format('"%s","%s","%s","%s","%s","%s"',
        a.work_date,
        replace(coalesce(p.full_name, a.profile_id::text), '"', '""'),
        replace(coalesce(nullif(p.job_title, ''), initcap(replace(p.app_role::text, '_', ' ')), ''), '"', '""'),
        a.status,
        coalesce(to_char(a.check_in at time zone 'Asia/Kolkata', 'HH24:MI'), ''),
        coalesce(to_char(a.check_out at time zone 'Asia/Kolkata', 'HH24:MI'), '')),
      E'\r\n' order by p.full_name)
  into v_csv
  from public.hr_attendance a
  left join public.profiles p on p.id = a.profile_id
  where a.work_date = p_date;

  insert into public.records (title, category, doc_type, file_path, file_name, mime_type, size_bytes, note, content, uploaded_by)
  values (
    'Attendance — ' || to_char(p_date, 'DD Mon YYYY'), 'HR', 'Attendance sheet',
    'auto/attendance-' || p_date || '.csv', 'attendance-' || p_date || '.csv', 'text/csv',
    octet_length(v_csv), v_rows || ' entries · saved automatically', v_csv, null)
  on conflict (file_path) do update
    set title = excluded.title, size_bytes = excluded.size_bytes, note = excluded.note, content = excluded.content;
end;
$$;

-- Only the scheduler (and the database owner) runs this; nobody can call it over the API.
revoke execute on function public.save_daily_attendance(date) from public, anon, authenticated;

-- 23:55 India time = 18:25 UTC.
select cron.unschedule('daily-attendance-record') where exists (select 1 from cron.job where jobname = 'daily-attendance-record');
select cron.schedule('daily-attendance-record', '25 18 * * *', $cron$select public.save_daily_attendance();$cron$);

-- Fill in the days that already have attendance.
do $$
declare d date;
begin
  for d in select distinct work_date from public.hr_attendance loop
    perform public.save_daily_attendance(d);
  end loop;
end $$;
