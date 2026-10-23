-- Responsibility, handovers and urgent enquiries.
-- Run after 026_settings_activity_rules.sql, 037_daily_attendance_record.sql and 041_role_based_data_access.sql.
--
-- 1. Back end Executive = the person handling the enquiry (executive_id). It is separate from the
--    operations coordinator (coordinator_id), who looks after the service on the day.
-- 2. Every handover is saved: who handed over to whom, when and why, with the next action.
-- 3. Urgent (Immediate) enquiries run on their own round-the-clock rule: a response target, a person on
--    duty and a backup. Planned enquiries keep the working-hours schedule from Settings -> Lead rules.
--    An urgent enquiry nobody has answered is escalated: duty person -> backup -> admin.

alter table public.arrangements add column if not exists executive_id uuid references public.profiles(id) on delete set null;
alter table public.arrangements add column if not exists next_action text not null default '';
alter table public.arrangements add column if not exists escalation_level integer not null default 0;
alter table public.arrangements add column if not exists escalated_at timestamptz;
create index if not exists idx_arrangements_executive on public.arrangements(executive_id);

-- Until now one field did both jobs and was shown as "Owner": that person becomes the Back end Executive.
update public.arrangements set executive_id = coordinator_id where executive_id is null and coordinator_id is not null;

insert into public.app_settings (key, value)
values ('urgent_rules', '{"enabled": true, "respond_minutes": 15, "duty_profile_id": null, "backup_profile_id": null}')
on conflict (key) do nothing;

