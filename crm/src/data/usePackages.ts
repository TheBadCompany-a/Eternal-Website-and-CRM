import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { PackageStatusRow, SharedPackageJson } from './database.types';

export type SharedPackage = SharedPackageJson;

/** How often both sides re-read the package so each sees the other's changes. */
const LIVE_REFRESH_MS = 3000;

const packageKey = (token: string | null) => ['shared-package', token] as const;

export function useSharedPackage(token: string | null) {
  return useQuery({
    queryKey: packageKey(token),
    enabled: Boolean(token),
    refetchInterval: LIVE_REFRESH_MS,
    staleTime: 0,
    queryFn: async (): Promise<SharedPackage | null> => {
      const { data, error } = await supabase.rpc('get_shared_package', { p_token: token as string });
      if (error) throw error;
      return data;
    },
  });
}

/** Replaces the package's selected services (used by both coordinator and customer). */
export function useSetPackageServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, keys }: { token: string; keys: string[] }): Promise<SharedPackage> => {
      const { data, error } = await supabase.rpc('set_shared_package_services', { p_token: token, p_keys: keys });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, { token }) => queryClient.setQueryData(packageKey(token), data),
  });
}

export function useServiceCatalog() {
  return useQuery({
    queryKey: ['service-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_catalog').select('service_key, name, category, unit_price').eq('active', true).not('service_key', 'is', null).order('created_at');
      if (error) throw error;
      return data.map((row) => ({ key: row.service_key as string, name: row.name, category: row.category, price: Number(row.unit_price) }));
    },
  });
}

export function useCreatePackage() {
  return useMutation({
    mutationFn: async ({ arrangementId, customerName, createdBy }: { arrangementId: string; customerName: string; createdBy: string }) => {
      const { data, error } = await supabase
        .from('package_configurations')
        .insert({ arrangement_id: arrangementId || null, customer_name: customerName, created_by: createdBy })
        .select('id, shared_token')
        .single();
      if (error) throw error;
      return { id: data.id, token: data.shared_token };
    },
  });
}

export function useUpdatePackage(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...changes }: { id: string; status?: PackageStatusRow; arrangement_id?: string | null; customer_name?: string }) => {
      const { error } = await supabase.from('package_configurations').update(changes).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: packageKey(token) }),
  });
}

/** Every catalog service, including inactive ones (admin Service Plans screen). */
export function useServiceCatalogAdmin() {
  return useQuery({
    queryKey: ['service-catalog', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_catalog').select('*').order('created_at');
      if (error) throw error;
      return data.map((row) => ({ ...row, unit_price: Number(row.unit_price) }));
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...changes }: { id: string; unit_price?: number; active?: boolean }) => {
      const { error } = await supabase.from('service_catalog').update(changes).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-catalog'] }),
  });
}
