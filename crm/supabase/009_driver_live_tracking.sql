-- Driver live tracking: the driver app now reads/writes driver_tasks,
-- driver_task_updates and driver_expenses (created in 006) instead of the
-- browser's localStorage, so the office sees progress as it happens.
-- Run after 008_shared_packages.sql.
--
-- Publishes the three tables to Supabase Realtime so open CRM screens update
-- instantly. (The screens also poll every few seconds as a fallback.)

do $$ begin
  alter publication supabase_realtime add table public.driver_tasks;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.driver_task_updates;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.driver_expenses;
exception when duplicate_object then null; end $$;

create index if not exists idx_driver_expenses_task on public.driver_expenses(task_id);
