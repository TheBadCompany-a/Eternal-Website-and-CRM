-- Let a changed arrangement id flow through every table that points at it.
do $$
declare r record;
begin
  for r in
    select conrelid::regclass as tbl, conname, pg_get_constraintdef(oid) as def
    from pg_constraint
    where contype = 'f' and confrelid = 'public.arrangements'::regclass and confupdtype <> 'c'
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format('alter table %s add constraint %I %s on update cascade', r.tbl, r.conname, r.def);
  end loop;
end $$;

-- Old references ER-261016-036 become ER-16OCT26-036 (same running number, date in Indian time).
-- Run after 015_reference_month_name.sql.
update public.arrangements
set id = 'ER-' || to_char(created_at at time zone 'Asia/Kolkata', 'DDMONYY') || '-' || split_part(id, '-', 3)
where id ~ '^ER-[0-9]{6}-[0-9]{3}$';
