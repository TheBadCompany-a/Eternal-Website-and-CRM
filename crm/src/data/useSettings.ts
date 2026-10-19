import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '../lib/supabaseClient';
import { useAuth } from '../auth/useAuth';
import { DEFAULT_SETTINGS, withDefaults, type AllSettings } from '../lib/settings';
import { queryKeys } from './queryKeys';

// app_settings and activity_log (migration 026) aren't in the generated database types yet.
const supabase = typedClient as unknown as SupabaseClient;

/** All settings, filled in with defaults for anything not saved yet. */
export function useAppSettings() {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.settings,
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('key, value');
      if (error) throw error;
      return new Map((data as { key: string; value: unknown }[]).map((r) => [r.key, r.value]));
    },
    staleTime: 30_000,
  });
  const saved = query.data;
  const settings = (Object.keys(DEFAULT_SETTINGS) as (keyof AllSettings)[]).reduce(
    (all, key) => ({ ...all, [key]: withDefaults(key, saved?.get(key)) }),
    {} as AllSettings,
  );
  return { settings, isLoading: query.isLoading, isError: query.isError };
}

export function useSaveSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value, userId }: { key: keyof AllSettings; value: unknown; userId: string | undefined }) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_by: userId ?? null, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
  });
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}

export function useActivityLog(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.activity,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return (data as { id: string; actor_name: string | null; action: string; details: string | null; created_at: string }[]).map<ActivityEntry>((r) => ({
        id: r.id,
        actor: r.actor_name ?? 'System',
        action: r.action,
        details: r.details ?? '',
        createdAt: r.created_at,
      }));
    },
    refetchInterval: 30_000,
  });
}
