import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '../lib/supabaseClient';
import { useAuth } from '../auth/useAuth';

// credentials (migration 028) isn't in the generated database types.
const supabase = typedClient as unknown as SupabaseClient;
const KEY = ['credentials'] as const;

export interface Credential {
  id: string;
  name: string;
  category: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  hasSecret: boolean;
  updatedAt: string;
}
export interface CredentialInput {
  name: string;
  category: string;
  username: string;
  url: string;
  notes: string;
  secret: string;
}

export function useCredentials() {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: KEY,
    enabled: isAdmin,
    queryFn: async (): Promise<Credential[]> => {
      const { data, error } = await supabase.from('credentials').select('*').order('category').order('name');
      if (error) throw error;
      return (data as Record<string, string | null>[]).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        category: r.category as string,
        username: r.username,
        url: r.url,
        notes: r.notes,
        hasSecret: Boolean(r.vault_secret_id),
        updatedAt: r.updated_at as string,
      }));
    },
  });
}

export function useSaveCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: CredentialInput }) => {
      const { error } = id
        ? await supabase.rpc('credential_update', { p_id: id, p_name: input.name, p_category: input.category, p_username: input.username, p_url: input.url, p_notes: input.notes, p_secret: input.secret || null })
        : await supabase.rpc('credential_create', { p_name: input.name, p_category: input.category, p_username: input.username, p_url: input.url, p_notes: input.notes, p_secret: input.secret });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: ['activity-log'] }); },
  });
}

export function useDeleteCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('credential_delete', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: ['activity-log'] }); },
  });
}

/** Fetches the decrypted secret on demand (this is recorded in the activity log). */
export async function revealCredential(id: string): Promise<string> {
  const { data, error } = await supabase.rpc('credential_reveal', { p_id: id });
  if (error) throw error;
  return (data as string) ?? '';
}

export interface StaffLogin {
  id: string;
  code: string;
  name: string;
  role: string;
  email: string;
  lastSignIn: string | null;
}

/** Every staff member's sign-in email. Passwords are never stored in readable form, so they can't be shown. */
export function useStaffLogins() {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ['staff-logins'],
    enabled: isAdmin,
    queryFn: async (): Promise<StaffLogin[]> => {
      const { data, error } = await supabase.rpc('staff_logins');
      if (error) throw error;
      return (data as Record<string, string | null>[]).map((r) => ({
        id: r.id as string, code: r.staff_code ?? '', name: r.full_name ?? '', role: r.app_role ?? '', email: r.email ?? '', lastSignIn: r.last_sign_in_at,
      }));
    },
  });
}
