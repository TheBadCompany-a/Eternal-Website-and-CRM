-- Eternal Repos CRM — functions & triggers
-- Run AFTER 001_schema.sql, in the same SQL Editor.

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so they can check a caller's own role
-- from inside a profiles RLS policy without recursive-RLS problems).
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and app_role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- Postgres grants EXECUTE to PUBLIC by default on function creation; these
-- are only ever needed inside RLS policy expressions evaluated for
-- `authenticated` (see 003), so explicitly drop the incidental anon/PUBLIC
-- grant rather than leaving it as an unused public RPC surface.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- ---------------------------------------------------------------------------
-- Auto-create a profiles row whenever a new auth.users row appears (e.g. via
-- Dashboard -> Authentication -> Add User). Defaults to 'coordinator'; see
-- 004_bootstrap_admin.sql.example to promote the first admin.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Generic updated_at bookkeeping.
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.arrangements;
create trigger set_updated_at before update on public.arrangements
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.quotations;
create trigger set_updated_at before update on public.quotations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Every arrangement gets a quotation row the moment it's created — anon has
-- no grants on `quotations` at all (see 003), so the public booking wizard
-- could never create its own starting estimate; this SECURITY DEFINER
-- trigger does it instead, with the same indicative defaults the old
-- client-side submitCustomerBooking used to seed. Staff adjust from there.
-- ---------------------------------------------------------------------------

