-- The database now enforces what each role may see, instead of only hiding screens.
-- Before this, any signed-in user (a driver included) could read every payment, quotation,
-- message, star booking and tribute by calling the API directly.
--
-- can_open(item) is the database twin of canOpen() in src/auth/access.ts:
--   admin: everything | a role with a saved list in Settings -> Access: that list |
--   driver with no saved list: driver-app, vehicles, settings | any other role with no saved list: everything.
-- Run after 003_rls_policies.sql, 026_settings_activity_rules.sql and 029_coordinators_add_vehicles.sql.

create or replace function public.can_open(p_item text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role text;
  v_custom jsonb;
begin
  if p_item = 'settings' then
    return auth.uid() is not null;
  end if;
  select app_role::text into v_role from public.profiles where id = auth.uid();
  if v_role is null then return false; end if;
  if v_role = 'admin' then return true; end if;
  select value -> v_role into v_custom from public.app_settings where key = 'role_access';
  if v_custom is not null and jsonb_typeof(v_custom) = 'array' then
    return v_custom ? p_item;
  end if;
  if v_role = 'driver' then
    return p_item = any (array['driver-app', 'vehicles', 'settings']);
  end if;
  return true;
end;
$$;

create or replace function public.can_open_any(p_items text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from unnest(p_items) as i where public.can_open(i));
$$;

create or replace function public.is_driver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and app_role = 'driver');
$$;

revoke execute on function public.can_open(text), public.can_open_any(text[]), public.is_driver() from public, anon;
grant execute on function public.can_open(text), public.can_open_any(text[]), public.is_driver() to authenticated;

-- A driver sees only the cases assigned to them (by name, or through a driver task).
-- Everyone else keeps the existing rule: all cases except sensitive ones they were not given access to.
create or replace function public.can_access_arrangement(p_arrangement_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.arrangements a
    where a.id = p_arrangement_id
      and (not a.is_sensitive or public.is_admin() or exists (
        select 1 from public.lead_access la where la.arrangement_id = a.id and la.profile_id = auth.uid()
      ))
      and (not public.is_driver()
           or a.driver = (select p.full_name from public.profiles p where p.id = auth.uid())
           or exists (select 1 from public.driver_tasks dt where dt.arrangement_id = a.id and dt.driver_id = auth.uid()))
  );
$$;

-- Money
drop policy if exists "staff read payment entries" on public.payment_entries;
create policy "staff read payment entries" on public.payment_entries for select to authenticated using (public.can_open('payments'));
drop policy if exists "staff add payment entries" on public.payment_entries;
create policy "staff add payment entries" on public.payment_entries for insert to authenticated with check (public.can_open('payments'));

drop policy if exists "staff can read payment claims" on public.payment_claims;
create policy "staff can read payment claims" on public.payment_claims for select to authenticated using (public.can_open_any(array['payments', 'stars']));
drop policy if exists "staff can update payment claims" on public.payment_claims;
create policy "staff can update payment claims" on public.payment_claims for update to authenticated
  using (public.can_open_any(array['payments', 'stars'])) with check (public.can_open_any(array['payments', 'stars']));

drop policy if exists "staff can read gateway payments" on public.gateway_payments;
create policy "staff can read gateway payments" on public.gateway_payments for select to authenticated using (public.can_open('payments'));

-- Quotations (everyone who works on cases; not a driver)
drop policy if exists "staff can read quotations" on public.quotations;
create policy "staff can read quotations" on public.quotations for select to authenticated
  using (public.can_open_any(array['quotations', 'configurator', 'bookings', 'payments', 'operations', 'arrangements', 'leads', 'dashboard', 'reports']));
drop policy if exists "staff can create quotations" on public.quotations;
create policy "staff can create quotations" on public.quotations for insert to authenticated
  with check (public.can_open_any(array['quotations', 'configurator', 'bookings', 'operations', 'arrangements', 'leads']));
