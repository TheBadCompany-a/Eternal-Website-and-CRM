import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { toVehicle } from './mappers';
import { queryKeys } from './queryKeys';

export function useFleet() {
  return useQuery({
    queryKey: queryKeys.fleet,
    queryFn: async () => {
      const { data, error } = await supabase.from('fleet').select('*').order('model');
      if (error) throw error;
      return data.map(toVehicle);
    },
  });
}

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'On Duty' | 'Available' | 'Under Maintenance' }) => {
      const { error } = await supabase.from('fleet').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.fleet }),
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: { model: string; reg: string; type: string; location: string; driver: string }) => {
      const { error } = await supabase.from('fleet').insert({
        model: vehicle.model,
        reg: vehicle.reg,
        type: vehicle.type || null,
        location: vehicle.location || null,
        driver: vehicle.driver || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.fleet }),
  });
}

/** Names of drivers who can be assigned to a case (driver_directory, migration 021). */
export function useDriverDirectory() {
  return useQuery({
    queryKey: ['driver-directory'],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('driver_directory')
        .select('name')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return (data as { name: string }[]).map((r) => r.name);
    },
  });
}
