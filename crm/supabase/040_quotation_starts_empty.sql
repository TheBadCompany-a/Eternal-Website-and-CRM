-- New leads used to get an invented quotation of 30,000 (vehicle 11,000, staff 3,500 ...).
-- That hid the fixed prices of a star (4,999) and of the three Farewell packages, and made
-- every enquiry look like it owed money. A quotation now starts empty: the coordinator builds it
-- from the service list, and stars and fixed packages use their own listed price.
-- Run after 038_quotation_discount.sql.

create or replace function public.create_default_quotation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.quotations (arrangement_id, status)
  values (new.id, 'Draft')
  on conflict (arrangement_id) do nothing;
  return new;
end;
$$;

-- Clear the invented amounts on quotations nobody has touched: still a Draft, exactly the old
-- placeholder figures, and no services added. Quotations that were edited, sent or approved stay as they are.
update public.quotations q
set vehicle = 0, distance = 0, staff = 0, additional_services = 0, florals = 0, rituals = 0, waiting_charges = 0, other = 0
where q.status = 'Draft'
  and q.vehicle = 11000 and q.distance = 2500 and q.staff = 3500 and q.additional_services = 4000
  and q.florals = 3500 and q.rituals = 3500 and q.waiting_charges = 0 and q.other = 2000
  and not exists (select 1 from public.quotation_items i where i.arrangement_id = q.arrangement_id);
