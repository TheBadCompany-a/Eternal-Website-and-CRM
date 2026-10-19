-- Settings store, activity log, lead rules (first-call time, working hours, auto-assign),
-- staff photo/preferences, and the few settings the website may read.
-- Run after 025_staff_short_code.sql.

create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon;
grant select, insert, update on public.app_settings to authenticated;
drop policy if exists "staff read settings" on public.app_settings;
create policy "staff read settings" on public.app_settings for select to authenticated using (true);
drop policy if exists "admins add settings" on public.app_settings;
create policy "admins add settings" on public.app_settings for insert to authenticated with check (public.is_admin());
drop policy if exists "admins change settings" on public.app_settings;
create policy "admins change settings" on public.app_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.app_settings (key, value) values
 ('business', '{"company_name":"Eternal Repos","tagline":"Tribute in Motion","legal_name":"Consurgo Ventures Pvt. Ltd.","address":"Tower A, 306, ATS Bouquet, Sector 132, Noida 201304","phone":"+91 84486 61338","email":"care@eternalrepos.com","gst":"","emergency_line":"1800-200-8899"}'),
 ('quotation', '{"valid_days":0,"terms":"","tax_percent":0}'),
 ('payment', '{"upi_id":"eternalrepos@icici","upi_name":"Eternal Repos","bank_details":""}'),
 ('templates', jsonb_build_object(
   'quotation', E'Hello {name},\n\nHere is your quotation from Eternal Repos (Ref: {ref}).\nService: {service}\n\n{items}\n\n*Total: {total}*\n\nPlease reply here or call us on {phone} to confirm or ask anything. We are with you every step of the way.',
   'new_lead', E'Hello {name}, thank you for reaching out to Eternal Repos. A member of our care team will call you shortly. Your reference is {ref}.',
   'payment_received', E'Hello {name}, we have received your payment of {amount} for {ref}. Thank you. We are with you every step of the way.',
   'feedback', E'Hello {name}, we hope we were able to support your family well. Would you share a few words about your experience with us? Your reference: {ref}.')),
 ('lead_rules', '{"first_call_hours":2,"auto_assign":false}'),
 ('lists', '{"cities":[{"name":"Delhi","code":"DEL"},{"name":"Gurugram","code":"GGN"},{"name":"Noida","code":"NOI"},{"name":"Ghaziabad","code":"GZB"},{"name":"Faridabad","code":"FBD"}],"services":["Immediate Arrangement","Planned Arrangement","Transfer / Transportation"]}'),
 ('hours', '{"start":"09:00","end":"19:00","days":[1,2,3,4,5,6],"holidays":[]}'),
 ('role_access', '{}'),
 ('retention', '{"note":""}')
on conflict (key) do nothing;

alter table public.profiles add column if not exists notification_prefs jsonb not null default '{"new_lead":true,"follow_up":true,"payment":true,"assigned":true}'::jsonb;
alter table public.profiles add column if not exists language text not null default 'en';
alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "staff upload own avatar" on storage.objects;
create policy "staff upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "staff replace own avatar" on storage.objects;
create policy "staff replace own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Activity log (written by triggers; only admins can read it).
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid,
  actor_name  text,
  action      text not null,
  entity      text,
  entity_id   text,
  details     text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_activity_log_created on public.activity_log (created_at desc);
alter table public.activity_log enable row level security;
revoke all on public.activity_log from anon;
grant select on public.activity_log to authenticated;
drop policy if exists "admins read activity" on public.activity_log;
create policy "admins read activity" on public.activity_log for select to authenticated using (public.is_admin());

