/**
 * Hand-written types mirroring supabase/001_schema.sql (no Supabase CLI
 * access in this environment to auto-generate them). Keep in sync with the
 * migration files if the schema changes.
 *
 * NOTE: every Row/Insert/Update/Database shape below is a `type` alias, not
 * an `interface` — this postgrest-js version's generic inference for
 * `.update()`/`.insert()`/`.rpc()` silently resolves to `never` when the
 * table Row type is declared via `interface` instead of `type`. Keep using
 * `type` for anything referenced from Database's Tables/Functions.
 */

export type AppRoleRow = 'admin' | 'coordinator' | 'sales' | 'accounts' | 'hr' | 'operations' | 'driver' | 'backend_executive';
export type NeedCategoryRow = 'Immediate Arrangement' | 'Planned Arrangement' | 'Transfer / Transportation' | 'Not Sure — Guide Me';
export type ArrangementStatusRow = 'New Inquiry' | 'Contacted' | 'Plan Review' | 'Quotation' | 'Confirmed' | 'In Execution' | 'Completed';
export type QuotationStatusRow = 'Draft' | 'Sent' | 'Viewed' | 'Approved';
export type PaymentStatusRow = 'Estimate' | 'Final Amount' | 'Payment Requested' | 'Payment Received' | 'Receipt Generated' | 'Advance Received';
export type LeadSourceRow = 'Unattributed' | 'Website' | 'Google Ads' | 'Meta Ads' | 'WhatsApp' | 'Referral' | 'Walk-in' | 'Other';
export type CustomerClassificationRow = 'New customer' | 'Returning customer' | 'Corporate' | 'Partner referral' | 'VIP';
export type LeadPriorityRow = 'Standard' | 'High' | 'Urgent';
export type VehicleStatusRow = 'On Duty' | 'Available' | 'Under Maintenance';
export type CommChannelRow = 'WhatsApp' | 'Call' | 'SMS' | 'Email';

export type ProfileRow = {
  id: string;
  staff_code?: string | null;
  app_role: AppRoleRow;
  full_name: string;
  job_title: string;
  phone: string | null;
  duty_status: string;
  created_at: string;
  updated_at: string;
};

export type ArrangementRow = {
  id: string;
  family: string;
  contact_name: string;
  phone: string;
  email: string | null;
  relationship: string | null;
  deceased_name: string | null;
  service_type: string;
  need_category: NeedCategoryRow;
  pickup_location: string;
  destination_location: string;
  service_date: string;
  service_time: string;
  distance_km: number | null;
  est_duration: string | null;
  services: string[];
  notes: string;
  status: ArrangementStatusRow;
  paid_amount: number;
  payment_method: string | null;
  payment_status: PaymentStatusRow;
  coordinator_id: string | null;
  driver: string | null;
  vehicle: string | null;
  support_staff: string[];
  checklist_vehicle_available: boolean;
  checklist_vehicle_cleaned: boolean;
  checklist_equipment_ready: boolean;
  checklist_driver_assigned: boolean;
  checklist_destination_confirmed: boolean;
  checklist_customer_contacted: boolean;
  checklist_docs_checked: boolean;
  checklist_additional_services_confirmed: boolean;
  field_execution_stage: 1 | 2 | 3 | 4 | 5;
  customer_tracking_stage: 1 | 2 | 3 | 4 | 5 | 6;
  access_token: string;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  lead_source: LeadSourceRow;
  lead_campaign: string | null;
  external_lead_id: string | null;
  customer_classification: CustomerClassificationRow;
  priority: LeadPriorityRow;
  is_sensitive: boolean;
  booking_status: string;
  next_follow_up_at: string | null;
};

export type QuotationRow = {
  arrangement_id: string;
  vehicle: number;
  distance: number;
  staff: number;
  additional_services: number;
  florals: number;
  rituals: number;
  waiting_charges: number;
  other: number;
  total: number;
  status: QuotationStatusRow;
  created_at: string;
  updated_at: string;
};

export type FeedbackRow = {
  arrangement_id: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
};

export type ArrangementStatusHistoryRow = {
  id: number;
  arrangement_id: string;
  from_status: ArrangementStatusRow | null;
  to_status: ArrangementStatusRow;
  changed_by: string | null;
  changed_at: string;
};

