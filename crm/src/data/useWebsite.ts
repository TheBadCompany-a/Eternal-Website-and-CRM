import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '../lib/supabaseClient';
import { queryKeys } from './queryKeys';

// Tables added in migration 013 aren't in the generated database types yet.
const supabase = typedClient as unknown as SupabaseClient;

// ---------------------------------------------------------------------------
// UPI payment claims reported by families from the website
// ---------------------------------------------------------------------------
export interface PaymentClaim {
  id: string;
  arrangementId: string;
  amount: number;
  utr: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

interface ClaimRow {
  id: string;
  arrangement_id: string;
  amount: number;
  utr: string;
  status: PaymentClaim['status'];
  created_at: string;
}

export function usePaymentClaims() {
  return useQuery({
    queryKey: queryKeys.claims,
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_claims').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as ClaimRow[]).map<PaymentClaim>((r) => ({
        id: r.id,
        arrangementId: r.arrangement_id,
        amount: Number(r.amount),
        utr: r.utr,
        status: r.status,
        createdAt: r.created_at,
      }));
    },
    refetchInterval: 15_000,
  });
}

/** Staff checked the UTR against the bank: record the money, then close the claim. */
export function useVerifyClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (claim: PaymentClaim) => {
      const { error } = await supabase.rpc('record_payment', { p_id: claim.arrangementId, p_amount: claim.amount, p_method: 'UPI', p_note: `UTR ${claim.utr}` });
      if (error) throw error;
      const { error: e2 } = await supabase.from('payment_claims').update({ status: 'verified' }).eq('id', claim.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims });
      queryClient.invalidateQueries({ queryKey: queryKeys.arrangements });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentEntries });
    },
  });
}

export function useRejectClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payment_claims').update({ status: 'rejected' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.claims }),
  });
}

// ---------------------------------------------------------------------------
// Name a Star tributes (moderation queue)
// ---------------------------------------------------------------------------
export type TributeStatus = 'pending' | 'approved' | 'rejected';

export interface Tribute {
  id: string;
  slug: string;
  name: string;
  bornYear: number | null;
  passedYear: number | null;
  message: string;
  submitterName: string;
  submitterContact: string;
  status: TributeStatus;
  createdAt: string;
}

interface TributeRow {
  id: string;
  slug: string;
  name: string;
  born_year: number | null;
  passed_year: number | null;
  message: string | null;
  submitter_name: string;
  submitter_contact: string;
  status: TributeStatus;
  created_at: string;
}

export function useTributes() {
  return useQuery({
    queryKey: queryKeys.tributes,
    queryFn: async () => {
      const { data, error } = await supabase.from('tributes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as TributeRow[]).map<Tribute>((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        bornYear: r.born_year,
        passedYear: r.passed_year,
        message: r.message ?? '',
        submitterName: r.submitter_name,
        submitterContact: r.submitter_contact,
        status: r.status,
        createdAt: r.created_at,
      }));
    },
    refetchInterval: 15_000,
  });
}

export function useSetTributeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TributeStatus }) => {
      const { error } = await supabase.from('tributes').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tributes }),
  });
}

// ---------------------------------------------------------------------------
// Razorpay payments recorded by the `razorpay` edge function
// ---------------------------------------------------------------------------
export interface GatewayPayment {
  id: string;
  kind: 'star' | 'diya';
  arrangementId: string | null;
  note: string;
  amount: number; // rupees
  createdAt: string;
}

export function useGatewayPayments() {
  return useQuery({
    queryKey: queryKeys.gateway,
    queryFn: async () => {
      const { data, error } = await supabase.from('gateway_payments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as { id: string; kind: 'star' | 'diya'; arrangement_id: string | null; note: string | null; amount_paise: number; created_at: string }[]).map<GatewayPayment>((r) => ({
        id: r.id,
        kind: r.kind,
        arrangementId: r.arrangement_id,
        note: r.note ?? '',
        amount: Number(r.amount_paise) / 100,
        createdAt: r.created_at,
      }));
    },
    refetchInterval: 15_000,
  });
}