drop policy if exists "staff can update quotations" on public.quotations;
create policy "staff can update quotations" on public.quotations for update to authenticated
  using (public.can_open_any(array['quotations', 'configurator', 'bookings', 'operations', 'arrangements', 'leads']))
  with check (public.can_open_any(array['quotations', 'configurator', 'bookings', 'operations', 'arrangements', 'leads']));
drop policy if exists "staff manage quotation items" on public.quotation_items;
create policy "staff manage quotation items" on public.quotation_items for all to authenticated
  using (public.can_open_any(array['quotations', 'configurator', 'bookings', 'payments', 'operations', 'arrangements', 'leads']))
  with check (public.can_open_any(array['quotations', 'configurator', 'bookings', 'operations', 'arrangements', 'leads']));

-- Messages, memorials, feedback, callbacks
drop policy if exists "staff can read communications" on public.communications;
create policy "staff can read communications" on public.communications for select to authenticated
  using (public.can_open_any(array['communications', 'operations', 'dashboard', 'leads', 'arrangements']));
drop policy if exists "staff can send communications" on public.communications;
create policy "staff can send communications" on public.communications for insert to authenticated
  with check (public.can_open_any(array['communications', 'operations', 'leads', 'arrangements']));

drop policy if exists "staff can read star bookings" on public.star_bookings;
create policy "staff can read star bookings" on public.star_bookings for select to authenticated using (public.can_open_any(array['stars', 'operations', 'leads', 'arrangements']));
drop policy if exists "staff can create star bookings" on public.star_bookings;
create policy "staff can create star bookings" on public.star_bookings for insert to authenticated with check (public.can_open('stars'));
drop policy if exists "staff can update star bookings" on public.star_bookings;
create policy "staff can update star bookings" on public.star_bookings for update to authenticated using (public.can_open('stars')) with check (public.can_open('stars'));

drop policy if exists "staff can read tributes" on public.tributes;
create policy "staff can read tributes" on public.tributes for select to authenticated using (public.can_open('tributes'));
drop policy if exists "staff can update tributes" on public.tributes;
create policy "staff can update tributes" on public.tributes for update to authenticated using (public.can_open('tributes')) with check (public.can_open('tributes'));

drop policy if exists "staff can read feedback" on public.feedback;
create policy "staff can read feedback" on public.feedback for select to authenticated using (public.can_open_any(array['feedback', 'operations', 'reports', 'arrangements', 'leads']));
drop policy if exists "staff can create feedback" on public.feedback;
create policy "staff can create feedback" on public.feedback for insert to authenticated with check (public.can_open_any(array['feedback', 'operations']));
drop policy if exists "staff can update feedback" on public.feedback;
create policy "staff can update feedback" on public.feedback for update to authenticated using (public.can_open_any(array['feedback', 'operations'])) with check (public.can_open_any(array['feedback', 'operations']));

drop policy if exists "staff can read callbacks" on public.callbacks;
create policy "staff can read callbacks" on public.callbacks for select to authenticated using (public.can_open_any(array['dashboard', 'leads', 'reports', 'operations']));
drop policy if exists "staff can update callbacks" on public.callbacks;
create policy "staff can update callbacks" on public.callbacks for update to authenticated using (public.can_open_any(array['dashboard', 'leads', 'operations'])) with check (public.can_open_any(array['dashboard', 'leads', 'operations']));
drop policy if exists "staff can create callbacks" on public.callbacks;
create policy "staff can create callbacks" on public.callbacks for insert to authenticated with check (public.can_open_any(array['dashboard', 'leads', 'operations']));

-- Creating a case or lead by hand needs a screen that does it.
drop policy if exists "staff can create arrangements" on public.arrangements;
create policy "staff can create arrangements" on public.arrangements for insert to authenticated
  with check (public.can_open_any(array['leads', 'arrangements', 'operations', 'bookings', 'stars']));
