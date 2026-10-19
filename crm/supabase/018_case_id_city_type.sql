-- Case IDs: ER-[CITY]-[YYMON]-[SERIAL]-[TYPE], e.g. ER-DEL-26OCT-037-ST
-- Type codes: IM immediate, PL planned, TR transfer, ST star, PK package, IN institution, EN general enquiry.
-- Run after 017_service_catalog_prices.sql.
alter table public.arrangements add column if not exists city text;

create or replace function public.city_code(p_city text)
returns text language sql immutable as $$
  select case
    when p_city is null or btrim(p_city) = '' then 'DEL'
    when lower(btrim(p_city)) ~ '^((new )?delhi|ncr|dilli)' then 'DEL'
    when lower(btrim(p_city)) ~ '^(gurgaon|gurugram)' then 'GGN'
    when lower(btrim(p_city)) ~ '^noida' then 'NOI'
    when lower(btrim(p_city)) ~ '^ghaziabad' then 'GZB'
    when lower(btrim(p_city)) ~ '^faridabad' then 'FBD'
    when lower(btrim(p_city)) ~ '^(mumbai|bombay)' then 'BOM'
    when lower(btrim(p_city)) ~ '^(bengaluru|bangalore)' then 'BLR'
    when lower(btrim(p_city)) ~ '^(kolkata|calcutta)' then 'CCU'
    when lower(btrim(p_city)) ~ '^chennai' then 'MAA'
    when lower(btrim(p_city)) ~ '^hyderabad' then 'HYD'
    when lower(btrim(p_city)) ~ '^pune' then 'PNQ'
    when lower(btrim(p_city)) ~ '^jaipur' then 'JAI'
    when lower(btrim(p_city)) ~ '^lucknow' then 'LKO'
    when lower(btrim(p_city)) ~ '^chandigarh' then 'IXC'
    else coalesce(nullif(upper(left(regexp_replace(btrim(p_city), '[^A-Za-z]', '', 'g'), 3)), ''), 'DEL')
  end;
$$;

create or replace function public.case_type_code(p_service text, p_need text)
returns text language sql immutable as $$
  select case
    when lower(coalesce(p_service, '')) like 'book a star%' then 'ST'
    when lower(coalesce(p_service, '')) like 'package%' or lower(coalesce(p_service, '')) = 'customised package' then 'PK'
    when lower(coalesce(p_service, '')) like '%institution%' or lower(coalesce(p_service, '')) like '%fleet leasing%' then 'IN'
    when p_need = 'Immediate Arrangement' then 'IM'
    when p_need = 'Planned Arrangement' then 'PL'
    when p_need = 'Transfer / Transportation' then 'TR'
    else 'EN'
  end;
$$;

create or replace function public.make_case_id(p_city text, p_service text, p_need text)
returns text language sql set search_path = public as $$
  select 'ER-' || public.city_code(p_city) || '-' || to_char(now() at time zone 'Asia/Kolkata', 'YYMON') || '-'
         || lpad(nextval('public.arrangement_ref_seq')::text, 3, '0') || '-' || public.case_type_code(p_service, p_need);
$$;
grant execute on function public.make_case_id(text, text, text) to anon, authenticated;

create or replace function public.generate_arrangement_id()
returns text language sql set search_path = public as $$
  select public.make_case_id(null, null, null);
$$;

-- The three website functions take an optional p_city and build the ID with make_case_id().
drop function if exists public.create_website_lead(text, text, text, text, text, text, text[], text, text, date);
drop function if exists public.create_public_booking(text, text, text, text, text, text, text, need_category, text, text, date, text, text[], text);
drop function if exists public.create_star_booking(text, text, text, text, text, text, date, date, text, text);

create or replace function public.create_website_lead(
  p_form text, p_name text, p_phone text, p_email text, p_service text, p_message text,
  p_services text[], p_relationship text, p_deceased text, p_date date, p_city text default null
)
returns text language plpgsql security definer set search_path = public as $$
declare v_id text;
begin
  insert into public.arrangements (
    id, family, contact_name, phone, email, relationship, deceased_name,
    service_type, need_category, pickup_location, destination_location,
    service_date, service_time, services, notes, lead_source, lead_campaign, next_follow_up_at, city
  ) values (
    public.make_case_id(p_city, p_service, null),
    split_part(coalesce(nullif(p_name, ''), 'Website Enquiry'), ' ', 1) || ' Family',
    coalesce(nullif(p_name, ''), 'Website Enquiry'),
    coalesce(nullif(p_phone, ''), '+91 9XXXXXXXXX'),
    nullif(p_email, ''),
    coalesce(nullif(p_relationship, ''), 'Enquirer'),
    coalesce(p_deceased, ''),
    coalesce(nullif(p_service, ''), 'Website Enquiry'),
    'Not Sure — Guide Me', 'To be confirmed', 'To be confirmed',
    coalesce(p_date, current_date), 'To be confirmed',
    coalesce(p_services, '{}'), coalesce(p_message, ''),
    'Website', left(coalesce(nullif(p_form, ''), 'Website form'), 80),
    now() + interval '2 hours', nullif(btrim(p_city), '')
  )
  returning arrangements.id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_website_lead(text, text, text, text, text, text, text[], text, text, date, text) from public;
