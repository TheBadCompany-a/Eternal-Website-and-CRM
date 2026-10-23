-- A separate discount on each quotation.
-- Package and catalog prices are never edited: the discount is its own amount, subtracted at the end.
--   subtotal = every charge and every service on the quotation, at its listed price
--   discount = what the family is given off (never more than the subtotal)
--   total    = subtotal - discount
-- Run after 019_quotation_service_items.sql.

alter table public.quotations add column if not exists discount numeric(12,2) not null default 0;
alter table public.quotations add column if not exists subtotal numeric(12,2) not null default 0;
alter table public.quotations drop constraint if exists quotations_discount_not_negative;
alter table public.quotations add constraint quotations_discount_not_negative check (discount >= 0);

create or replace function public.compute_quotation_total()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.subtotal := coalesce(new.vehicle, 0) + coalesce(new.distance, 0) + coalesce(new.staff, 0)
                + coalesce(new.additional_services, 0) + coalesce(new.florals, 0) + coalesce(new.rituals, 0)
                + coalesce(new.waiting_charges, 0) + coalesce(new.other, 0)
                + coalesce((select sum(i.unit_price * i.quantity) from public.quotation_items i where i.arrangement_id = new.arrangement_id), 0);
  new.discount := least(coalesce(new.discount, 0), new.subtotal);
  new.total := new.subtotal - new.discount;
  return new;
end;
$$;

-- Fill in the subtotal for quotations that already exist (discount stays 0, so totals do not change).
update public.quotations set vehicle = vehicle;
