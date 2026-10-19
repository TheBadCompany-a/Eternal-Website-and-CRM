-- Eternal Repos CRM — optional demo seed data
-- Run AFTER 001, 002, 003 (and ideally after 004, so you're logged in as
-- an admin to see it). Safe to skip entirely if you'd rather start empty.
--
-- This does NOT seed `profiles` — a profile can only exist for a real
-- `auth.users` login, so all seeded arrangements start with no coordinator
-- assigned (coordinator_id is null, shown as "Unassigned" in the CRM) until
-- you assign a real signed-up staff member to them from the Operations
-- screen.

-- ---------------------------------------------------------------------------
-- Arrangements (+ their quotations and feedback)
-- ---------------------------------------------------------------------------

insert into public.arrangements (
  id, family, contact_name, phone, email, relationship, deceased_name,
  service_type, need_category, pickup_location, destination_location,
  service_date, service_time, distance_km, est_duration, services, notes,
  status, paid_amount, payment_method, payment_status,
  driver, vehicle, support_staff,
  checklist_vehicle_available, checklist_vehicle_cleaned, checklist_equipment_ready,
  checklist_driver_assigned, checklist_destination_confirmed, checklist_customer_contacted,
  checklist_docs_checked, checklist_additional_services_confirmed,
  field_execution_stage, customer_tracking_stage, created_at
) values
  (
    'ER-260827-00124', 'Sharma Family', 'Rohit Sharma', '+91 98450 12849', 'rohit.sharma@example.com', 'Son', 'Late Sh. K. L. Sharma',
    'Immediate Transportation & Cremation', 'Immediate Arrangement', 'Manipal Hospital, HAL Old Airport Rd', 'Wilson Garden Crematorium, Bangalore',
    '2026-08-31', '10:00 AM', 14, '45 mins',
    array['Premium Hearse (Mercedes E-Class)','Family Transportation (Innova Crysta)','Floral Arrangement (White Lillies & Marigolds)','Documentation & Death Certificate Assistance','Cremation Coordination'],
    'Family requested serene prayer chants during transit. Traditional brass urn needed.',
    'In Execution', 15000, 'UPI (GPay)', 'Advance Received',
    'Ramesh Kumar (+91 98440 91823)', 'Mercedes-Benz E-Class Hearse (KA-04-HR-2291)', array['Suresh G. (Attendant)','Kiran P. (Ceremonial Assistant)'],
    true, true, true, true, true, true, true, true,
    3, 4, '2026-08-31T08:15:00Z'
  ),
  (
    'ER-260827-00126', 'Reddy Family', 'Ananya Reddy', '+91 99001 84729', 'ananya.r@example.com', 'Daughter', 'Late Smt. Vasundhara Reddy',
    'Immediate Arrangement', 'Immediate Arrangement', 'Apollo Hospital, Bannerghatta Rd', 'Banashankari Crematorium',
    '2026-08-31', '11:30 AM', 18, '55 mins',
    array['Executive Hearse Van','Cremation Slot Coordination','Floral Arrangement'],
    'Immediate hearse required at hospital mortuary gate 2.',
    'New Inquiry', 0, 'Pending', 'Payment Requested',
    'Pending Assignment', 'Pending Assignment', array[]::text[],
    false, false, false, false, false, true, false, false,
    1, 1, '2026-08-31T09:40:00Z'
  ),
  (
    'ER-260826-00120', 'Iyer Family', 'Subramanian Iyer', '+91 97402 33119', 's.iyer@example.com', 'Brother', 'Late V. Iyer',
    'Planned Arrangement', 'Planned Arrangement', 'Residence, Indiranagar 100ft Rd', 'Hebbal Crematorium',
    '2026-08-31', '01:00 PM', 12, '35 mins',
    array['Executive Hearse Van','Priest / religious arrangements','Floral arrangements','Documentation assistance'],
    'Vedic Tamil Brahmin rituals to be conducted by Vedic Acharya.',
    'Confirmed', 31000, 'Bank Transfer (NEFT)', 'Receipt Generated',
    'Suresh Gowda (+91 98441 22891)', 'Force Traveller Premium Hearse (KA-01-MJ-8821)', array['Ganesh R.'],
    true, true, true, true, true, true, true, true,
    1, 3, '2026-08-30T14:20:00Z'
  ),
  (
    'ER-260826-00118', 'Verma Family', 'Kunal Verma', '+91 98112 55901', 'kunal.verma@example.com', 'Son', 'Late O. P. Verma',
    'Full Funeral & Memorial Coordination', 'Planned Arrangement', 'Fortis Hospital, Cunningham Rd', 'Kudlu Gate Crematorium',
    '2026-08-31', '02:30 PM', 22, '1 hr 10 mins',
    array['Premium Hearse (Mercedes E-Class)','Family transportation (12 Seater Tempo)','Floral arrangements (Grand Wreaths)','Priest / religious arrangements','Documentation assistance'],
    'Large gathering expected (50 attendees). Mobile sound system required.',
    'In Execution', 24000, 'Card (POS)', 'Advance Received',
    'Manoj Singh (+91 97312 90114)', 'Mercedes-Benz E-Class Hearse (KA-05-AB-1100)', array['David K.','Praveen T.'],
    true, true, true, true, true, true, true, true,
    4, 4, '2026-08-30T11:00:00Z'
  ),
  (
    'ER-260825-00109', 'Fernandes Family', 'David Fernandes', '+91 98860 44210', 'david.f@example.com', 'Son', 'Late Maria Fernandes',
    'Christian Burial & Chapel Transfer', 'Planned Arrangement', 'St. John''s Medical College', 'Hosur Road Catholic Cemetery',
    '2026-08-30', '04:00 PM', 8, '25 mins',
    array['Hearse / transportation','Burial coordination','Floral arrangements','Documentation assistance'],
    'Casket lowering rigging and canopy tent provided.',
    'Completed', 42000, 'UPI / NetBanking', 'Receipt Generated',
    'Anthony Raj (+91 99011 44512)', 'White Dignity Hearse (KA-03-CC-9011)', array['Joseph M.'],
    true, true, true, true, true, true, true, true,
    5, 6, '2026-08-29T16:00:00Z'
  )
