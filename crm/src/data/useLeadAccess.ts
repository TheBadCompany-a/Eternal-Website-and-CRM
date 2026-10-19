import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

const accessKey = (arrangementId: string) => ['lead-access', arrangementId] as const;

/** Profile ids explicitly approved to see one sensitive lead (admins always can). */
export function useLeadAccess(arrangementId: string, enabled: boolean) {
  return useQuery({
    queryKey: accessKey(arrangementId),
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('lead_access').select('profile_id').eq('arrangement_id', arrangementId);
      if (error) throw error;
      return new Set(data.map((row) => row.profile_id));
    },
  });
}

export function useSetLeadAccess(arrangementId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, granted }: { profileId: string; granted: boolean }) => {
      const query = granted
        ? supabase.from('lead_access').insert({ arrangement_id: arrangementId, profile_id: profileId })
        : supabase.from('lead_access').delete().eq('arrangement_id', arrangementId).eq('profile_id', profileId);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accessKey(arrangementId) }),
  });
}
