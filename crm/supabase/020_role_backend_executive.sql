-- New staff role. Staff logins are created from the CRM (Drivers & Teams, + Add user),
-- which uses the `create-staff-user` edge function (admin only).
-- Run after 019_quotation_service_items.sql.
alter type public.app_role add value if not exists 'backend_executive';
