import type { Arrangement } from '../types';
import { quotedFor } from './paymentCategory';

/**
 * Three statuses that are tracked separately, so one never hides another:
 *   Service   - where the service itself is
 *   Payment   - how much of the quotation has been paid
 *   Follow up - feedback and after-care
 * A completed service can still have a balance to collect, and a family declining
 * feedback never stops the service being completed.
 */

export type ServiceState = 'Confirmed' | 'In progress' | 'Completed';
export type PaymentState = 'Unpaid' | 'Part paid' | 'Paid';
export type FollowUpState = 'Pending' | 'Scheduled' | 'Completed' | 'Declined';

/** Booked means the family has accepted the quotation: from here on it is a service, not an enquiry. */
export const isBooked = (a: Arrangement) => a.status === 'Confirmed' || a.status === 'In Execution' || a.status === 'Completed';

/** Enquiries that are not booked yet have no service status. */
export function serviceState(a: Arrangement): ServiceState | null {
  if (a.status === 'Confirmed') return 'Confirmed';
  if (a.status === 'In Execution') return 'In progress';
  if (a.status === 'Completed') return 'Completed';
  return null;
}

/** What is still to collect. A star or a fixed package uses its own listed price when there is no quotation amount. */
export const amountDue = (a: Arrangement) => Math.max(0, quotedFor(a) - a.paidAmount);

export function paymentState(a: Arrangement): PaymentState {
  if (a.paidAmount <= 0) return 'Unpaid';
  const quoted = quotedFor(a);
  return quoted > 0 && a.paidAmount < quoted ? 'Part paid' : 'Paid';
}

/** Feedback received or declined closes the follow up. Otherwise it is scheduled if a date is set, else pending. */
export function followUpState(a: Arrangement, now = new Date()): FollowUpState {
  if (a.feedbackDeclined) return 'Declined';
  if (a.feedback) return 'Completed';
  if (a.nextFollowUpAt && new Date(a.nextFollowUpAt).getTime() > now.getTime()) return 'Scheduled';
  return 'Pending';
}

export const SERVICE_BADGE: Record<ServiceState, string> = { Confirmed: 'status-confirmed', 'In progress': 'status-inprogress', Completed: 'status-completed' };
export const PAYMENT_BADGE: Record<PaymentState, string> = { Unpaid: 'status-urgent', 'Part paid': 'status-inquiry', Paid: 'status-completed' };
export const FOLLOW_BADGE: Record<FollowUpState, string> = { Pending: 'status-inquiry', Scheduled: 'status-enroute', Completed: 'status-completed', Declined: 'status-urgent' };
