// "Arrange a Service" wizard on the Services page — submits directly into
// the Eternal CRM (a separate Supabase project from the one concierge.ts
// talks to) via its public create_public_booking RPC, the same one the
// CRM's own internal booking wizard uses. This is additive: it does not
// touch the existing concierge enquiry flow in concierge.ts.
const CRM_SUPABASE_URL = 'https://xcuqaxgmpcrszptjlzva.supabase.co';
const CRM_SUPABASE_KEY = 'sb_publishable_dwu1JAFa5KUaUq9X2wVnNA_iMdFl5t3';

export type NeedCategory =
  | 'Immediate Arrangement'
  | 'Planned Arrangement'
  | 'Transfer / Transportation'
  | 'Not Sure — Guide Me';

export interface BookingDraft {
  needCategory: NeedCategory;
  pickupLocation: string;
  destinationLocation: string;
  date: string;
  time: string;
  services: string[];
  notes: string;
  contactName: string;
  phone: string;
  email: string;
  relationship: string;
  deceasedName: string;
  city: string;
}

export interface BookingReference {
  id: string;
  accessToken: string;
}

async function callCrmRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${CRM_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: CRM_SUPABASE_KEY,
      Authorization: `Bearer ${CRM_SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`CRM request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function submitCrmBooking(draft: BookingDraft): Promise<BookingReference> {
  const rows = await callCrmRpc<{ id: string; access_token: string }[]>('create_public_booking', {
    p_family: draft.contactName ? `${draft.contactName.split(' ')[0]} Family` : 'Family Booking',
    p_contact_name: draft.contactName || 'Valued Family',
    p_phone: draft.phone || '+91 9XXXXXXXXX',
    p_email: draft.email || null,
    p_relationship: draft.relationship || 'Next of Kin',
    p_deceased_name: draft.deceasedName || '',
    p_service_type: draft.needCategory,
    p_need_category: draft.needCategory,
    p_pickup_location: draft.pickupLocation || 'To be confirmed',
    p_destination_location: draft.destinationLocation || 'To be confirmed',
    p_service_date: draft.date || new Date().toISOString().slice(0, 10),
    p_service_time: draft.time || 'To be confirmed',
    p_services: draft.services,
    p_notes: draft.notes || 'Submitted via eternalrepos.com — Arrange a Service',
    p_city: draft.city?.trim() || null,
  });
  const row = rows?.[0];
  if (!row) throw new Error('No booking reference returned');
  return { id: row.id, accessToken: row.access_token };
}

// Contact / enquiry forms (contact page, concierge modal, pre-booking, Book a
// Star) also drop a lead into the CRM. They use the same create_public_booking
// RPC as the wizard — migration 010 tags the row lead_source = 'Website'.
// Fields the forms don't collect get the same placeholders the wizard uses.
export interface CrmLeadInput {
  name?: string;
  phone?: string;
  email?: string;
  organisation?: string;
  city?: string;
  service?: string;
  message?: string;
  source?: string;
  // Optional richer fields (Book a Star knows who the memorial is for).
  deceasedName?: string;
  relationship?: string;
  serviceDate?: string; // yyyy-mm-dd
  services?: string[]; // chosen inclusions (customised package)
}

// Which website form a lead came from. Shown in the CRM Leads "Source / campaign" column.
const PACKAGE_NAMES = ['Essential Farewell', 'Complete Farewell', 'Signature Farewell'];

export function leadFormFor(lead: CrmLeadInput): { form: string; service: string } {
  const svc = lead.service || '';
  if (svc.toLowerCase().startsWith('book a star')) return { form: 'Book a Star', service: svc };
  const pkg = PACKAGE_NAMES.find((n) => svc.includes(n));
  if (pkg) return { form: `Package: ${pkg}`, service: `Package: ${pkg}` };
  switch (lead.source) {
    case 'contact-primary':
      return { form: 'Contact form', service: svc };
    case 'contact-demo':
      return { form: 'Vehicle demo request', service: svc };
    case 'pre-booking':
      return { form: 'Pre-booking form', service: svc };
    case 'custom-package':
      return { form: 'Customised package', service: svc };
    case 'concierge-modal':
      return { form: /institution/i.test(svc) ? 'Institutions enquiry' : 'Concierge popup', service: svc };
    default:
      return { form: 'Website form', service: svc };
  }
}

export async function submitCrmLead(lead: CrmLeadInput): Promise<void> {
  const { form, service } = leadFormFor(lead);
  const notes = [
    lead.service && `Topic: ${lead.service}`,
    lead.organisation && `Organisation: ${lead.organisation}`,
    lead.city && `City: ${lead.city}`,
    lead.message && `Message: ${lead.message}`,
  ]
    .filter(Boolean)
    .join('\n');
  await callCrmRpc('create_website_lead', {
    p_form: form,
    p_name: lead.name?.trim() || null,
    p_phone: lead.phone || null,
    p_email: lead.email || null,
    p_service: service || null,
    p_message: notes,
    p_services: lead.services ?? [],
    p_relationship: lead.relationship || null,
    p_deceased: lead.deceasedName || null,
    p_date: lead.serviceDate || null,
    p_city: lead.city?.trim() || null,
  });
}

/** A family reports a UPI payment (with the transaction reference) for staff to verify. */
export async function reportPaymentClaim(ref: string, amount: number, utr: string): Promise<void> {
  await callCrmRpc('report_payment_claim', { p_ref: ref, p_amount: amount, p_utr: utr });
}

export interface StarBookingInput {
  name: string;
  relationship?: string;
  about?: string;
  birthDate?: string;
  deathDate?: string;
  photoPath?: string;
  requesterName: string;
  requesterPhone: string;
  city?: string;
  ownerEmail: string;
}

/** Saves a Book a Star request in the CRM database (star row + matching lead). */
export async function submitStarBooking(input: StarBookingInput): Promise<{ arrangementId: string }> {
  const rows = await callCrmRpc<{ id: string; arrangement_id: string }[]>('create_star_booking', {
    p_requester_name: input.requesterName.trim(),
    p_phone: input.requesterPhone.trim(),
    p_email: input.ownerEmail.trim(),
    p_name: input.name.trim(),
    p_relationship: input.relationship?.trim() || null,
    p_about: input.about?.trim() || null,
    p_birth_date: input.birthDate || null,
    p_death_date: input.deathDate || null,
    p_photo_path: input.photoPath || null,
    p_city: input.city?.trim() || null,
  });
  return { arrangementId: rows?.[0]?.arrangement_id ?? '' };
}

export interface SkyStar {
  id: string;
  name: string;
  relationship: string | null;
  about: string | null;
  birth_year: number | null;
  death_year: number | null;
  created_at: string;
}

/** Stars booked through "Book a Star" (requested or active) for the Eternal Sky. */
export async function listSkyStars(): Promise<SkyStar[]> {
  return callCrmRpc<SkyStar[]>('list_sky_stars', {});
}

export interface TrackedBooking {
  id: string;
  status: string;
  customerTrackingStage: number;
  coordinator: string | null;
}

export async function getTrackedBooking(ref: BookingReference): Promise<TrackedBooking | null> {
  const rows = await callCrmRpc<
    { id: string; status: string; customer_tracking_stage: number; coordinator_id: string | null }[]
  >('get_arrangement_by_token', { p_id: ref.id, p_token: ref.accessToken });
  const row = rows?.[0];
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    customerTrackingStage: row.customer_tracking_stage,
    coordinator: row.coordinator_id,
  };
}

const STORAGE_KEY = 'eternal-website-booking-ref';

export function saveBookingRef(ref: BookingReference) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
  } catch {
    // best-effort only
  }
}

const SUMMARY_KEY = 'eternal-website-booking-summary';

/** Keeps what the family entered so the confirmation page can still show it after a reload. */
export function saveBookingSummary(draft: BookingDraft) {
  try {
    localStorage.setItem(SUMMARY_KEY, JSON.stringify(draft));
  } catch {
    // best-effort only
  }
}

export function loadBookingSummary(): BookingDraft | null {
  try {
    const raw = localStorage.getItem(SUMMARY_KEY);
    return raw ? (JSON.parse(raw) as BookingDraft) : null;
  } catch {
    return null;
  }
}

export function loadBookingRef(): BookingReference | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookingReference) : null;
  } catch {
    return null;
  }
}
