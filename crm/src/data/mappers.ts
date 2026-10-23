import { roleLabel } from '../auth/roles';
import type { Arrangement, Callback, ChecklistState, Communication, TeamMember, Vehicle } from '../types';
import type {
  ArrangementRow,
  CallbackRow,
  CommunicationRow,
  FeedbackRow,
  FleetRow,
  ProfileRow,
  QuotationRow,
} from './database.types';

export interface ArrangementJoinRow extends ArrangementRow {
  coordinator: { full_name: string } | null;
  executive?: { full_name: string } | null;
  quotations: QuotationRow | null;
  feedback: FeedbackRow | null;
}

const DEFAULT_QUOTATION: Omit<Arrangement['quotation'], 'total' | 'status' | 'subtotal' | 'discount'> = {
  vehicle: 0,
  distance: 0,
  staff: 0,
  additionalServices: 0,
  florals: 0,
  rituals: 0,
  waitingCharges: 0,
  other: 0,
};

export function toChecklist(row: ArrangementRow): ChecklistState {
  return {
    vehicleAvailable: row.checklist_vehicle_available,
    vehicleCleaned: row.checklist_vehicle_cleaned,
    equipmentReady: row.checklist_equipment_ready,
    driverAssigned: row.checklist_driver_assigned,
    destinationConfirmed: row.checklist_destination_confirmed,
    customerContacted: row.checklist_customer_contacted,
    docsChecked: row.checklist_docs_checked,
    additionalServicesConfirmed: row.checklist_additional_services_confirmed,
  };
}

/** A dynamically-keyed `{ [column]: value }` update object types as an index
 * signature, which postgrest-js's exact-keys check on `.update()` rejects —
 * this switch produces a properly literal-keyed patch instead. */
type ChecklistColumns = Pick<
  ArrangementRow,
  | 'checklist_vehicle_available'
  | 'checklist_vehicle_cleaned'
  | 'checklist_equipment_ready'
  | 'checklist_driver_assigned'
  | 'checklist_destination_confirmed'
  | 'checklist_customer_contacted'
  | 'checklist_docs_checked'
  | 'checklist_additional_services_confirmed'
>;

export function checklistColumnPatch(key: keyof ChecklistState, value: boolean): Partial<ChecklistColumns> {
  switch (key) {
    case 'vehicleAvailable':
      return { checklist_vehicle_available: value };
    case 'vehicleCleaned':
      return { checklist_vehicle_cleaned: value };
    case 'equipmentReady':
      return { checklist_equipment_ready: value };
    case 'driverAssigned':
      return { checklist_driver_assigned: value };
    case 'destinationConfirmed':
      return { checklist_destination_confirmed: value };
    case 'customerContacted':
      return { checklist_customer_contacted: value };
    case 'docsChecked':
      return { checklist_docs_checked: value };
    case 'additionalServicesConfirmed':
      return { checklist_additional_services_confirmed: value };
  }
}

export function toArrangement(row: ArrangementJoinRow): Arrangement {
  const q = row.quotations;

  return {
    id: row.id,
    family: row.family,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email ?? '',
    relationship: row.relationship ?? '',
    deceasedName: row.deceased_name ?? '',
    serviceType: row.service_type,
    needCategory: row.need_category,
    pickupLocation: row.pickup_location,
    destinationLocation: row.destination_location,
    date: row.service_date,
    time: row.service_time,
    distanceKm: row.distance_km ?? 0,
    estDuration: row.est_duration ?? '',
    services: row.services ?? [],
    notes: row.notes,
    quotation: q
      ? {
          vehicle: Number(q.vehicle),
          distance: Number(q.distance),
          staff: Number(q.staff),
          additionalServices: Number(q.additional_services),
          florals: Number(q.florals),
          rituals: Number(q.rituals),
          waitingCharges: Number(q.waiting_charges),
          other: Number(q.other),
          subtotal: Number(q.subtotal ?? q.total),
          discount: Number(q.discount ?? 0),
          total: Number(q.total),
          status: q.status,
        }
      : { ...DEFAULT_QUOTATION, subtotal: 0, discount: 0, total: 0, status: 'Draft' },
    paidAmount: Number(row.paid_amount),
    paymentMethod: row.payment_method ?? 'Pending',
    paymentStatus: row.payment_status,
    status: row.status,
    coordinator: row.coordinator?.full_name || 'Unassigned',
    executive: row.executive?.full_name || row.coordinator?.full_name || 'Unassigned',
    executiveId: (row as unknown as { executive_id?: string | null }).executive_id ?? row.coordinator_id ?? null,
    nextAction: (row as unknown as { next_action?: string }).next_action || '',
    escalationLevel: Number((row as unknown as { escalation_level?: number }).escalation_level || 0),
    driver: row.driver ?? 'To be assigned',
    vehicle: row.vehicle ?? 'To be assigned',
    supportStaff: row.support_staff ?? [],
    createdAt: row.created_at,
    leadSource: row.lead_source ?? 'Unattributed',
    leadCampaign: row.lead_campaign ?? '',
    externalLeadId: row.external_lead_id ?? '',
    customerClassification: row.customer_classification ?? 'New customer',
    priority: row.priority ?? 'Standard',
    isSensitive: row.is_sensitive ?? false,
    bookingStatus: row.booking_status ?? 'Inquiry',
    nextFollowUpAt: row.next_follow_up_at ?? null,
    feedbackDeclined: row.feedback_declined ?? false,
    checklist: toChecklist(row),
    fieldExecutionStage: row.field_execution_stage,
    customerTrackingStage: row.customer_tracking_stage,
    feedback: row.feedback
      ? { rating: row.feedback.rating, comment: row.feedback.comment ?? '', status: 'Submitted' }
      : null,
  };
}

export function toCallback(row: CallbackRow): Callback {
  return {
    id: row.id,
    family: row.family,
    phone: row.phone,
    waitingMins: row.waiting_mins,
    reason: row.reason ?? '',
  };
}

export function toVehicle(row: FleetRow): Vehicle {
  return {
    id: row.id,
    code: row.code ?? row.id.slice(0, 8),
    model: row.model,
    reg: row.reg,
    type: row.type ?? '',
    status: row.status,
    assignedCase: row.assigned_case_id ?? '—',
    driver: row.driver ?? '',
    location: row.location ?? '',
  };
}

export function toTeamMember(row: ProfileRow, activeCases: number): TeamMember {
  return {
    id: row.id,
    code: row.staff_code ?? row.id.slice(0, 8),
    name: row.full_name || '(no name set)',
    role: row.job_title || roleLabel(row.app_role),
    status: row.duty_status as TeamMember['status'],
    activeCases,
    phone: row.phone ?? '',
    appRole: row.app_role,
  };
}

export function toCommunication(row: CommunicationRow): Communication {
  return {
    id: row.id,
    caseId: row.arrangement_id,
    channel: row.channel,
    sender: row.sender,
    text: row.body,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
