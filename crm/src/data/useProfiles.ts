import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { AppRoleRow } from './database.types';
import { toTeamMember } from './mappers';
import { queryKeys } from './queryKeys';

export function useProfiles() {
  return useQuery({
    queryKey: queryKeys.profiles,
    queryFn: async () => {
      const [{ data: profiles, error: profilesError }, { data: active, error: activeError }] = await Promise.all([
        supabase.from('profiles').select('*').order('full_name'),
        supabase
          .from('arrangements')
          .select('coordinator_id')
          .is('deleted_at', null)
          .neq('status', 'Completed')
          .not('coordinator_id', 'is', null),
      ]);
      if (profilesError) throw profilesError;
      if (activeError) throw activeError;

      const activeCounts = new Map<string, number>();
      active.forEach((row) => {
        const id = row.coordinator_id as string;
        activeCounts.set(id, (activeCounts.get(id) ?? 0) + 1);
      });

      return profiles.map((p) => toTeamMember(p, activeCounts.get(p.id) ?? 0));
    },
  });
}

/** Admin-only in practice — the profiles UPDATE RLS policy + the
 * prevent_role_escalation trigger reject this for a non-admin caller. */
export function useUpdateProfileRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, appRole }: { id: string; appRole: AppRoleRow }) => {
      const { error } = await supabase.from('profiles').update({ app_role: appRole }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles }),
  });
}

/** Lets any staff member edit their own contact details and duty status (RLS: own row). */
export function useUpdateOwnProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...changes }: { id: string; full_name: string; phone: string; job_title: string; duty_status: string }) => {
      const { error } = await supabase.from('profiles').update(changes).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles }),
  });
}

/** Admin only: set or correct a staff member's phone number. */
export function useUpdateStaffPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, phone }: { id: string; phone: string }) => {
      const { data, error } = await supabase.from('profiles').update({ phone: phone.trim() || null }).eq('id', id).select('id');
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Only an admin can change a phone number.');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles }),
  });
}

export interface NewStaffInput {
  fullName: string;
  email: string;
  password: string;
  role: AppRoleRow;
  phone: string;
}

/** Admin only: creates a staff login and sets its role (done by the create-staff-user function). */
export function useCreateStaffUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewStaffInput) => {
      const { data, error } = await supabase.functions.invoke('create-staff-user', {
        body: { full_name: input.fullName, email: input.email, password: input.password, role: input.role, phone: input.phone },
      });
      if (error) {
        // Show the message the function sent, if there is one.
        let message = error.message;
        try {
          const body = await (error as { context?: Response }).context?.json();
          if (body?.error) message = body.error;
        } catch {
          // keep the default message
        }
        throw new Error(message);
      }
      const created = data as { id: string };
      // Make sure the phone number is saved on the new profile (the admin is allowed to edit any profile).
      if (input.phone.trim()) {
        const { error: phoneError } = await supabase.from('profiles').update({ phone: input.phone.trim() }).eq('id', created.id);
        if (phoneError) console.error('Phone number could not be saved:', phoneError);
      }
      return created;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles }),
  });
}

/** Admin only: deletes a staff login (done by the delete-staff-user function). Case history is kept. */
export function useDeleteStaffUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.functions.invoke('delete-staff-user', { body: { id } });
      if (error) {
        let message = error.message;
        try {
          const body = await (error as { context?: Response }).context?.json();
          if (body?.error) message = body.error;
        } catch {
          // keep the default message
        }
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.arrangements });
    },
  });
}

/** My own preferences: notification choices, language and photo (RLS: own row). */
export function useUpdateMyPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: { notification_prefs?: Record<string, boolean>; language?: string; avatar_url?: string | null } }) => {
      const { error } = await (supabase as unknown as { from: (t: string) => { update: (c: unknown) => { eq: (k: string, v: string) => Promise<{ error: Error | null }> } } })
        .from('profiles')
        .update(changes)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles }),
  });
}
