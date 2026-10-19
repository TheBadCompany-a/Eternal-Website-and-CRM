import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { toCallback } from './mappers';
import { queryKeys } from './queryKeys';

export function useCallbacks() {
  return useQuery({
    queryKey: queryKeys.callbacks,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('callbacks')
        .select('*')
        .is('resolved_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(toCallback);
    },
    refetchInterval: 15_000,
  });
}

export function useAddCallbackRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone, reason }: { name: string; phone: string; reason: string }) => {
      const { error } = await supabase.from('callbacks').insert({
        family: name ? `${name} Family` : 'Guest Inquiry',
        phone: phone || '+91 9XXXXXXXXX',
        reason: reason || 'Requested priority callback via portal',
        waiting_mins: 1,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.callbacks }),
  });
}

export function useResolveCallback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('callbacks').update({ resolved_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.callbacks }),
  });
}
