-- The role guard blocked the create-staff-user function (it runs with the service role, so there is no
-- signed-in admin). Let the service role set a role; everyone else still needs to be an admin.
-- Run after 022_staff_delete_keeps_history.sql.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.app_role is distinct from old.app_role
     and not public.is_admin()
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Only an admin can change a user''s role';
  end if;
  return new;
end;
$$;
