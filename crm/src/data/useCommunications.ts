import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Communication } from '../types';
import { toCommunication } from './mappers';
import { queryKeys } from './queryKeys';

export function useCommunications(arrangementId?: string) {
  return useQuery({
    queryKey: queryKeys.communications(arrangementId),
    queryFn: async () => {
      let query = supabase.from('communications').select('*').order('created_at', { ascending: false });
      if (arrangementId) query = query.eq('arrangement_id', arrangementId);
      const { data, error } = await query;
      if (error) throw error;
      return data.map(toCommunication);
    },
  });
}

export function useSendCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ arrangementId, channel, text }: { arrangementId: string; channel: Communication['channel']; text: string }) => {
      const { error } = await supabase.from('communications').insert({
        arrangement_id: arrangementId,
        channel,
        sender: 'Coordinator Office',
        body: text,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communications'] }),
  });
}
