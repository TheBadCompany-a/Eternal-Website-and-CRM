-- Replace the placeholder catalog with the real price list. Old services are hidden (not deleted),
-- so earlier package configurations keep their saved prices and labels.
-- Run after 008_shared_packages.sql.
update public.service_catalog set active = false
where service_key in ('floral', 'rituals', 'hearse-standard', 'family-transport', 'hearse-premium', 'care');

insert into public.service_catalog (service_key, name, category, unit_price, active) values
  ('decor-basic',        'Basic decor',                              'Decor',                10000, true),
  ('decor-medium',       'Medium decor',                             'Decor',                22000, true),
  ('decor-high-end',     'High-end decor',                           'Decor',                30000, true),
  ('fuel-car-80km',      'Fuel car (80km)',                         'Vehicle',               2400, true),
  ('escort-tailgating',  '5 tailgating escort vehicles',             'Vehicle',              12500, true),
  ('fuel-on-ground',     'Fuel on ground (cremation fuel / wood)',   'Rituals & materials',   9000, true),
  ('pandit-ji',          'Pandit ji (Priest for rites)',             'Rituals & materials',   5600, true),
  ('samagri',            'Complete sacred samagri',                  'Rituals & materials',   6000, true),
  ('memory-token',       'Small memory token',                       'Comfort & memory',       800, true),
  ('water',              'Drinking water',                           'Comfort & memory',       500, true),
  ('hi-tea',             'Hi-tea (up to 50 people)',                 'Comfort & memory',      3000, true),
  ('coordination',       'Coordination',                             'Included services',        0, true),
  ('ground-booking',     'Ground booking & coordination',            'Included services',        0, true)
on conflict (service_key) do update
  set name = excluded.name, category = excluded.category, unit_price = excluded.unit_price, active = excluded.active;

-- The existing Documentation row becomes an included service (no charge).
update public.service_catalog
set name = 'Documentation', category = 'Included services', unit_price = 0, active = true
where service_key = 'documentation';

-- The 8.8 km fuel car is not offered as a separate service.
delete from public.service_catalog where service_key = 'fuel-car-8km';
