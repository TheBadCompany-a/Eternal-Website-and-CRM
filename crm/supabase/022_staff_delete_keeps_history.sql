-- Deleting a staff member keeps all case history; their name is just cleared from it.
-- Staff are deleted from the CRM (Drivers & Teams, Delete), which uses the `delete-staff-user`
-- edge function (admin only; cannot delete yourself or the last admin).
-- Run after 021_driver_directory.sql.
alter table public.arrangement_status_history drop constraint arrangement_status_history_changed_by_fkey;
alter table public.arrangement_status_history add constraint arrangement_status_history_changed_by_fkey
  foreign key (changed_by) references auth.users(id) on delete set null;

alter table public.arrangements drop constraint arrangements_created_by_fkey;
alter table public.arrangements add constraint arrangements_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.arrangements drop constraint arrangements_coordinator_id_fkey;
alter table public.arrangements add constraint arrangements_coordinator_id_fkey
  foreign key (coordinator_id) references public.profiles(id) on delete set null;

alter table public.driver_tasks drop constraint driver_tasks_driver_id_fkey;
alter table public.driver_tasks add constraint driver_tasks_driver_id_fkey
  foreign key (driver_id) references public.profiles(id) on delete set null;

alter table public.hr_leave_requests drop constraint hr_leave_requests_decided_by_fkey;
alter table public.hr_leave_requests add constraint hr_leave_requests_decided_by_fkey
  foreign key (decided_by) references public.profiles(id) on delete set null;

alter table public.package_configurations drop constraint package_configurations_created_by_fkey;
alter table public.package_configurations add constraint package_configurations_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;
