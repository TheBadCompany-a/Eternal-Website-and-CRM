-- A line for every payment, so each case has a history (and a receipt can be made for each one).
-- Run after 026_settings_activity_rules.sql.
create table if not exists public.payment_entries (
  id              uuid primary key default gen_random_uuid(),
  arrangement_id  text not null references public.arrangements(id) on update cascade on delete cascade,
  amount          numeric(12,2) not null check (amount > 0),
  method          text not null default 'Cash',
  note            text,
  recorded_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_payment_entries_arrangement on public.payment_entries (arrangement_id, created_at desc);
alter table public.payment_entries enable row level security;
revoke all on public.payment_entries from anon;
grant select, insert on public.payment_entries to authenticated;
drop policy if exists "staff read payment entries" on public.payment_entries;
create policy "staff read payment entries" on public.payment_entries for select to authenticated using (true);
drop policy if exists "staff add payment entries" on public.payment_entries;
create policy "staff add payment entries" on public.payment_entries for insert to authenticated with check (true);

-- Payments recorded before this existed become one "Earlier payment" line each.
insert into public.payment_entries (arrangement_id, amount, method, note, created_at)
select a.id, a.paid_amount, coalesce(a.payment_method, 'Cash'), 'Earlier payment', a.updated_at
from public.arrangements a
where a.paid_amount > 0 and not exists (select 1 from public.payment_entries e where e.arrangement_id = a.id);

-- Recording a payment now also writes its history line. A quote of 0 no longer counts as "fully paid".
drop function if exists public.record_payment(text, numeric, text);
create or replace function public.record_payment(p_id text, p_amount numeric, p_method text default null, p_note text default null)
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

  insert into public.payment_entries (arrangement_id, amount, method, note, recorded_by)
  values (p_id, p_amount, coalesce(p_method, 'Cash'), nullif(btrim(coalesce(p_note, '')), ''), auth.uid());

  select total into v_total from public.quotations where arrangement_id = p_id;

  update public.arrangements
  set payment_status = case
    when v_total is not null and v_total > 0 and v_paid >= v_total then 'Receipt Generated'::payment_status
    else 'Payment Received'::payment_status
  end
  where id = p_id;
end;
$$;
grant execute on function public.record_payment(text, numeric, text, text) to authenticated;

-- Razorpay payments also leave a history line (same as 014, plus the history line).
create or replace function public.apply_gateway_payment(
  p_payment_id text, p_order_id text, p_kind text, p_ref text, p_note text, p_amount_paise bigint
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int;
  v_paid numeric;
  v_total numeric;
begin
  insert into public.gateway_payments (payment_id, order_id, kind, arrangement_id, note, amount_paise)
  values (p_payment_id, p_order_id, p_kind, case when p_kind = 'star' then p_ref else null end, p_note, p_amount_paise)
  on conflict (payment_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  if p_kind = 'star' and p_ref is not null then
    update public.arrangements a
    set paid_amount = a.paid_amount + (p_amount_paise / 100.0), payment_method = 'Razorpay'
    where a.id = p_ref
    returning a.paid_amount into v_paid;

    if v_paid is not null then
      insert into public.payment_entries (arrangement_id, amount, method, note)
      values (p_ref, p_amount_paise / 100.0, 'Razorpay', 'Payment ' || p_payment_id);
      select total into v_total from public.quotations where arrangement_id = p_ref;
      update public.arrangements
      set payment_status = case
        when v_total is not null and v_total > 0 and v_paid >= v_total then 'Receipt Generated'::payment_status
        else 'Payment Received'::payment_status
      end
      where id = p_ref;
    end if;
  end if;
  return true;
end;
$$;
revoke execute on function public.apply_gateway_payment(text, text, text, text, text, bigint) from public, anon, authenticated;
grant execute on function public.apply_gateway_payment(text, text, text, text, text, bigint) to service_role;

do $$ begin
  alter publication supabase_realtime add table public.payment_entries;
exception when duplicate_object then null; end $$;
