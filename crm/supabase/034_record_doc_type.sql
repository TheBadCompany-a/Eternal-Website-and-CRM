-- What kind of document each record is (death summary, police NOC, receipt...).
-- Run after 033_records.sql.
alter table public.records add column if not exists doc_type text not null default 'Other';
