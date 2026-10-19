-- Short, readable staff IDs (ST-001, ST-002 ...) shown in the CRM instead of the long internal id.
-- Run after 024_vehicle_short_code.sql.
create sequence if not exists public.staff_code_seq;
alter table public.profiles add column if not exists staff_code text;

update public.profiles p
set staff_code = 'ST-' || lpad(n.rn::text, 3, '0')
from (select id, row_number() over (order by created_at, id) as rn from public.profiles where staff_code is null) n
where p.id = n.id;
select setval('public.staff_code_seq', greatest((select count(*) from public.profiles), 1));

alter table public.profiles alter column staff_code set default ('ST-' || lpad(nextval('public.staff_code_seq')::text, 3, '0'));
create unique index if not exists profiles_staff_code_key on public.profiles (staff_code);
