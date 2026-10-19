-- Razorpay payments recorded by the `razorpay` edge function (already applied to the live project).
-- Run after 013_website_features.sql.
create table if not exists public.gateway_payments (
  id              uuid primary key default gen_random_uuid(),
  payment_id      text not null unique,
  order_id        text not null,
  kind            text not null check (kind in ('star', 'diya')),
  arrangement_id  text references public.arrangements(id),
  note            text,
  amount_paise    bigint not null check (amount_paise > 0),
  created_at      timestamptz not null default now()
);
create index if not exists idx_gateway_payments_arrangement on public.gateway_payments(arrangement_id);

alter table public.gateway_payments enable row level security;
revoke all on public.gateway_payments from anon;
grant select on public.gateway_payments to authenticated;
drop policy if exists "staff can read gateway payments" on public.gateway_payments;
create policy "staff can read gateway payments" on public.gateway_payments for select to authenticated using (true);

-- Called only by the razorpay edge function (service role) after a payment is verified.
-- Idempotent: the same Razorpay payment id is never counted twice.
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
      select total into v_total from public.quotations where arrangement_id = p_ref;
      update public.arrangements
      set payment_status = case
        when v_total is not null and v_paid >= v_total then 'Receipt Generated'::payment_status
        else 'Payment Received'::payment_status
      end
      where id = p_ref;
    end if;
  end if;
  return true;
end;
$$;
revoke all on function public.apply_gateway_payment(text, text, text, text, text, bigint) from public, anon, authenticated;
grant execute on function public.apply_gateway_payment(text, text, text, text, text, bigint) to service_role;

do $$ begin
  alter publication supabase_realtime add table public.gateway_payments;
exception when duplicate_object then null; end $$;
