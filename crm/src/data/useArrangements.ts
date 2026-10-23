import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// make_case_id and arrangements.city (migration 018) aren't in the generated database types yet.
const loose = supabase as unknown as SupabaseClient;
import type { ArrangementStatus, ChecklistState, CustomerClassification, LeadPriority, LeadSource } from '../types';
import type { NeedCategoryRow } from './database.types';
import { checklistColumnPatch, toArrangement, type ArrangementJoinRow } from './mappers';
import { queryKeys } from './queryKeys';

const ARRANGEMENT_SELECT = '*, coordinator:profiles!arrangements_coordinator_id_fkey(full_name), quotations(*), feedback(*)';

/** `enabled: false` when the caller isn't signed in — anon has no SELECT
 * grant on arrangements at all (see 003_rls_policies.sql), so this must
 * never run outside an authenticated CRM session. */
export function useArrangements(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.arrangements,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('arrangements')
        .select(ARRANGEMENT_SELECT)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as ArrangementJoinRow[]).map(toArrangement);
    },
    enabled: options?.enabled ?? true,
    // Fallback for when Realtime isn't enabled on the table: pick up website bookings without a manual refresh.
    refetchInterval: 15_000,
  });
}

export interface NewArrangementInput {
  family: string;
  contactName: string;
  phone: string;
  email: string;
  serviceType: string;
  needCategory: NeedCategoryRow;
  pickupLocation: string;
  destinationLocation: string;
  serviceDate: string;
  serviceTime: string;
  notes: string;
  leadSource: LeadSource;
  city: string;
}

export function useCreateArrangement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewArrangementInput) => {
      const { data: auth } = await supabase.auth.getUser();
      // Generate the reference first and insert without `.select()`: the read
      // policy calls can_access_arrangement(), which can't see a row that is
      // still being inserted, so RETURNING the new row fails row-level security.
      const { data: id, error: idError } = await loose.rpc('make_case_id', {
        p_city: input.city || null,
        p_service: input.serviceType,
        p_need: input.needCategory,
      });
      if (idError) throw idError;
      const { error } = await loose
        .from('arrangements')
        .insert({
          id: id as string,
          city: input.city.trim() || null,
          family: input.family,
          contact_name: input.contactName,
          phone: input.phone,
          email: input.email || null,
          service_type: input.serviceType,
          need_category: input.needCategory,
          pickup_location: input.pickupLocation,
          destination_location: input.destinationLocation,
          service_date: input.serviceDate,
          service_time: input.serviceTime,
          notes: input.notes,
          lead_source: input.leadSource,
          created_by: auth.user?.id ?? null,
        });
      if (error) throw error;
      return id as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

export function useUpdateArrangementStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ArrangementStatus }) => {
      const { error } = await supabase.from('arrangements').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

/** Soft-delete only — sets deleted_at, never a hard DELETE (see
 * supabase/003_rls_policies.sql: there is no DELETE grant on arrangements
 * for anyone). Admin-only: the prevent_unauthorized_delete trigger (002)
 * rejects this for a coordinator regardless of what the UI shows. */
export function useDeleteArrangement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('soft_delete_arrangement', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

/** Assigns (or unassigns) which staff member is the coordinator of record
 * for a case. Distinct from `activeOpsCaseId` in the reducer, which is only
 * "which case is the current viewer looking at" — pure client UI state. */
/** The family chose not to give feedback. This closes the follow up but never blocks completing the service. */
export function useSetFeedbackDeclined() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, declined }: { id: string; declined: boolean }) => {
      const { error } = await supabase.from('arrangements').update({ feedback_declined: declined }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

export function useAssignCoordinator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, coordinatorId }: { id: string; coordinatorId: string | null }) => {
      const { error } = await supabase.from('arrangements').update({ coordinator_id: coordinatorId }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

/** Records where a lead originated. Ad-platform webhooks can set the same
 * fields later; this staff workflow covers manual attribution and corrections. */
/** Sets (or clears) the vehicle and/or driver assigned to a case. */
export function useAssignResources() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vehicle, driver }: { id: string; vehicle?: string | null; driver?: string | null }) => {
      const { error } = await supabase
        .from('arrangements')
        .update({
          ...(vehicle !== undefined && { vehicle }),
          ...(driver !== undefined && { driver }),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

/** Saves the pickup and/or destination typed in by staff (an empty value goes back to "To be confirmed"). */
export function useUpdateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pickup, destination }: { id: string; pickup?: string; destination?: string }) => {
      const clean = (v: string) => v.trim() || 'To be confirmed';
      const { error } = await supabase
        .from('arrangements')
        .update({
          ...(pickup !== undefined && { pickup_location: clean(pickup) }),
          ...(destination !== undefined && { destination_location: clean(destination) }),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

export function useUpdateLeadAttribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, source, campaign, externalLeadId }: { id: string; source: LeadSource; campaign: string; externalLeadId: string }) => {
      const { error } = await supabase
        .from('arrangements')
        .update({ lead_source: source, lead_campaign: campaign || null, external_lead_id: externalLeadId || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

export function useUpdateLeadControls() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, classification, priority, isSensitive, bookingStatus, nextFollowUpAt }: {
      id: string; classification: CustomerClassification; priority: LeadPriority; isSensitive: boolean; bookingStatus: string; nextFollowUpAt: string | null;
    }) => {
      const { error } = await supabase.from('arrangements').update({
        customer_classification: classification, priority, is_sensitive: isSensitive,
        booking_status: bookingStatus, next_follow_up_at: nextFollowUpAt,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, key, value }: { id: string; key: keyof ChecklistState; value: boolean }) => {
      const { error } = await supabase
        .from('arrangements')
        .update(checklistColumnPatch(key, value))
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

export function useAdvanceFieldExecution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('advance_field_execution', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount, method, note }: { id: string; amount: number; method?: string; note?: string }) => {
      const { error } = await (supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: Error | null }> }).rpc('record_payment', {
        p_id: id,
        p_amount: amount,
        p_method: method ?? null,
        p_note: note ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arrangements });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentEntries });
    },
  });
}
