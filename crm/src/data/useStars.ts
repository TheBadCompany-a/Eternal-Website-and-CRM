import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '../lib/supabaseClient';
import { queryKeys } from './queryKeys';

// star_bookings (migration 011) isn't in the generated database types yet.
const supabase = typedClient as unknown as SupabaseClient;

export type StarStatus = 'requested' | 'active' | 'rejected';

export interface StarBooking {
  id: string;
  arrangementId: string | null;
  name: string;
  relationship: string;
  about: string;
  birthDate: string | null;
  deathDate: string | null;
  requesterName: string;
  requesterPhone: string;
  ownerEmail: string;
  slug: string;
  status: StarStatus;
  notes: string;
  createdAt: string;
}

interface StarRow {
  id: string;
  arrangement_id: string | null;
  name: string;
  relationship: string | null;
  about: string | null;
  birth_date: string | null;
  death_date: string | null;
  requester_name: string;
  requester_phone: string;
  owner_email: string;
  slug: string | null;
  status: StarStatus;
  notes: string | null;
  created_at: string;
}

const toStar = (r: StarRow): StarBooking => ({
  id: r.id,
  arrangementId: r.arrangement_id,
  name: r.name,
  relationship: r.relationship ?? '',
  about: r.about ?? '',
  birthDate: r.birth_date,
  deathDate: r.death_date,
  requesterName: r.requester_name,
  requesterPhone: r.requester_phone,
  ownerEmail: r.owner_email,
  slug: r.slug ?? '',
  status: r.status,
  notes: r.notes ?? '',
  createdAt: r.created_at,
});

export function useStarBookings() {
  return useQuery({
    queryKey: queryKeys.stars,
    queryFn: async () => {
      const { data, error } = await supabase.from('star_bookings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as StarRow[]).map(toStar);
    },
    refetchInterval: 15_000,
  });
}

export interface NewStarInput {
  requesterName: string;
  phone: string;
  email: string;
  name: string;
  relationship: string;
  about: string;
  birthDate: string;
  deathDate: string;
  leadSource: string;
}

/** Staff entry: creates the star request and its CRM lead in one go. */
export function useCreateStarBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewStarInput) => {
      const { error } = await supabase.rpc('create_star_booking', {
        p_requester_name: input.requesterName,
        p_phone: input.phone,
        p_email: input.email,
        p_name: input.name,
        p_relationship: input.relationship || undefined,
        p_about: input.about || undefined,
        p_birth_date: input.birthDate || undefined,
        p_death_date: input.deathDate || undefined,
        p_photo_path: undefined,
        p_lead_source: input.leadSource,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stars });
      queryClient.invalidateQueries({ queryKey: queryKeys.arrangements });
    },
  });
}

export function useUpdateStarBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { status?: StarStatus; slug?: string | null; notes?: string } }) => {
      const { error } = await supabase.from('star_bookings').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stars }),
  });
}
