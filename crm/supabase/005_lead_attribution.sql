-- Lead attribution for advertising and campaign reporting.
-- Run after 003_rls_policies.sql. Existing staff UPDATE access to
-- arrangements covers these columns; no public read access is added.

alter table public.arrangements
  add column if not exists lead_source text not null default 'Unattributed',
  add column if not exists lead_campaign text,
  add column if not exists external_lead_id text;

do $$ begin
  alter table public.arrangements
    add constraint arrangements_lead_source_check
    check (lead_source in ('Unattributed', 'Website', 'Google Ads', 'Meta Ads', 'WhatsApp', 'Referral', 'Walk-in', 'Other'));
exception when duplicate_object then null; end $$;

create index if not exists idx_arrangements_lead_source on public.arrangements(lead_source);
create index if not exists idx_arrangements_lead_campaign on public.arrangements(lead_campaign) where lead_campaign is not null;
create unique index if not exists idx_arrangements_external_lead_id
  on public.arrangements(external_lead_id) where external_lead_id is not null;
