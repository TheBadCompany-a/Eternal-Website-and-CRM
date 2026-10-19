-- Eternal Repos CRM — row-level security & table grants
-- Run AFTER 001_schema.sql and 002_functions_triggers.sql.
--
-- Model: `anon` = the public booking wizard (no login). `authenticated` =
-- any logged-in staff member, admin or coordinator (both are full staff
-- roles per the CRM's requirements — see profiles policies below for the
-- one place admin/coordinator actually diverge: changing someone's role,
-- and fleet below for the other: adding/removing a vehicle).
--
-- IMPORTANT: after running this, also enable Realtime replication for
-- arrangements, callbacks, quotations, communications, fleet — Supabase
-- dashboard -> Database -> Replication -> toggle each table on. This is a
-- separate step from RLS and is easy to miss.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;

drop policy if exists "staff can read all profiles" on public.profiles;
create policy "staff can read all profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- One combined UPDATE policy (not two separate permissive ones) so Postgres
-- only evaluates a single policy per statement, and auth.uid() is wrapped as
-- (select auth.uid()) so it's evaluated once per statement rather than once
-- per row — both flagged by the Supabase performance advisor.
drop policy if exists "users can update their own profile" on public.profiles;
drop policy if exists "admins can update any profile" on public.profiles;
create policy "staff can update own profile or admins update any"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id or public.is_admin())
  with check ((select auth.uid()) = id or public.is_admin());

-- No insert/delete policies for any client role: rows are created only by
-- the handle_new_user trigger and removed only by deleting the auth.users
-- row (Dashboard), which cascades.

-- ---------------------------------------------------------------------------
-- arrangements
-- ---------------------------------------------------------------------------

alter table public.arrangements enable row level security;

-- anon has NO grant at all on this table — not even INSERT. Public booking
-- creation goes exclusively through the create_public_booking() SECURITY
-- DEFINER RPC (002), which is narrower than an INSERT policy (it only
-- accepts customer-facing fields; status/payment/coordinator fields are
-- never client-settable) and avoids needing a SELECT grant just to read
-- back the new row's id/access_token.
revoke all on public.arrangements from anon;
grant select, insert, update on public.arrangements to authenticated;
-- No DELETE grant to anyone: hard delete is never permitted (soft-delete
-- via deleted_at is admin-only, enforced by the prevent_unauthorized_delete
-- trigger in 002, on top of the UPDATE policy below).

drop policy if exists "anon can create a new inquiry" on public.arrangements;

drop policy if exists "staff can create arrangements" on public.arrangements;
create policy "staff can create arrangements"
  on public.arrangements for insert
  to authenticated
  with check (true);

drop policy if exists "staff can read arrangements" on public.arrangements;
create policy "staff can read arrangements"
  on public.arrangements for select
  to authenticated
  using (deleted_at is null);

drop policy if exists "staff can update arrangements" on public.arrangements;
create policy "staff can update arrangements"
  on public.arrangements for update
  to authenticated
  using (deleted_at is null)
  with check (true);

-- anon has no SELECT/UPDATE policy at all: public tracking goes through
-- get_arrangement_by_token() only (002_functions_triggers.sql).

-- ---------------------------------------------------------------------------
-- quotations
-- ---------------------------------------------------------------------------

alter table public.quotations enable row level security;

revoke all on public.quotations from anon;
grant select, insert, update on public.quotations to authenticated;

drop policy if exists "staff can read quotations" on public.quotations;
create policy "staff can read quotations" on public.quotations for select to authenticated using (true);

drop policy if exists "staff can create quotations" on public.quotations;
create policy "staff can create quotations" on public.quotations for insert to authenticated with check (true);

drop policy if exists "staff can update quotations" on public.quotations;
create policy "staff can update quotations" on public.quotations for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- feedback
-- ---------------------------------------------------------------------------

alter table public.feedback enable row level security;

revoke all on public.feedback from anon;
grant select, insert, update on public.feedback to authenticated;

drop policy if exists "staff can read feedback" on public.feedback;
create policy "staff can read feedback" on public.feedback for select to authenticated using (true);

drop policy if exists "staff can create feedback" on public.feedback;
create policy "staff can create feedback" on public.feedback for insert to authenticated with check (true);

drop policy if exists "staff can update feedback" on public.feedback;
create policy "staff can update feedback" on public.feedback for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- arrangement_status_history — read-only to staff, written only by trigger.
-- ---------------------------------------------------------------------------

alter table public.arrangement_status_history enable row level security;

revoke all on public.arrangement_status_history from anon;
grant select on public.arrangement_status_history to authenticated;

drop policy if exists "staff can read status history" on public.arrangement_status_history;
create policy "staff can read status history"
  on public.arrangement_status_history for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- callbacks
-- ---------------------------------------------------------------------------

alter table public.callbacks enable row level security;

revoke all on public.callbacks from anon;
grant insert on public.callbacks to anon;
grant select, insert, update on public.callbacks to authenticated;

drop policy if exists "anon can request a callback" on public.callbacks;
create policy "anon can request a callback"
  on public.callbacks for insert
  to anon
  with check (resolved_at is null);

drop policy if exists "staff can create callbacks" on public.callbacks;
create policy "staff can create callbacks" on public.callbacks for insert to authenticated with check (true);

drop policy if exists "staff can read callbacks" on public.callbacks;
create policy "staff can read callbacks" on public.callbacks for select to authenticated using (true);

drop policy if exists "staff can update callbacks" on public.callbacks;
create policy "staff can update callbacks" on public.callbacks for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- fleet — internal only. Adding/removing a vehicle is admin-only.
-- ---------------------------------------------------------------------------

alter table public.fleet enable row level security;

revoke all on public.fleet from anon;
grant select, update on public.fleet to authenticated;
grant insert, delete on public.fleet to authenticated;

drop policy if exists "staff can read fleet" on public.fleet;
create policy "staff can read fleet" on public.fleet for select to authenticated using (true);

drop policy if exists "staff can update fleet" on public.fleet;
create policy "staff can update fleet" on public.fleet for update to authenticated using (true) with check (true);

drop policy if exists "admins can add vehicles" on public.fleet;
create policy "admins can add vehicles" on public.fleet for insert to authenticated with check (public.is_admin());

drop policy if exists "admins can remove vehicles" on public.fleet;
create policy "admins can remove vehicles" on public.fleet for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- communications — immutable log: no UPDATE/DELETE for anyone.
-- ---------------------------------------------------------------------------

alter table public.communications enable row level security;

revoke all on public.communications from anon;
grant select, insert on public.communications to authenticated;

drop policy if exists "staff can read communications" on public.communications;
create policy "staff can read communications" on public.communications for select to authenticated using (true);

drop policy if exists "staff can send communications" on public.communications;
create policy "staff can send communications" on public.communications for insert to authenticated with check (true);
