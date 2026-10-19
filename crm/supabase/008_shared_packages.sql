-- Shared package sessions: lets a customer open a sales-configurator link on
-- their own device and edit the same package as the coordinator.
-- Run after 007_hr_overview.sql.
--
-- anon has no table grants on package_configurations; the shared page works
-- only through the two token-gated SECURITY DEFINER functions below. The
-- token is the package's unguessable shared_token (uuid).

alter table public.service_catalog add column if not exists service_key text unique;

insert into public.service_catalog (service_key, name, category, unit_price) values
  ('hearse-standard', 'Standard Hearse', 'Vehicle', 12500),
  ('hearse-premium', 'Premium Hearse', 'Vehicle', 25000),
  ('family-transport', 'Family Transport', 'Vehicle', 6500),
  ('floral', 'Floral Arrangement', 'Add-on', 8500),
  ('rituals', 'Ritual Coordination', 'Add-on', 12000),
  ('documentation', 'Documentation Assistance', 'Support', 5000),
  ('care', 'Mortuary Care', 'Support', 9000)
on conflict (service_key) do nothing;

create or replace function public.get_shared_package(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', pc.id,
    'token', pc.shared_token,
    'status', pc.status,
    'customer_name', pc.customer_name,
    'lead_reference', coalesce(pc.arrangement_id, ''),
    'total', pc.total,
    'selected', coalesce((
      select jsonb_agg(sc.service_key)
      from public.package_configuration_items i
      join public.service_catalog sc on sc.id = i.service_id
      where i.configuration_id = pc.id
    ), '[]'::jsonb),
    'catalog', coalesce((
      select jsonb_agg(jsonb_build_object('key', s.service_key, 'category', s.category, 'name', s.name, 'price', s.unit_price) order by s.created_at, s.name)
      from public.service_catalog s
      where s.active and s.service_key is not null
    ), '[]'::jsonb)
  )
  from public.package_configurations pc
  where pc.shared_token = p_token;
$$;

create or replace function public.set_shared_package_services(p_token uuid, p_keys text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_status text;
begin
  select id, status into v_id, v_status
  from public.package_configurations where shared_token = p_token for update;

  if v_id is null then
    raise exception 'Package not found';
  end if;
  if v_status in ('Accepted', 'Converted') then
    raise exception 'This package has been finalised and can no longer be changed';
  end if;

  delete from public.package_configuration_items where configuration_id = v_id;

  insert into public.package_configuration_items (configuration_id, service_id, label, quantity, unit_price)
  select v_id, sc.id, sc.name, 1, sc.unit_price
  from public.service_catalog sc
  where sc.active and sc.service_key = any(coalesce(p_keys, '{}'));

  update public.package_configurations
  set total = coalesce((select sum(unit_price * quantity) from public.package_configuration_items where configuration_id = v_id), 0)
  where id = v_id;

  return public.get_shared_package(p_token);
end;
$$;

revoke execute on function public.get_shared_package(uuid) from public;
revoke execute on function public.set_shared_package_services(uuid, text[]) from public;
grant execute on function public.get_shared_package(uuid) to anon, authenticated;
grant execute on function public.set_shared_package_services(uuid, text[]) to anon, authenticated;
