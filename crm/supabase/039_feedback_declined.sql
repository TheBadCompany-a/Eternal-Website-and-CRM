-- A family may decline to give feedback. That must not stop the service being completed,
-- so it is recorded on its own, separate from the service and payment statuses.
-- Run after 001_schema.sql.
alter table public.arrangements add column if not exists feedback_declined boolean not null default false;
