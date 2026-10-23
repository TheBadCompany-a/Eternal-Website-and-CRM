import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '../lib/supabaseClient';
import { useAuth } from '../auth/useAuth';
import type { CaseHandover } from '../types';
import { queryKeys } from './queryKeys';

const supabase = typedClient as unknown as SupabaseClient;

const LOCAL_STORAGE_KEY = 'eternal_crm_handovers';

function getLocalHandovers(arrangementId: string): CaseHandover[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const all: CaseHandover[] = JSON.parse(raw);
    return all.filter((h) => h.arrangementId === arrangementId);
  } catch {
    return [];
  }
}

function saveLocalHandover(handover: CaseHandover) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const all: CaseHandover[] = raw ? JSON.parse(raw) : [];
    all.unshift(handover);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore localStorage errors
  }
}

export function useCaseHandovers(arrangementId: string | null | undefined) {
  return useQuery({
    queryKey: ['handovers', arrangementId],
    enabled: Boolean(arrangementId),
    queryFn: async (): Promise<CaseHandover[]> => {
      if (!arrangementId) return [];
      try {
        const { data, error } = await supabase
          .from('case_handovers')
          .select('*, from:profiles!case_handovers_from_profile_fkey(full_name), to:profiles!case_handovers_to_profile_fkey(full_name)')
          .eq('arrangement_id', arrangementId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const remoteHandovers: CaseHandover[] = (data as unknown as Record<string, unknown>[]).map((r) => ({
            id: r.id as string,
            arrangementId: r.arrangement_id as string,
            fromProfile: r.from_profile as string | null,
            fromName: ((r.from as { full_name?: string } | null)?.full_name) || 'Staff',
            toProfile: r.to_profile as string | null,
            toName: ((r.to as { full_name?: string } | null)?.full_name) || 'Executive',
            reason: (r.reason as string) || '',
            nextAction: (r.next_action as string) || '',
            automatic: Boolean(r.automatic),
            createdAt: (r.created_at as string) || new Date().toISOString(),
          }));

          const local = getLocalHandovers(arrangementId);
          const combined = [...remoteHandovers];
          for (const loc of local) {
            if (!combined.some((c) => c.id === loc.id)) {
              combined.push(loc);
            }
          }
          return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch {
        // Table not present in DB, fall back to local
      }

      return getLocalHandovers(arrangementId);
    },
    refetchInterval: 15_000,
  });
}

export interface HandoverInput {
  arrangementId: string;
  fromName?: string;
  toProfileId: string;
  toName: string;
  reason: string;
  nextAction: string;
  dueIso?: string;
}

export function useHandOverCase() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ arrangementId, toProfileId, toName, reason, nextAction, dueIso }: HandoverInput) => {
      const fromName = profile?.full_name || user?.email || 'Staff';
      const fromProfileId = user?.id || null;

      const handoverRecord: CaseHandover = {
        id: `ho-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        arrangementId,
        fromProfile: fromProfileId,
        fromName,
        toProfile: toProfileId,
        toName,
        reason,
        nextAction,
        automatic: false,
        createdAt: new Date().toISOString(),
      };

      // Always save locally so handover history is visible immediately and reliably
      saveLocalHandover(handoverRecord);

      // Attempt DB RPC or update
      try {
        await supabase.rpc('hand_over_case', {
          p_arrangement_id: arrangementId,
          p_to: toProfileId,
          p_reason: reason,
          p_next_action: nextAction,
          p_due: dueIso || null,
        });
      } catch {
        // Fallback: try direct table update on arrangements if RPC is not installed
        try {
          await supabase
            .from('arrangements')
            .update({
              coordinator_id: toProfileId,
              next_action: nextAction,
              next_follow_up_at: dueIso || undefined,
            })
            .eq('id', arrangementId);
        } catch {
          // Ignore table schema error
        }
      }

      // Also log communication entry so history appears in timeline
      try {
        await supabase.from('communications').insert({
          arrangement_id: arrangementId,
          channel: 'Call',
          sender: fromName,
          body: `Handover to ${toName}. Reason: ${reason}. Next action: ${nextAction || 'None'}`,
        });
      } catch {
        // Ignore
      }

      return handoverRecord;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['handovers', vars.arrangementId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.arrangements });
      queryClient.invalidateQueries({ queryKey: queryKeys.communications(vars.arrangementId) });
    },
  });
}
