import { useQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '../lib/supabaseClient';
import { queryKeys } from './queryKeys';

// payment_entries (migration 027) isn't in the generated database types yet.
const supabase = typedClient as unknown as SupabaseClient;

export interface PaymentEntry {
  id: string;
  arrangementId: string;
  amount: number;
  method: string;
  note: string;
  createdAt: string;
}

/** Every payment ever recorded, newest first. */
export function usePaymentEntries() {
  return useQuery({
    queryKey: queryKeys.paymentEntries,
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_entries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as { id: string; arrangement_id: string; amount: number; method: string; note: string | null; created_at: string }[]).map<PaymentEntry>((r) => ({
        id: r.id,
        arrangementId: r.arrangement_id,
        amount: Number(r.amount),
        method: r.method,
        note: r.note ?? '',
        createdAt: r.created_at,
      }));
    },
    refetchInterval: 20_000,
  });
}