create or replace function public.create_default_quotation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.quotations (arrangement_id, vehicle, distance, staff, additional_services, florals, rituals, waiting_charges, other, status)
  values (new.id, 11000, 2500, 3500, 4000, 3500, 3500, 0, 2000, 'Draft')
  on conflict (arrangement_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_default_quotation on public.arrangements;
create trigger create_default_quotation
  after insert on public.arrangements
  for each row execute function public.create_default_quotation();

-- ---------------------------------------------------------------------------
-- Lifecycle audit trail — every status a case ever passes through, who
-- changed it, and when. Client code never writes to this table directly.
-- ---------------------------------------------------------------------------

create or replace function public.log_arrangement_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.arrangement_status_history (arrangement_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.arrangement_status_history (arrangement_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists log_arrangement_status_change on public.arrangements;
create trigger log_arrangement_status_change
  after insert or update of status on public.arrangements
  for each row execute function public.log_arrangement_status_change();

-- ---------------------------------------------------------------------------
-- No self-role-escalation: only an existing admin may change ANY profile's
-- app_role (including their own or someone else's). Independent of, and in
-- addition to, the RLS policies in 003.
-- ---------------------------------------------------------------------------

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.app_role is distinct from old.app_role and not public.is_admin() then
    raise exception 'Only an admin can change a user''s role';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_role_escalation on public.profiles;
create trigger prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---------------------------------------------------------------------------
-- Soft-delete an arrangement only if the caller is an admin. No hard DELETE
-- is ever permitted (see 003) — this guards the one remaining "delete-ish"
-- path, setting deleted_at via UPDATE.
-- ---------------------------------------------------------------------------

create or replace function public.prevent_unauthorized_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.deleted_at is distinct from old.deleted_at and not public.is_admin() then
    raise exception 'Only an admin can delete an arrangement';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_delete on public.arrangements;
create trigger prevent_unauthorized_delete
  before update on public.arrangements
  for each row execute function public.prevent_unauthorized_delete();

-- ---------------------------------------------------------------------------
-- Approving a quotation cascades to the arrangement, atomically and
-- server-side (mirrors the old client-side approveQuote side effect).
-- ---------------------------------------------------------------------------

create or replace function public.cascade_quotation_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'Approved' and old.status is distinct from new.status then
    update public.arrangements
    set status = 'Confirmed', customer_tracking_stage = 1
    where id = new.arrangement_id;
  end if;
  return new;
end;
$$;

drop trigger if exists cascade_quotation_approval on public.quotations;
create trigger cascade_quotation_approval
  after update of status on public.quotations
  for each row execute function public.cascade_quotation_approval();

-- ---------------------------------------------------------------------------
-- Atomic RPC: advance a case's field-execution stage (mirrors the old
-- reducer's ADVANCE_FIELD_EXECUTION mapping table). SECURITY INVOKER — the
-- caller still needs the normal staff UPDATE privilege on arrangements.
-- ---------------------------------------------------------------------------

create or replace function public.advance_field_execution(p_id text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_stage smallint;
begin
  select least(5, field_execution_stage + 1) into v_stage
  from public.arrangements where id = p_id for update;

  if v_stage is null then
    raise exception 'Arrangement % not found', p_id;
  end if;

  update public.arrangements
  set field_execution_stage = v_stage,
      customer_tracking_stage = case v_stage
        when 1 then 3
        when 2 then 4
        when 3 then 4
        when 4 then 5
        when 5 then 6
        else customer_tracking_stage
      end,
      status = case when v_stage = 5 then 'Completed'::arrangement_status else status end
  where id = p_id;
end;
$$;

grant execute on function public.advance_field_execution(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Atomic RPC: record a payment (increment, not read-modify-write from the
-- client) and derive payment_status from the quotation's total.
-- ---------------------------------------------------------------------------

create or replace function public.record_payment(p_id text, p_amount numeric, p_method text default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_total numeric;
  v_paid  numeric;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be positive';
  end if;

  update public.arrangements a
  set paid_amount = a.paid_amount + p_amount,
      payment_method = coalesce(p_method, a.payment_method)
  where a.id = p_id
  returning a.paid_amount into v_paid;

  if v_paid is null then
    raise exception 'Arrangement % not found', p_id;
  end if;

  select total into v_total from public.quotations where arrangement_id = p_id;

  update public.arrangements
  set payment_status = case
    when v_total is not null and v_paid >= v_total then 'Receipt Generated'::payment_status
    else 'Payment Received'::payment_status
  end
  where id = p_id;
end;
$$;

grant execute on function public.record_payment(text, numeric, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Public tracking lookup: the ONLY way an anonymous client can read an
-- arrangement row. Exact-match on id + a 128-bit access_token. arrangements
-- itself has no anon SELECT policy at all (see 003) — this narrow,
-- SECURITY DEFINER function is the entire anon read surface.
-- ---------------------------------------------------------------------------

create or replace function public.get_arrangement_by_token(p_id text, p_token uuid)
returns setof public.arrangements
language sql
security definer
set search_path = public
stable
as $$
  select * from public.arrangements
  where id = p_id and access_token = p_token and deleted_at is null;
$$;

revoke all on function public.get_arrangement_by_token(text, uuid) from public;
grant execute on function public.get_arrangement_by_token(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public booking creation. anon deliberately has NO grant on `arrangements`
-- at all (see 003) — a plain `insert().select()` from the client would need
-- a SELECT grant just to get the new row's id/access_token back, which
-- would also make the whole table anon-readable. This SECURITY DEFINER
-- function is the only way an anonymous visitor creates a row: it accepts
-- just the customer-facing fields (status/coordinator/payment fields are
-- never parameters — they're always the column defaults), inserts, and
-- returns only the two fields the client needs for tracking.
-- ---------------------------------------------------------------------------

create or replace function public.create_public_booking(
  p_family text,
  p_contact_name text,
  p_phone text,
  p_email text,
  p_relationship text,
  p_deceased_name text,
  p_service_type text,
  p_need_category need_category,
  p_pickup_location text,
  p_destination_location text,
  p_service_date date,
  p_service_time text,
  p_services text[],
  p_notes text
)
returns table (id text, access_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
  v_token uuid;
begin
  insert into public.arrangements (
    family, contact_name, phone, email, relationship, deceased_name,
    service_type, need_category, pickup_location, destination_location,
    service_date, service_time, services, notes
  ) values (
    p_family, p_contact_name, p_phone, p_email, p_relationship, p_deceased_name,
    p_service_type, p_need_category, p_pickup_location, p_destination_location,
    p_service_date, p_service_time, coalesce(p_services, '{}'), coalesce(p_notes, '')
  )
  returning arrangements.id, arrangements.access_token into v_id, v_token;

  return query select v_id, v_token;
end;
$$;

revoke all on function public.create_public_booking(text, text, text, text, text, text, text, need_category, text, text, date, text, text[], text) from public;
grant execute on function public.create_public_booking(text, text, text, text, text, text, text, need_category, text, text, date, text, text[], text) to anon;

-- ---------------------------------------------------------------------------
-- Trigger-only functions should never be directly callable via PostgREST's
-- /rest/v1/rpc/<fn> — CREATE TRIGGER wires them to fire automatically and
-- does not require the triggering role to hold EXECUTE on the function.
-- Postgres grants EXECUTE to PUBLIC by default on creation; revoke it.
-- ---------------------------------------------------------------------------

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.log_arrangement_status_change() from public, anon, authenticated;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;
revoke execute on function public.prevent_unauthorized_delete() from public, anon, authenticated;
revoke execute on function public.cascade_quotation_approval() from public, anon, authenticated;
revoke execute on function public.create_default_quotation() from public, anon, authenticated;