on conflict (id) do nothing;

-- Every arrangement above already got a blank/default quotation row from the
-- create_default_quotation trigger (002) the instant it was inserted; this
-- overwrites those defaults with the real seeded figures. Setting some of
-- these straight to 'Approved' would otherwise fire cascade_quotation_approval
-- and clobber the arrangement statuses we just seeded above (e.g. forcing an
-- already-'Completed' case back to 'Confirmed') — disable that one trigger
-- for this statement only.
alter table public.quotations disable trigger cascade_quotation_approval;

insert into public.quotations (arrangement_id, vehicle, distance, staff, additional_services, florals, rituals, waiting_charges, other, status) values
  ('ER-260827-00124', 12000, 2500, 4000, 5000, 3500, 4500, 1000, 2500, 'Approved'),
  ('ER-260827-00126', 10000, 3000, 3500, 3000, 2500, 2500, 0,    0,    'Sent'),
  ('ER-260826-00120',  9000, 2000, 3000, 4000, 4000, 6000, 1000, 2000, 'Approved'),
  ('ER-260826-00118', 14000, 4000, 6000, 8000, 6000, 5000, 2000, 3000, 'Approved'),
  ('ER-260825-00109', 11000, 2000, 5000, 7000, 5000, 4000, 3000, 5000, 'Approved')
on conflict (arrangement_id) do update set
  vehicle = excluded.vehicle, distance = excluded.distance, staff = excluded.staff,
  additional_services = excluded.additional_services, florals = excluded.florals,
  rituals = excluded.rituals, waiting_charges = excluded.waiting_charges,
  other = excluded.other, status = excluded.status;

alter table public.quotations enable trigger cascade_quotation_approval;

insert into public.feedback (arrangement_id, rating, comment, status) values
  ('ER-260827-00124', 5, 'Very dignified and respectful service. Thank you Anita for your constant support.', 'Submitted'),
  ('ER-260825-00109', 5, 'Exceptional care and punctuality during a difficult day.', 'Submitted')
on conflict (arrangement_id) do nothing;

-- ---------------------------------------------------------------------------
-- Callbacks
-- ---------------------------------------------------------------------------

insert into public.callbacks (family, phone, waiting_mins, reason) values
  ('Reddy Family', '+91 99001 84729', 4, 'Immediate hearse required at Apollo Hospital'),
  ('Fernandes Family', '+91 98860 44210', 11, 'Cemetery reservation document clearance'),
  ('Kapoor Family', '+91 98200 11982', 18, 'Domestic flight mortuary repatriation quotation');

-- ---------------------------------------------------------------------------
-- Fleet
-- ---------------------------------------------------------------------------

insert into public.fleet (model, reg, type, status, assigned_case_id, driver, location) values
  ('Mercedes-Benz E-Class Hearse', 'KA-04-HR-2291', 'Premium Hearse', 'On Duty', 'ER-260827-00124', 'Ramesh Kumar', 'HAL Old Airport Rd'),
  ('Force Traveller Premium Hearse', 'KA-01-MJ-8821', 'Executive Hearse', 'Available', null, 'Suresh Gowda', 'Indiranagar Hub'),
  ('Innova Crysta Family Escort', 'KA-05-AB-1100', 'Family Van', 'On Duty', 'ER-260826-00118', 'Manoj Singh', 'Cunningham Rd'),
  ('White Dignity Hearse Van', 'KA-03-CC-9011', 'Standard Hearse', 'Available', null, 'Anthony Raj', 'Koramangala Depot'),
  ('Mortuary Freezer Transport Van', 'KA-02-LL-4412', 'Freezer Van', 'Under Maintenance', null, 'Workshop Central', 'Service Center')
on conflict (reg) do nothing;

-- ---------------------------------------------------------------------------
-- Communications
-- ---------------------------------------------------------------------------

insert into public.communications (arrangement_id, channel, sender, body, created_at) values
  ('ER-260827-00124', 'WhatsApp', 'Anita Rao', 'Vehicle KA-04-HR-2291 has departed base and is 10 mins away from Manipal Hospital.', '2026-08-31T09:42:00Z'),
  ('ER-260827-00124', 'Call', 'Rohit Sharma (Family)', 'Confirmed hospital discharge papers are signed by Dr. Kulkarni.', '2026-08-31T09:30:00Z'),
  ('ER-260827-00126', 'SMS', 'System Dispatch', 'Urgent callback requested for Reddy Family (+91 99001 84729).', '2026-08-31T09:40:00Z'),
  ('ER-260826-00120', 'Email', 'Subramanian Iyer', 'Sent copy of Cremation NOC form from BBMP health ward.', '2026-08-30T16:15:00Z');
