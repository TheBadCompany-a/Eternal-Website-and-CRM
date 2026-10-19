import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// quotation_items (migration 019) isn't in the generated database types yet.
const loose = supabase as unknown as SupabaseClient;
import type { Quotation } from '../types';
import { queryKeys } from './queryKeys';

type QuotationLineItemPatch = Partial<Pick<Quotation, 'vehicle' | 'distance' | 'staff' | 'additionalServices' | 'florals' | 'rituals' | 'waitingCharges' | 'other'>>;

/** total is a generated column — never sent, the server computes it. Each
 * field is spread explicitly (rather than built from a dynamic key) because
 * postgrest-js's exact-keys check on `.update()` rejects an index-signature
 * object — see the note atop database.types.ts. */
export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ arrangementId, patch }: { arrangementId: string; patch: QuotationLineItemPatch }) => {
      const { error } = await supabase
        .from('quotations')
        .update({
          ...(patch.vehicle !== undefined && { vehicle: patch.vehicle }),
          ...(patch.distance !== undefined && { distance: patch.distance }),
          ...(patch.staff !== undefined && { staff: patch.staff }),
          ...(patch.additionalServices !== undefined && { additional_services: patch.additionalServices }),
          ...(patch.florals !== undefined && { florals: patch.florals }),
          ...(patch.rituals !== undefined && { rituals: patch.rituals }),
          ...(patch.waitingCharges !== undefined && { waiting_charges: patch.waitingCharges }),
          ...(patch.other !== undefined && { other: patch.other }),
        })
        .eq('arrangement_id', arrangementId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

/** Marks the quotation Approved; a DB trigger cascades arrangements.status -> 'Confirmed'. */
export function useApproveQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (arrangementId: string) => {
      const { error } = await supabase.from('quotations').update({ status: 'Approved' }).eq('arrangement_id', arrangementId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

/** Marks a Draft quotation as Sent once it has been shared with the customer. */
export function useMarkQuoteSent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (arrangementId: string) => {
      const { error } = await supabase
        .from('quotations')
        .update({ status: 'Sent' })
        .eq('arrangement_id', arrangementId)
        .eq('status', 'Draft');
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.arrangements }),
  });
}

// ---------------------------------------------------------------------------
// Service items on a quotation (picked from the Service Plans catalog)
// ---------------------------------------------------------------------------
export interface QuotationItem {
  serviceKey: string;
  label: string;
  unitPrice: number;
  quantity: number;
}

export function useQuotationItems(arrangementId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.quoteItems(arrangementId ?? ''),
    enabled: Boolean(arrangementId),
    queryFn: async () => {
      const { data, error } = await loose
        .from('quotation_items')
        .select('service_key, label, unit_price, quantity')
        .eq('arrangement_id', arrangementId as string)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as { service_key: string; label: string; unit_price: number; quantity: number }[]).map<QuotationItem>((r) => ({
        serviceKey: r.service_key,
        label: r.label,
        unitPrice: Number(r.unit_price),
        quantity: r.quantity,
      }));
    },
  });
}

/** Add, change or (with quantity 0) remove one service on a quotation. */
export function useSetQuotationItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ arrangementId, item, remove }: { arrangementId: string; item: QuotationItem; remove?: boolean }) => {
      if (remove) {
        const { error } = await loose.from('quotation_items').delete().eq('arrangement_id', arrangementId).eq('service_key', item.serviceKey);
        if (error) throw error;
        return;
      }
      const { error } = await loose.from('quotation_items').upsert(
        { arrangement_id: arrangementId, service_key: item.serviceKey, label: item.label, unit_price: item.unitPrice, quantity: item.quantity },
        { onConflict: 'arrangement_id,service_key' },
      );
      if (error) throw error;
    },
    onSuccess: (_d, { arrangementId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteItems(arrangementId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.arrangements });
    },
  });
}
