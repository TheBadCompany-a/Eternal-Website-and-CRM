-- Short, readable vehicle IDs (VH-001, VH-002 ...) shown in the CRM instead of the long internal id.
-- Run after 023_allow_server_to_set_role.sql.
create sequence if not exists public.fleet_code_seq;
alter table public.fleet add column if not exists code text;

update public.fleet f
set code = 'VH-' || lpad(n.rn::text, 3, '0')
from (select id, row_number() over (order by created_at, id) as rn from public.fleet where code is null) n
where f.id = n.id;
select setval('public.fleet_code_seq', greatest((select count(*) from public.fleet), 1));

alter table public.fleet alter column code set default ('VH-' || lpad(nextval('public.fleet_code_seq')::text, 3, '0'));
create unique index if not exists fleet_code_key on public.fleet (code);