grant execute on function public.create_website_lead(text, text, text, text, text, text, text[], text, text, date, text) to anon, authenticated;

create or replace function public.create_public_booking(
  p_family text, p_contact_name text, p_phone text, p_email text, p_relationship text, p_deceased_name text,
  p_service_type text, p_need_category need_category, p_pickup_location text, p_destination_location text,
  p_service_date date, p_service_time text, p_services text[], p_notes text, p_city text default null
)
returns table (id text, access_token uuid) language plpgsql security definer set search_path = public as $$
declare v_id text; v_token uuid;
begin
  insert into public.arrangements (
    id, family, contact_name, phone, email, relationship, deceased_name,
    service_type, need_category, pickup_location, destination_location,
    service_date, service_time, services, notes, lead_source, lead_campaign, next_follow_up_at, city
  ) values (
    public.make_case_id(p_city, p_service_type, p_need_category::text),
    p_family, p_contact_name, p_phone, p_email, p_relationship, p_deceased_name,
    p_service_type, p_need_category, p_pickup_location, p_destination_location,
    p_service_date, p_service_time, coalesce(p_services, '{}'), coalesce(p_notes, ''),
    'Website', 'Arrange a Service wizard', now() + interval '2 hours', nullif(btrim(p_city), '')
  )
  returning arrangements.id, arrangements.access_token into v_id, v_token;
  return query select v_id, v_token;
end;
$$;
revoke all on function public.create_public_booking(text, text, text, text, text, text, text, need_category, text, text, date, text, text[], text, text) from public;
grant execute on function public.create_public_booking(text, text, text, text, text, text, text, need_category, text, text, date, text, text[], text, text) to anon;

create or replace function public.create_star_booking(
  p_requester_name text, p_phone text, p_email text, p_name text, p_relationship text, p_about text,
  p_birth_date date, p_death_date date, p_photo_path text, p_lead_source text default 'Website', p_city text default null
)
returns table (id uuid, arrangement_id text) language plpgsql security definer set search_path = public as $$
declare v_arr text; v_id uuid; v_source text := 'Website';
begin
  if auth.role() = 'authenticated' and p_lead_source is not null then v_source := p_lead_source; end if;
  insert into public.arrangements (
    id, family, contact_name, phone, email, relationship, deceased_name,
    service_type, need_category, pickup_location, destination_location,
    service_date, service_time, services, notes, lead_source, lead_campaign, next_follow_up_at, city
  ) values (
    public.make_case_id(p_city, 'Book a Star — Signature Farewell', null),
    split_part(p_requester_name, ' ', 1) || ' Family', p_requester_name, p_phone, p_email,
    coalesce(nullif(p_relationship, ''), 'Next of Kin'), p_name,
    'Book a Star — Signature Farewell', 'Not Sure — Guide Me', 'To be confirmed', 'To be confirmed',
    coalesce(p_death_date, current_date), 'To be confirmed', '{}',
    'Book a Star request for ' || p_name, v_source, 'Book a Star', now() + interval '2 hours', nullif(btrim(p_city), '')
  )
  returning arrangements.id into v_arr;
  insert into public.star_bookings (arrangement_id, name, relationship, about, birth_date, death_date, photo_path, requester_name, requester_phone, owner_email)
  values (v_arr, p_name, nullif(p_relationship, ''), nullif(p_about, ''), p_birth_date, p_death_date, p_photo_path, p_requester_name, p_phone, lower(p_email))
  returning star_bookings.id into v_id;
  return query select v_id, v_arr;
end;
$$;
revoke all on function public.create_star_booking(text, text, text, text, text, text, date, date, text, text, text) from public;
grant execute on function public.create_star_booking(text, text, text, text, text, text, date, date, text, text, text) to anon, authenticated;

-- Existing IDs move to the new format too (links between tables follow automatically).
update public.arrangements a
set id = 'ER-DEL-' || to_char(created_at at time zone 'Asia/Kolkata', 'YYMON') || '-' || split_part(id, '-', 3) || '-' || public.case_type_code(service_type, need_category::text)
where id ~ '^ER-[0-9]{2}[A-Z]{3}[0-9]{2}-[0-9]{3}$' or id ~ '^ER-[0-9]{6}-[0-9]{3}$';
