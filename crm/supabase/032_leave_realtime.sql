-- Live updates for leave requests, so HR/admin see a new request without refreshing.
-- Run after 007_hr_overview.sql.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'hr_leave_requests') then
    alter publication supabase_realtime add table public.hr_leave_requests;
  end if;
end $$;
