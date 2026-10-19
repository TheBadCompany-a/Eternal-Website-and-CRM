import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { REALTIME_TABLE_TO_QUERY_KEY } from './queryKeys';

/**
 * Subscribes once to Postgres Changes on the CRM's live tables and
 * invalidates the matching React Query cache on any insert/update/delete,
 * so one coordinator's edits show up for everyone else without a manual
 * refresh. Mount this only inside the authenticated CRM shell — the public
 * wizard has no reason to open a realtime channel on tables it can't read.
 *
 * Requires Realtime replication to be enabled for these tables in the
 * Supabase dashboard (Database -> Replication) — a separate step from RLS.
 */
export function useRealtimeInvalidate() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const tables = Object.keys(REALTIME_TABLE_TO_QUERY_KEY);
    const channel = supabase.channel('crm-live-updates');

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          queryClient.invalidateQueries({ queryKey: REALTIME_TABLE_TO_QUERY_KEY[table] });
        },
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
