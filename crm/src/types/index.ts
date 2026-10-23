export type NeedCategory =
  | 'Immediate Arrangement'
  | 'Planned Arrangement'
  | 'Transfer / Transportation'
  | 'Not Sure — Guide Me';

export type ArrangementStatus =
  | 'New Inquiry'
  | 'Contacted'
  | 'Plan Review'
  | 'Quotation'
  | 'Confirmed'
  | 'In Execution'
  | 'Completed';

export type QuotationStatus = 'Draft' | 'Sent' | 'Viewed' | 'Approved';

export type PaymentStatus =
  | 'Estimate'
  | 'Final Amount'
  | 'Payment Requested'
  | 'Payment Received'
  | 'Receipt Generated'
  | 'Advance Received';

export type LeadSource = 'Unattributed' | 'Website' | 'Google Ads' | 'Meta Ads' | 'WhatsApp' | 'Referral' | 'Walk-in' | 'Other';
export type CustomerClassification = 'New customer' | 'Returning customer' | 'Corporate' | 'Partner referral' | 'VIP';
export type LeadPriority = 'Standard' | 'High' | 'Urgent';

export interface Quotation {
  vehicle: number;
  distance: number;
  staff: number;
  additionalServices: number;
  florals: number;
  rituals: number;
  waitingCharges: number;
  other: number;
  /** Everything on the quotation at its listed price. */
  subtotal: number;
  /** Taken off at the end. Package and catalog prices are never changed by it. */
  discount: number;
  /** subtotal - discount, worked out by the database. */
  total: number;
  status: QuotationStatus;
}

export interface ChecklistState {
  vehicleAvailable: boolean;
  vehicleCleaned: boolean;
  equipmentReady: boolean;
  driverAssigned: boolean;
  destinationConfirmed: boolean;
  customerContacted: boolean;
  docsChecked: boolean;
  additionalServicesConfirmed: boolean;
}

export interface Feedback {
  rating: number;
  comment: string;
  status: 'Submitted';
}

export interface Arrangement {
  id: string;
  family: string;
  contactName: string;
  phone: string;
  email: string;
  relationship: string;
  deceasedName: string;
  serviceType: string;
  needCategory: NeedCategory;
  pickupLocation: string;
  destinationLocation: string;
  date: string;
  time: string;
  distanceKm: number;
  estDuration: string;
  services: string[];
  notes: string;
  quotation: Quotation;
  paidAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  status: ArrangementStatus;
  coordinator: string;
  executive: string;
  executiveId: string | null;
  nextAction: string;
  escalationLevel: number;
  driver: string;
  vehicle: string;
  supportStaff: string[];
  createdAt: string;
  leadSource: LeadSource;
  leadCampaign: string;
  externalLeadId: string;
  customerClassification: CustomerClassification;
  priority: LeadPriority;
  isSensitive: boolean;
  bookingStatus: string;
  nextFollowUpAt: string | null;
  /** The family chose not to give feedback. Does not affect completing the service. */
  feedbackDeclined: boolean;
  checklist: ChecklistState;
  fieldExecutionStage: 1 | 2 | 3 | 4 | 5;
  customerTrackingStage: 1 | 2 | 3 | 4 | 5 | 6;
  feedback: Feedback | null;
}

export interface CaseHandover {
  id: string;
  arrangementId: string;
  fromProfile: string | null;
  fromName: string;
  toProfile: string | null;
  toName: string;
  reason: string;
  nextAction: string;
  automatic: boolean;
  createdAt: string;
}

export interface Callback {
  id: string;
  family: string;
  phone: string;
  waitingMins: number;
  reason: string;
}

export interface Vehicle {
  id: string;
  /** Short readable ID such as VH-001. */
  code: string;
  model: string;
  reg: string;
  type: string;
  status: 'On Duty' | 'Available' | 'Under Maintenance';
  assignedCase: string;
  driver: string;
  location: string;
}

export interface TeamMember {
  id: string;
  /** Short readable ID such as ST-001. */
  code: string;
  name: string;
  role: string;
  status: 'On Duty' | 'Available' | 'Off Duty';
  activeCases: number;
  phone: string;
  /** The permission role (admin/coordinator) — distinct from `role` above,
   * which is just a display job title (e.g. "Hearse Pilot"). */
  appRole: 'admin' | 'coordinator' | 'sales' | 'accounts' | 'hr' | 'operations' | 'driver' | 'backend_executive';
}

export interface Communication {
  id: string;
  caseId: string;
  channel: 'WhatsApp' | 'Call' | 'SMS' | 'Email';
  sender: string;
  text: string;
  time: string;
}

export type CrmSidebarItem =
  | 'dashboard'
  | 'arrangements'
  | 'leads'
  | 'stars'
  | 'tributes'
  | 'customers'
  | 'service-plans'
  | 'quotations'
  | 'bookings'
  | 'operations'
  | 'driver-app'
  | 'configurator'
  | 'vehicles'
  | 'team'
  | 'hr'
  | 'documents'
  | 'records'
  | 'payments'
  | 'communications'
  | 'feedback'
  | 'reports'
  | 'settings';

/**
 * Pure client UI state only (which sidebar tab is active, filters, the
 * currently-selected ops case). Server data (arrangements, callbacks,
 * fleet, profiles, communications) lives in Supabase and is read/written
 * via the React Query hooks in src/data/, not here — see AppStateContext.tsx.
 */
export interface AppState {
  activeCrmSidebarItem: CrmSidebarItem;
  activeOpsCaseId: string | null;
  /** Set by an Open button; Operations then starts on that case instead of the live board. */
  opsOpenRequest: boolean;
  searchFilter: string;
}

export type ToastType = 'info' | 'alert' | 'sos';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}
