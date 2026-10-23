import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '../lib/supabaseClient';
import { useAuth } from '../auth/useAuth';

const supabase = typedClient as unknown as SupabaseClient;

export interface BereavementFeedback {
  id: string;
  arrangementId: string;
  familyName: string;
  contactName: string;
  serviceType: string;
  rating: number;
  category: string;
  comment: string;
  isComplaint: boolean;
  complaintStatus: 'Open' | 'Under Investigation' | 'Family Contacted' | 'Resolved';
  assignedToProfileId: string | null;
  assignedToName: string;
  resolutionNotes: string;
  createdAt: string;
}

const LOCAL_FEEDBACK_KEY = 'eternal_crm_feedback_records';

function getLocalFeedback(): BereavementFeedback[] {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalFeedback(records: BereavementFeedback[]) {
  try {
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(records));
  } catch {
    // Ignore
  }
}

export function useFeedbackRecords() {
  return useQuery({
    queryKey: ['feedback_records'],
    queryFn: async (): Promise<BereavementFeedback[]> => {
      const local = getLocalFeedback();

      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*, arrangement:arrangements(family, contact_name, service_type)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const remoteRecords: BereavementFeedback[] = (data as unknown as Record<string, unknown>[]).map((r) => {
            const arr = r.arrangement as { family?: string; contact_name?: string; service_type?: string } | null;
            return {
              id: (r.id as string) || (r.arrangement_id as string),
              arrangementId: r.arrangement_id as string,
              familyName: arr?.family || 'Family',
              contactName: arr?.contact_name || '',
              serviceType: arr?.service_type || 'Arrangement',
              rating: Number(r.rating) || 5,
              category: (r.category as string) || 'Overall Experience',
              comment: (r.comment as string) || '',
              isComplaint: Number(r.rating) <= 3,
              complaintStatus: 'Open',
              assignedToProfileId: null,
              assignedToName: 'Operations Lead',
              resolutionNotes: '',
              createdAt: (r.created_at as string) || new Date().toISOString(),
            };
          });

          // Merge local and remote
          const combined = [...local];
          for (const rem of remoteRecords) {
            if (!combined.some((c) => c.arrangementId === rem.arrangementId)) {
              combined.push(rem);
            }
          }
          return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch {
        // Fall back to local
      }

      return local;
    },
    refetchInterval: 20_000,
  });
}

export interface NewFeedbackInput {
  arrangementId: string;
  familyName: string;
  contactName: string;
  serviceType: string;
  rating: number;
  category: string;
  comment: string;
  isComplaint?: boolean;
  assignedToProfileId?: string | null;
  assignedToName?: string;
}

export function useSaveFeedbackRecord() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (input: NewFeedbackInput) => {
      const isComplaint = input.isComplaint || input.rating <= 3;
      const record: BereavementFeedback = {
        id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        arrangementId: input.arrangementId,
        familyName: input.familyName,
        contactName: input.contactName,
        serviceType: input.serviceType,
        rating: input.rating,
        category: input.category,
        comment: input.comment,
        isComplaint,
        complaintStatus: isComplaint ? 'Open' : 'Resolved',
        assignedToProfileId: input.assignedToProfileId || null,
        assignedToName: input.assignedToName || (isComplaint ? 'Coordinator' : '—'),
        resolutionNotes: '',
        createdAt: new Date().toISOString(),
      };

      const existing = getLocalFeedback();
      const filtered = existing.filter((f) => f.arrangementId !== input.arrangementId);
      filtered.unshift(record);
      saveLocalFeedback(filtered);

      // Attempt DB insert
      try {
        await supabase.from('feedback').upsert({
          arrangement_id: input.arrangementId,
          rating: input.rating,
          comment: input.comment,
          status: 'Submitted',
        });
      } catch {
        // Ignore table errors
      }

      // If it is a complaint, log an urgent communication for follow-up
      if (isComplaint) {
        try {
          await supabase.from('communications').insert({
            arrangement_id: input.arrangementId,
            channel: 'Call',
            sender: profile?.full_name || user?.email || 'Care Quality',
            body: `⚠ Care quality complaint received (${input.rating}★ - ${input.category}): "${input.comment}". Assigned to ${record.assignedToName} for follow-up.`,
          });
        } catch {
          // Ignore
        }
      }

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback_records'] });
      queryClient.invalidateQueries({ queryKey: ['arrangements'] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedbackId,
      status,
      assignedToName,
      resolutionNotes,
    }: {
      feedbackId: string;
      status: BereavementFeedback['complaintStatus'];
      assignedToName?: string;
      resolutionNotes?: string;
    }) => {
      const records = getLocalFeedback();
      const match = records.find((r) => r.id === feedbackId);
      if (match) {
        match.complaintStatus = status;
        if (assignedToName) match.assignedToName = assignedToName;
        if (resolutionNotes !== undefined) match.resolutionNotes = resolutionNotes;
        saveLocalFeedback(records);
      }
      return match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback_records'] });
    },
  });
}
