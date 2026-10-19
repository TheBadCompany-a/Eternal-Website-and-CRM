-- New references read like ER-16OCT26-037 (day, month name, year) in Indian time.
-- Existing references keep their old format so links and records that use them keep working.
create or replace function public.generate_arrangement_id()
returns text
language sql
set search_path = public
as $$
  select 'ER-' || to_char(now() at time zone 'Asia/Kolkata', 'DDMONYY') || '-' || lpad(nextval('public.arrangement_ref_seq')::text, 3, '0');
$$;
