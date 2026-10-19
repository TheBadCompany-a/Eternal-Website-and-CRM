import { submitCrmLead, type CrmLeadInput } from './crmBooking';

// Concierge enquiries — submit to Supabase (insert-only public key), and
// read/update via a passphrase-gated Edge Function (service role, server-side).
export const SUPABASE_URL = 'https://hzphjyiucnskykbijjvp.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_eSN4kyPbAJrb_a79nbUouQ_3FTWBuN0';

export interface EnquiryPayload {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  organisation?: string;
  service?: string;
  message?: string;
  source?: string;
  /** CRM-only extras; never sent to the concierge enquiries table. */
  /** Skip the generic CRM lead (the caller already saved a richer one). */
  skipCrm?: boolean;
  crm?: Pick<CrmLeadInput, 'deceasedName' | 'relationship' | 'serviceDate' | 'services'>;
}

export interface Enquiry extends EnquiryPayload {
  id: string;
  created_at: string;
  status: string;
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<void> {
  // Mirror every enquiry into the CRM as a 'Website' lead. Best-effort: a CRM
  // failure must never break the visitor's form submission.
  const { crm, skipCrm, ...enquiry } = payload;
  if (!skipCrm) submitCrmLead({ ...enquiry, ...crm }).catch((err) => console.error('CRM lead sync failed:', err));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/eternal_concierge_enquiries`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(enquiry),
  });
  if (!res.ok) throw new Error(`Enquiry submit failed (${res.status})`);
}

export async function listEnquiries(passphrase: string): Promise<Enquiry[]> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/eternal-concierge`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'list', passphrase }),
  });
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) throw new Error(`list failed (${res.status})`);
  const data = await res.json();
  return data.enquiries as Enquiry[];
}

export async function setEnquiryStatus(passphrase: string, id: string, status: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/functions/v1/eternal-concierge`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'update', passphrase, id, status }),
  });
}
