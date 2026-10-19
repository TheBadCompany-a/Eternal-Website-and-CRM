-- Public read of Book a Star requests for the website's "Eternal Sky".
-- A star appears as soon as it is requested; staff hide it by setting its
-- status to 'rejected' in the CRM. Only safe columns are exposed — never the
-- requester's name, phone or email, or internal notes.
-- Run after 011_star_bookings.sql.

create or replace function public.list_sky_stars()
returns table (id uuid, name text, relationship text, about text, birth_year int, death_year int, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select s.id, s.name, s.relationship, left(s.about, 400),
         extract(year from s.birth_date)::int, extract(year from s.death_date)::int, s.created_at
  from public.star_bookings s
  where s.status in ('requested', 'active')
  order by s.created_at asc
  limit 200;
$$;

revoke all on function public.list_sky_stars() from public;
grant execute on function public.list_sky_stars() to anon, authenticated;