export type CallbackRow = {
  id: string;
  family: string;
  phone: string;
  waiting_mins: number;
  reason: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type FleetRow = {
  id: string;
  code?: string | null;
  model: string;
  reg: string;
  type: string | null;
  status: VehicleStatusRow;
  assigned_case_id: string | null;
  driver: string | null;
  location: string | null;
  created_at: string;
};

export type CommunicationRow = {
  id: string;
  arrangement_id: string;
  channel: CommChannelRow;
  sender: string;
  body: string;
  created_at: string;
};

export type HrAttendanceStatusRow = 'Present' | 'Half day' | 'Absent' | 'On leave';
export type HrLeaveTypeRow = 'Casual' | 'Sick' | 'Earned' | 'Unpaid' | 'Other';
export type HrLeaveStatusRow = 'Pending' | 'Approved' | 'Rejected';

export type HrAttendanceRow = {
  id: string;
  profile_id: string;
  work_date: string;
  status: HrAttendanceStatusRow;
  check_in: string | null;
  check_out: string | null;
  note: string;
  created_at: string;
};

export type HrLeaveRequestRow = {
  id: string;
  profile_id: string;
  leave_type: HrLeaveTypeRow;
  start_date: string;
  end_date: string;
  reason: string;
  status: HrLeaveStatusRow;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

export type HrSalaryRow = { profile_id: string; monthly_salary: number; paid_leave_quota: number; updated_at: string };

export type HrSalaryPaymentRow = {
  id: string;
  profile_id: string;
  pay_month: string;
  amount: number;
  status: 'Pending' | 'Paid';
  paid_on: string | null;
  note: string;
  created_at: string;
};

export type RecordCategoryRow = 'Case' | 'HR' | 'Vehicles' | 'Legal' | 'Finance' | 'Other';

export type RecordRow = {
  id: string;
  title: string;
  category: RecordCategoryRow;
  doc_type: string;
  arrangement_id: string | null;
  file_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  note: string;
  uploaded_by: string | null;
  created_at: string;
};

export type ServicePackageRow = {
  package_key: string;
  name: string;
  tagline: string;
  highlighted: boolean;
  sort_order: number;
  service_keys: string[];
  created_at: string;
};

export type LeadAccessRow = { arrangement_id: string; profile_id: string; created_at: string };

export type DriverStatusRow = 'Assigned' | 'Accepted' | 'En route to pickup' | 'Arrived' | 'Picked up' | 'Completed';

export type DriverTaskRow = {
  id: string;
  arrangement_id: string;
  driver_id: string | null;
  status: DriverStatusRow;
  pickup_lat: number | null;
  pickup_lng: number | null;
  arrival_at: string | null;
  pickup_confirmed_at: string | null;
  completed_at: string | null;
  attendance_confirmed_at: string | null;
  last_location_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DriverTaskUpdateRow = {
  id: string;
  task_id: string;
  status: string;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type DriverExpenseRow = {
  id: string;
  task_id: string;
  category: string;
  amount: number;
  note: string | null;
  receipt_url: string | null;
  submitted_at: string;
  approved_at: string | null;
};

export type ServiceCatalogRow = {
  id: string;
  service_key: string | null;
  name: string;
  category: string;
  unit_price: number;
  active: boolean;
  created_at: string;
};

export type PackageStatusRow = 'Draft' | 'Shared' | 'Accepted' | 'Converted';

export type PackageConfigurationRow = {
  id: string;
  arrangement_id: string | null;
  created_by: string | null;
  customer_name: string;
  status: PackageStatusRow;
  shared_token: string;
  total: number;
  created_at: string;
  updated_at: string;
};

export type SharedPackageJson = {
  id: string;
  token: string;
  status: PackageStatusRow;
  customer_name: string;
  lead_reference: string;
  total: number;
  selected: string[];
  catalog: { key: string; category: string; name: string; price: number }[];
};

type TableDef<Row, Insert, Update> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      hr_attendance: TableDef<
        HrAttendanceRow,
        Partial<Omit<HrAttendanceRow, 'id' | 'created_at'>> & Pick<HrAttendanceRow, 'profile_id'>,
        Partial<HrAttendanceRow>
      >;
      hr_leave_requests: TableDef<
        HrLeaveRequestRow,
        Partial<Omit<HrLeaveRequestRow, 'id' | 'created_at'>> & Pick<HrLeaveRequestRow, 'profile_id' | 'start_date' | 'end_date'>,
        Partial<HrLeaveRequestRow>
      >;
      hr_salary: TableDef<HrSalaryRow, Partial<HrSalaryRow> & Pick<HrSalaryRow, 'profile_id'>, Partial<HrSalaryRow>>;
      hr_salary_payments: TableDef<
        HrSalaryPaymentRow,
        Partial<Omit<HrSalaryPaymentRow, 'id' | 'created_at'>> & Pick<HrSalaryPaymentRow, 'profile_id' | 'pay_month'>,
        Partial<HrSalaryPaymentRow>
      >;
      records: TableDef<
        RecordRow,
        Partial<Omit<RecordRow, 'id' | 'created_at'>> & Pick<RecordRow, 'title' | 'file_path' | 'file_name'>,
        Partial<RecordRow>
      >;
      service_packages: TableDef<ServicePackageRow, Partial<ServicePackageRow> & Pick<ServicePackageRow, 'package_key' | 'name'>, Partial<ServicePackageRow>>;
      lead_access: TableDef<LeadAccessRow, Pick<LeadAccessRow, 'arrangement_id' | 'profile_id'>, Partial<LeadAccessRow>>;
      driver_tasks: TableDef<
        DriverTaskRow,
        Partial<Omit<DriverTaskRow, 'id' | 'created_at' | 'updated_at'>> & Pick<DriverTaskRow, 'arrangement_id'>,
        Partial<Omit<DriverTaskRow, 'id'>>
      >;
      driver_task_updates: TableDef<
        DriverTaskUpdateRow,
        Partial<Omit<DriverTaskUpdateRow, 'id' | 'created_at'>> & Pick<DriverTaskUpdateRow, 'task_id' | 'status'>,
        Partial<DriverTaskUpdateRow>
      >;
      driver_expenses: TableDef<
        DriverExpenseRow,
        Partial<Omit<DriverExpenseRow, 'id' | 'submitted_at'>> & Pick<DriverExpenseRow, 'task_id' | 'category' | 'amount'>,
        Partial<DriverExpenseRow>
      >;
      service_catalog: TableDef<ServiceCatalogRow, Partial<ServiceCatalogRow> & Pick<ServiceCatalogRow, 'name' | 'category'>, Partial<ServiceCatalogRow>>;
      package_configurations: TableDef<
        PackageConfigurationRow,
        Partial<Omit<PackageConfigurationRow, 'id' | 'shared_token' | 'created_at' | 'updated_at'>>,
        Partial<Omit<PackageConfigurationRow, 'id' | 'shared_token'>>
      >;
      profiles: TableDef<ProfileRow, Partial<ProfileRow> & Pick<ProfileRow, 'id'>, Partial<ProfileRow>>;
      arrangements: TableDef<
        ArrangementRow,
        Partial<Omit<ArrangementRow, 'access_token' | 'created_at' | 'updated_at'>> &
          Pick<ArrangementRow, 'family' | 'contact_name' | 'phone' | 'service_type' | 'need_category' | 'pickup_location' | 'destination_location' | 'service_date' | 'service_time'>,
        Partial<Omit<ArrangementRow, 'id'>>
      >;
      quotations: TableDef<QuotationRow, Partial<QuotationRow> & Pick<QuotationRow, 'arrangement_id'>, Partial<QuotationRow>>;
      feedback: TableDef<FeedbackRow, Partial<FeedbackRow> & Pick<FeedbackRow, 'arrangement_id' | 'rating'>, Partial<FeedbackRow>>;
      arrangement_status_history: TableDef<ArrangementStatusHistoryRow, Partial<ArrangementStatusHistoryRow>, Partial<ArrangementStatusHistoryRow>>;
      callbacks: TableDef<
        CallbackRow,
        Partial<Omit<CallbackRow, 'id' | 'created_at'>> & Pick<CallbackRow, 'family' | 'phone'>,
        Partial<CallbackRow>
      >;
      fleet: TableDef<FleetRow, Partial<Omit<FleetRow, 'id' | 'created_at'>> & Pick<FleetRow, 'model' | 'reg'>, Partial<FleetRow>>;
      communications: TableDef<
        CommunicationRow,
        Partial<Omit<CommunicationRow, 'id' | 'created_at'>> & Pick<CommunicationRow, 'arrangement_id' | 'channel' | 'sender' | 'body'>,
        Partial<CommunicationRow>
      >;
    };
    Views: Record<never, never>;
    Functions: {
      get_shared_package: { Args: { p_token: string }; Returns: SharedPackageJson | null };
      set_shared_package_services: { Args: { p_token: string; p_keys: string[] }; Returns: SharedPackageJson };
      get_arrangement_by_token: { Args: { p_id: string; p_token: string }; Returns: ArrangementRow[] };
      soft_delete_arrangement: { Args: { p_id: string }; Returns: undefined };
      advance_field_execution: { Args: { p_id: string }; Returns: undefined };
      generate_arrangement_id: { Args: Record<never, never>; Returns: string };
      record_payment: { Args: { p_id: string; p_amount: number; p_method?: string | null }; Returns: undefined };
      create_public_booking: {
        Args: {
          p_family: string;
          p_contact_name: string;
          p_phone: string;
          p_email: string;
          p_relationship: string;
          p_deceased_name: string;
          p_service_type: string;
          p_need_category: NeedCategoryRow;
          p_pickup_location: string;
          p_destination_location: string;
          p_service_date: string;
          p_service_time: string;
          p_services: string[];
          p_notes: string;
        };
        Returns: { id: string; access_token: string }[];
      };
    };
  };
};
