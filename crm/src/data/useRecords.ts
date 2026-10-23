import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { RecordCategoryRow, RecordRow } from './database.types';

const BUCKET = 'records';
const KEY = ['records'] as const;

export function useRecords() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<RecordRow[]> => {
      const { data, error } = await supabase.from('records').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Stores the file, then its row. If the row cannot be saved the file is removed again, so nothing is left orphaned. */
export function useUploadRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { file: File; title: string; category: RecordCategoryRow; docType: string; arrangementId: string | null; note: string }) => {
      const safeName = input.file.name.replace(/[^\w.\- ]+/g, '_');
      const path = `${crypto.randomUUID()}/${safeName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, input.file, { contentType: input.file.type || undefined });
      if (uploadError) throw uploadError;
      const { error } = await supabase.from('records').insert({
        title: input.title, category: input.category, doc_type: input.docType, arrangement_id: input.arrangementId, file_path: path,
        file_name: input.file.name, mime_type: input.file.type, size_bytes: input.file.size, note: input.note,
      });
      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: RecordRow) => {
      const { error } = await supabase.from('records').delete().eq('id', record.id);
      if (error) throw error;
      await supabase.storage.from(BUCKET).remove([record.file_path]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

/** A link that works for one minute, so a copied URL stops working quickly. */
export async function recordLink(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