create table if not exists public.case_handovers (
  id uuid primary key default gen_random_uuid(),
  arrangement_id text not null references public.arrangements(id) on delete cascade,
  from_profile uuid references public.profiles(id) on delete set null,
  to_profile uuid references public.profiles(id) on delete set null,
  reason text not null default '',
  next_action text not null default '',
  automatic boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists idx_handovers_case on public.case_handovers(arrangement_id, created_at desc);
alter table public.case_handovers enable row level security;
revoke all on public.case_handovers from anon;
grant select on public.case_handovers to authenticated;
drop policy if exists "staff read handovers" on public.case_handovers;
create policy "staff read handovers" on public.case_handovers for select to authenticated
  using (public.can_open_any(array['leads', 'arrangements', 'operations']));

-- Who takes the next enquiry: the back end executive with the fewest open cases, else a coordinator, else an admin.
create or replace function public.pick_executive()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare v uuid; r text;
begin
  foreach r in array array['backend_executive', 'coordinator', 'admin'] loop
    select p.id into v from public.profiles p where p.app_role::text = r
    order by (select count(*) from public.arrangements a where a.executive_id = p.id and a.status <> 'Completed' and a.deleted_at is null), p.created_at
    limit 1;
    if v is not null then return v; end if;
  end loop;
  return null;
end;
$$;
revoke execute on function public.pick_executive() from public, anon, authenticated;

create or replace function public.apply_lead_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb := public.setting_json('lead_rules');
  u jsonb := public.setting_json('urgent_rules');
  hrs numeric := coalesce((r->>'first_call_hours')::numeric, 2);
  mins integer := greatest(1, coalesce((u->>'respond_minutes')::integer, 15));
  v_urgent boolean := new.need_category = 'Immediate Arrangement' and coalesce((u->>'enabled')::boolean, true);
  v_duty uuid := nullif(u->>'duty_profile_id', '')::uuid;
begin
  if v_urgent then
    -- Round the clock: never moved into office hours.
    new.priority := 'Urgent';
    new.next_follow_up_at := now() + make_interval(mins => mins);
    if new.executive_id is null then
      if v_duty is not null and not exists (select 1 from public.profiles where id = v_duty) then v_duty := null; end if;
      new.executive_id := coalesce(v_duty, public.pick_executive());
    end if;
  else
    -- Planned and other enquiries follow the agreed schedule, inside working hours.
    if new.lead_source = 'Website' then
      new.next_follow_up_at := public.next_working_time(now() + make_interval(mins => (hrs * 60)::int));
    end if;
    if new.executive_id is null and coalesce((r->>'auto_assign')::boolean, false) then
      new.executive_id := public.pick_executive();
    end if;
  end if;
  return new;
end;
$$;

-- An urgent enquiry still untouched after the target time moves on: executive -> backup -> admin.
create or replace function public.escalate_unanswered_urgent()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  u jsonb := public.setting_json('urgent_rules');
  mins integer := greatest(1, coalesce((u->>'respond_minutes')::integer, 15));
  v_backup uuid := nullif(u->>'backup_profile_id', '')::uuid;
  a record;
  v_to uuid;
  v_count integer := 0;
begin
  if not coalesce((u->>'enabled')::boolean, true) then return 0; end if;
  for a in
    select id, executive_id, escalation_level, family from public.arrangements
    where deleted_at is null and need_category = 'Immediate Arrangement' and status = 'New Inquiry'
      and escalation_level < 2
      and coalesce(escalated_at, created_at) < now() - make_interval(mins => mins)
      and not exists (select 1 from public.communications c where c.arrangement_id = arrangements.id and c.sender <> 'System')
  loop
    if a.escalation_level = 0 and v_backup is not null and v_backup is distinct from a.executive_id
       and exists (select 1 from public.profiles where id = v_backup) then
      v_to := v_backup;
    else
      select p.id into v_to from public.profiles p where p.app_role = 'admin' and p.id is distinct from a.executive_id order by p.created_at limit 1;
    end if;
    if v_to is null then continue; end if;

    update public.arrangements set executive_id = v_to, escalation_level = a.escalation_level + 1, escalated_at = now() where id = a.id;
    insert into public.case_handovers (arrangement_id, from_profile, to_profile, reason, next_action, automatic, created_by)
    values (a.id, a.executive_id, v_to, 'Urgent enquiry not answered within ' || mins || ' minutes (automatic escalation)', 'Call the family now', true, null);
    insert into public.communications (arrangement_id, channel, sender, body)
    values (a.id, 'Call', 'System', 'Escalated: no first contact within ' || mins || ' minutes. Passed on for an immediate call.');
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke execute on function public.escalate_unanswered_urgent() from public, anon, authenticated;

select cron.unschedule('escalate-urgent-enquiries') where exists (select 1 from cron.job where jobname = 'escalate-urgent-enquiries');
select cron.schedule('escalate-urgent-enquiries', '* * * * *', $cron$select public.escalate_unanswered_urgent();$cron$);

-- Hand a case to someone else. Allowed for admin, HR, coordinators and the person currently handling it.
-- The reason is required, and the history is kept.
create or replace function public.hand_over_case(
  p_arrangement_id text, p_to uuid, p_reason text, p_next_action text default '', p_due timestamptz default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_role text;
  v_from uuid;
begin
  select app_role::text into v_role from public.profiles where id = v_me;
  if v_role is null then raise exception 'Not signed in'; end if;
  if not public.can_access_arrangement(p_arrangement_id) then raise exception 'You cannot open this case'; end if;
  select executive_id into v_from from public.arrangements where id = p_arrangement_id and deleted_at is null;
  if not found then raise exception 'Case not found'; end if;
  if not (v_role in ('admin', 'hr', 'coordinator') or v_from = v_me) then
    raise exception 'Only an admin, HR, a coordinator or the person handling this case can hand it over';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'Say why the case is being handed over'; end if;
  if not exists (select 1 from public.profiles where id = p_to and app_role <> 'driver') then raise exception 'Choose a staff member to hand over to'; end if;

  update public.arrangements
  set executive_id = p_to,
      next_action = case when coalesce(trim(p_next_action), '') <> '' then trim(p_next_action) else next_action end,
      next_follow_up_at = coalesce(p_due, next_follow_up_at),
      escalation_level = 0, escalated_at = null
  where id = p_arrangement_id;

  insert into public.case_handovers (arrangement_id, from_profile, to_profile, reason, next_action, automatic, created_by)
  values (p_arrangement_id, v_from, p_to, trim(p_reason), coalesce(trim(p_next_action), ''), false, v_me);
end;
$$;
revoke execute on function public.hand_over_case(text, uuid, text, text, timestamptz) from public, anon;
grant execute on function public.hand_over_case(text, uuid, text, text, timestamptz) to authenticated;
