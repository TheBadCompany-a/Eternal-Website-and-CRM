-- Tag bookings created through the public website wizard as 'Website' leads
-- so they show up correctly in CRM lead-source reporting.
-- Run after 005_lead_attribution.sql. Same signature as 002, so grants are kept.

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
    service_date, service_time, services, notes, lead_source
  ) values (
    p_family, p_contact_name, p_phone, p_email, p_relationship, p_deceased_name,
    p_service_type, p_need_category, p_pickup_location, p_destination_location,
    p_service_date, p_service_time, coalesce(p_services, '{}'), coalesce(p_notes, ''), 'Website'
  )
  returning arrangements.id, arrangements.access_token into v_id, v_token;

  return query select v_id, v_token;
end;
$$;