create or replace function public.log_activity(p_action text, p_entity text, p_entity_id text, p_details text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.activity_log (actor_id, actor_name, action, entity, entity_id, details)
  values (auth.uid(), coalesce((select full_name from public.profiles where id = auth.uid()), 'System'), p_action, p_entity, p_entity_id, p_details);
end;
$$;
revoke execute on function public.log_activity(text, text, text, text) from public, anon, authenticated;

-- Triggers that record: deleted leads, payments, new/deleted users, role changes,
-- price and visibility changes of services, and changed settings.
create or replace function public.trg_log_lead_deleted() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.log_activity('Deleted lead', 'lead', new.id, new.contact_name); return new; end; $$;
drop trigger if exists log_lead_deleted on public.arrangements;
create trigger log_lead_deleted after update of deleted_at on public.arrangements
  for each row when (old.deleted_at is null and new.deleted_at is not null) execute function public.trg_log_lead_deleted();

create or replace function public.trg_log_payment() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('Recorded payment', 'lead', new.id, 'Rs. ' || (new.paid_amount - old.paid_amount)::text || ' (' || coalesce(new.payment_method, 'n/a') || ')');
  return new;
end; $$;
drop trigger if exists log_payment on public.arrangements;
create trigger log_payment after update of paid_amount on public.arrangements
  for each row when (new.paid_amount > old.paid_amount) execute function public.trg_log_payment();

create or replace function public.trg_log_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('Added user', 'user', new.id::text, coalesce(nullif(new.full_name, ''), '(no name)') || ' as ' || new.app_role::text);
  elsif tg_op = 'DELETE' then
    perform public.log_activity('Deleted user', 'user', old.id::text, coalesce(nullif(old.full_name, ''), '(no name)') || ' (' || old.app_role::text || ')');
  elsif new.app_role is distinct from old.app_role then
    perform public.log_activity('Changed role', 'user', new.id::text, coalesce(nullif(new.full_name, ''), '(no name)') || ': ' || old.app_role::text || ' to ' || new.app_role::text);
  end if;
  return null;
end; $$;
drop trigger if exists log_profile_changes on public.profiles;
create trigger log_profile_changes after insert or delete or update of app_role on public.profiles
  for each row execute function public.trg_log_profile();

create or replace function public.trg_log_catalog() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.unit_price is distinct from old.unit_price then
    perform public.log_activity('Changed price', 'service', new.service_key, new.name || ': Rs. ' || old.unit_price::text || ' to Rs. ' || new.unit_price::text);
  end if;
  if new.active is distinct from old.active then
    perform public.log_activity(case when new.active then 'Showed service' else 'Hid service' end, 'service', new.service_key, new.name);
  end if;
  return null;
end; $$;
drop trigger if exists log_catalog_changes on public.service_catalog;
create trigger log_catalog_changes after update of unit_price, active on public.service_catalog
  for each row execute function public.trg_log_catalog();

create or replace function public.trg_log_setting() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.log_activity('Changed setting', 'setting', new.key, new.key); return null; end; $$;
drop trigger if exists log_setting_changes on public.app_settings;
create trigger log_setting_changes after update on public.app_settings
  for each row when (old.value is distinct from new.value) execute function public.trg_log_setting();

-- Rules: first-call time inside working hours, and optional auto-assign to the least busy coordinator.
create or replace function public.setting_json(p_key text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select value from public.app_settings where key = p_key), '{}'::jsonb);
$$;
revoke execute on function public.setting_json(text) from public, anon;
grant execute on function public.setting_json(text) to authenticated;

create or replace function public.next_working_time(p_from timestamptz)
returns timestamptz language plpgsql stable security definer set search_path = public as $$
declare
  h jsonb := public.setting_json('hours');
  start_t time := coalesce((h->>'start')::time, '09:00');
  end_t time := coalesce((h->>'end')::time, '19:00');
  days int[] := coalesce(nullif(array(select jsonb_array_elements_text(coalesce(h->'days', '[]'::jsonb))::int), '{}'), '{1,2,3,4,5,6}');
  holidays text[] := array(select jsonb_array_elements_text(coalesce(h->'holidays', '[]'::jsonb)));
  t timestamp := p_from at time zone 'Asia/Kolkata';
  i int := 0;
begin
  loop
    i := i + 1;
    exit when i > 400;
    if extract(dow from t)::int = any(days) and not (to_char(t, 'YYYY-MM-DD') = any(holidays)) then
      if t::time < start_t then
        return (date_trunc('day', t) + start_t) at time zone 'Asia/Kolkata';
      elsif t::time <= end_t then
        return t at time zone 'Asia/Kolkata';
      end if;
    end if;
    t := date_trunc('day', t) + interval '1 day' + start_t;
  end loop;
  return p_from;
end;
$$;
revoke execute on function public.next_working_time(timestamptz) from public, anon, authenticated;

create or replace function public.apply_lead_rules() returns trigger language plpgsql security definer set search_path = public as $$
declare
  r jsonb := public.setting_json('lead_rules');
  hrs numeric := coalesce((r->>'first_call_hours')::numeric, 2);
  v_coord uuid;
begin
  if new.lead_source = 'Website' then
    new.next_follow_up_at := public.next_working_time(now() + make_interval(mins => (hrs * 60)::int));
  end if;
  if new.coordinator_id is null and coalesce((r->>'auto_assign')::boolean, false) then
    select p.id into v_coord from public.profiles p where p.app_role = 'coordinator'
    order by (select count(*) from public.arrangements a where a.coordinator_id = p.id and a.status <> 'Completed' and a.deleted_at is null), p.created_at
    limit 1;
    new.coordinator_id := v_coord;
  end if;
  return new;
end; $$;
revoke execute on function public.apply_lead_rules() from public, anon, authenticated;
drop trigger if exists apply_lead_rules on public.arrangements;
create trigger apply_lead_rules before insert on public.arrangements for each row execute function public.apply_lead_rules();

-- City codes come from Settings first, then the built-in list (see 018 for the built-in list).
create or replace function public.city_code(p_city text)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select upper(c->>'code') from jsonb_array_elements(coalesce(public.setting_json('lists')->'cities', '[]'::jsonb)) c
      where p_city is not null and btrim(p_city) <> '' and lower(btrim(p_city)) like lower(c->>'name') || '%' limit 1),
    case
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
    end);
$$;

-- What the website may read: the UPI ID for star payments and the care phone.
create or replace function public.get_public_settings()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'upi_id', coalesce(public.setting_json('payment')->>'upi_id', ''),
    'upi_name', coalesce(public.setting_json('payment')->>'upi_name', 'Eternal Repos'),
    'care_phone', coalesce(public.setting_json('business')->>'phone', ''));
$$;
revoke all on function public.get_public_settings() from public;
grant execute on function public.get_public_settings() to anon, authenticated;

do $$ begin
  alter publication supabase_realtime add table public.app_settings;
exception when duplicate_object then null; end $$;
