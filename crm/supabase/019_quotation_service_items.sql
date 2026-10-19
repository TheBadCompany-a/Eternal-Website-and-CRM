-- Services chosen from the Service Plans catalog, added to a quotation as extra line items.
-- The quotation total = the 8 fixed lines + all service items (kept up to date by triggers).
-- Run after 018_case_id_city_type.sql.
create table if not exists public.quotation_items (
  id              uuid primary key default gen_random_uuid(),
  arrangement_id  text not null references public.arrangements(id) on update cascade on delete cascade,
  service_key     text not null,
  label           text not null,
  unit_price      numeric(10,2) not null default 0 check (unit_price >= 0),
  quantity        integer not null default 1 check (quantity > 0),
  created_at      timestamptz not null default now(),
  unique (arrangement_id, service_key)
);

alter table public.quotation_items enable row level security;
revoke all on public.quotation_items from anon;
grant select, insert, update, delete on public.quotation_items to authenticated;
drop policy if exists "staff manage quotation items" on public.quotation_items;
create policy "staff manage quotation items" on public.quotation_items for all to authenticated using (true) with check (true);

alter table public.quotations drop column total;
alter table public.quotations add column total numeric(12,2) not null default 0;

create or replace function public.compute_quotation_total()
returns trigger language plpgsql set search_path = public as $$
begin
  new.total := coalesce(new.vehicle, 0) + coalesce(new.distance, 0) + coalesce(new.staff, 0)
             + coalesce(new.additional_services, 0) + coalesce(new.florals, 0) + coalesce(new.rituals, 0)
             + coalesce(new.waiting_charges, 0) + coalesce(new.other, 0)
             + coalesce((select sum(i.unit_price * i.quantity) from public.quotation_items i where i.arrangement_id = new.arrangement_id), 0);
  return new;
end;
$$;
revoke execute on function public.compute_quotation_total() from public, anon, authenticated;
drop trigger if exists quotations_compute_total on public.quotations;
create trigger quotations_compute_total before insert or update on public.quotations
  for each row execute function public.compute_quotation_total();

create or replace function public.refresh_quotation_for_items()
returns trigger language plpgsql set search_path = public as $$
declare v_arr text := coalesce(new.arrangement_id, old.arrangement_id);
begin
  update public.quotations set vehicle = vehicle where arrangement_id = v_arr;
  return null;
end;
$$;
revoke execute on function public.refresh_quotation_for_items() from public, anon, authenticated;
drop trigger if exists quotation_items_refresh on public.quotation_items;
create trigger quotation_items_refresh after insert or update or delete on public.quotation_items
  for each row execute function public.refresh_quotation_for_items();

update public.quotations set vehicle = vehicle;

do $$ begin
  alter publication supabase_realtime add table public.quotation_items;
exception when duplicate_object then null; end $$;
