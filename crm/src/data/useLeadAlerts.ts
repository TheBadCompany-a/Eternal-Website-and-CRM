import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../toast/useToast';
import { queryKeys } from './queryKeys';
import type { Arrangement } from '../types';

type Prefs = { new_lead?: boolean; follow_up?: boolean; payment?: boolean; assigned?: boolean };

/**
 * On-screen alerts while the CRM is open, following each person's choices in Settings:
 * a new lead, a case assigned to me, a payment to check, and a follow-up that has become due.
 */
export function useLeadAlerts() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const prefs = ((profile as { notification_prefs?: Prefs } | null)?.notification_prefs ?? {}) as Prefs;
  const on = (k: keyof Prefs) => prefs[k] !== false;
  const flags = `${on('new_lead')}${on('assigned')}${on('payment')}`;

  useEffect(() => {
    if (!user) return;
    const cached = () => (queryClient.getQueryData(queryKeys.arrangements) as Arrangement[] | undefined) ?? [];
    const channel = supabase.channel(`alerts-${user.id}`);

    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'arrangements' }, (payload) => {
      const row = payload.new as { id: string; contact_name: string; service_type: string; coordinator_id: string | null };
      if (on('new_lead')) showToast(`New lead: ${row.contact_name} (${row.service_type})`, 'alert');
      if (on('assigned') && row.coordinator_id === user.id) showToast(`A new case was assigned to you: ${row.id}`, 'info');
    });
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'arrangements' }, (payload) => {
      const row = payload.new as { id: string; coordinator_id: string | null; contact_name: string };
      const before = cached().find((a) => a.id === row.id);
      const wasMine = before ? before.coordinator === (profile?.full_name ?? '') : true;
      if (on('assigned') && row.coordinator_id === user.id && before && !wasMine) showToast(`A case was assigned to you: ${row.contact_name} (${row.id})`, 'info');
    });
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payment_claims' }, () => {
      if (on('payment')) showToast('A UPI payment is waiting to be checked (Payments).', 'alert');
    });
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gateway_payments' }, () => {
      if (on('payment')) showToast('A Razorpay payment was received.', 'info');
    });
    // A leave request, for the people who decide on it (HR and admin).
    if (profile?.app_role === 'hr' || profile?.app_role === 'admin') {
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hr_leave_requests' }, (payload) => {
        const row = payload.new as { profile_id: string; leave_type: string; start_date: string; end_date: string };
        if (row.profile_id === user.id) return;
        const who = (queryClient.getQueryData(queryKeys.profiles) as { id: string; name: string }[] | undefined)?.find((p) => p.id === row.profile_id)?.name ?? 'A team member';
        const days = row.start_date === row.end_date ? row.start_date : `${row.start_date} to ${row.end_date}`;
        showToast(`${who} asked for ${row.leave_type.toLowerCase()} leave (${days}). Check HR.`, 'alert');
      });
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, flags, profile?.app_role]);

  // A follow-up that has just become due, for leads assigned to me.
  useEffect(() => {
    if (!user || !on('follow_up')) return;
    const key = `alerted-followups-${user.id}`;
    const tick = () => {
      let seen: string[] = [];
      try { seen = JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { /* ignore */ }
      const due = ((queryClient.getQueryData(queryKeys.arrangements) as Arrangement[] | undefined) ?? []).filter(
        (a) => a.status !== 'Completed' && a.nextFollowUpAt && new Date(a.nextFollowUpAt).getTime() <= Date.now() && a.coordinator === (profile?.full_name ?? '') && !seen.includes(`${a.id}|${a.nextFollowUpAt}`),
      );
      if (!due.length) return;
      due.slice(0, 3).forEach((a) => showToast(`Follow-up due: ${a.contactName || a.family} (${a.id})`, 'alert'));
      try { localStorage.setItem(key, JSON.stringify([...seen, ...due.map((a) => `${a.id}|${a.nextFollowUpAt}`)].slice(-200))); } catch { /* ignore */ }
    };
    const id = window.setInterval(tick, 60_000);
    const first = window.setTimeout(tick, 5_000);
    return () => { window.clearInterval(id); window.clearTimeout(first); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, on('follow_up'), profile?.full_name]);
}
