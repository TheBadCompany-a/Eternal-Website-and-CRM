-- Replace the active service catalog with the 14 services shown on the website, in one group, names only.
-- Prices start at 0; set them in Service Plans. Earlier items are hidden, not deleted,
-- so existing quotations and package configurations keep their saved prices and labels.
-- Run after 017_service_catalog_prices.sql.
update public.service_catalog set active = false
where service_key is null or service_key not like 'site-%';

insert into public.service_catalog (service_key, name, category, unit_price, active) values
  ('site-transport-documentation',  'Transport & Documentation Support',                              'Services', 0, true),
  ('site-pre-post-coordination',    'Pre & Post Funeral Service Coordination',                        'Services', 0, true),
  ('site-prayer-hall',              'Prayer Hall Booking',                                            'Services', 0, true),
  ('site-hall-decoration',          'Hall Decoration',                                                'Services', 0, true),
  ('site-catering',                 'Catering',                                                       'Services', 0, true),
  ('site-obituary-writing',         'Obituary Writing',                                               'Services', 0, true),
  ('site-memorial-mementos',        'Memorial Service & Memory Mementos',                             'Services', 0, true),
  ('site-funeral-flower-decor',     'Funeral Flower Decor',                                           'Services', 0, true),
  ('site-asthi-visarjan',           'Asthi Visarjan',                                                 'Services', 0, true),
  ('site-grief-counselling',        'Grief Counselling',                                              'Services', 0, true),
  ('site-subscription-plans',       'Subscription / Pre-Booking Plans',                               'Services', 0, true),
  ('site-insurance-tie-ups',        'Insurance Company Tie-Ups',                                      'Services', 0, true),
  ('site-international-repatriation','International Repatriation',                                    'Services', 0, true),
  ('site-end-to-end-documentation', 'End-to-End Documentation Assistance (Intercity/International)',  'Services', 0, true)
on conflict (service_key) do update
  set name = excluded.name, category = excluded.category, unit_price = excluded.unit_price, active = excluded.active;
