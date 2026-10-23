-- Ready-made packages (Essential, Complete, Signature Farewell) as on the website.
-- A package is a named list of catalog services; its price is the sum of their current prices,
-- so editing a price in Service Plans updates every package that uses it.
-- Run after 035_website_services.sql.

-- The components the packages are built from go back on, in one group.
update public.service_catalog set active = true, category = 'Package items'
where service_key in ('decor-basic', 'decor-medium', 'decor-high-end', 'fuel-car-80km', 'escort-tailgating',
                      'fuel-on-ground', 'pandit-ji', 'samagri', 'memory-token', 'water', 'hi-tea');

insert into public.service_catalog (service_key, name, category, unit_price, active) values
  ('fuel-car-8km', 'Fuel car (8.8km)', 'Package items', 264, true)
on conflict (service_key) do update
  set name = excluded.name, category = excluded.category, unit_price = excluded.unit_price, active = excluded.active;

create table if not exists public.service_packages (
  package_key text primary key,
  name text not null,
  tagline text not null default '',
  highlighted boolean not null default false,
  sort_order integer not null default 0,
  service_keys text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.service_packages enable row level security;
revoke all on public.service_packages from anon;
grant select on public.service_packages to authenticated;
grant insert, update, delete on public.service_packages to authenticated;

drop policy if exists "staff can read packages" on public.service_packages;
create policy "staff can read packages" on public.service_packages for select to authenticated using (public.is_staff());
drop policy if exists "admin manages packages" on public.service_packages;
create policy "admin manages packages" on public.service_packages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.service_packages (package_key, name, tagline, highlighted, sort_order, service_keys) values
  ('essential', 'Essential Farewell',
   'Respectful ceremonial transportation with fresh decor, memory token, and essential comforts.',
   false, 1, array['decor-basic', 'fuel-car-8km', 'memory-token', 'water']),
  ('complete', 'Complete Farewell',
   'Complete ceremonial coordination with priest, sacred samagri, cremation fuel, and medium decor.',
   true, 2, array['decor-medium', 'fuel-on-ground', 'pandit-ji', 'samagri', 'fuel-car-80km', 'memory-token', 'water']),
  ('signature', 'Signature Farewell',
   'Grand high-end decor, 5 escort vehicles, hi-tea for guests, priest, samagri, and priority VIP coordination.',
   false, 3, array['decor-high-end', 'escort-tailgating', 'fuel-on-ground', 'pandit-ji', 'samagri', 'hi-tea', 'fuel-car-80km', 'memory-token', 'water'])
on conflict (package_key) do update
  set name = excluded.name, tagline = excluded.tagline, highlighted = excluded.highlighted,
      sort_order = excluded.sort_order, service_keys = excluded.service_keys;
