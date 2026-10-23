import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { useToggleChecklistItem } from './useArrangements';

export interface DocumentCheckItem {
  key: string;
  label: string;
  applicable: boolean;
  status: 'Verified' | 'Pending' | 'Not Applicable';
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string;
}

export const STANDARD_REQUIRED_DOCUMENTS: { key: string; label: string; defaultApplicable: boolean }[] = [
  { key: 'hospital_summary', label: 'Hospital death summary', defaultApplicable: true },
  { key: 'police_noc', label: 'Police NOC (where applicable)', defaultApplicable: false },
  { key: 'municipal_cert', label: 'Municipal death certificate', defaultApplicable: true },
  { key: 'family_id', label: 'Family ID proof (Aadhaar / Passport)', defaultApplicable: true },
  { key: 'crematorium_slip', label: 'Crematorium / cemetery slip', defaultApplicable: true },
  { key: 'embassy_clearance', label: 'Embassy clearance (for repatriation)', defaultApplicable: false },
];

const LOCAL_DOC_CHECKS_KEY = 'eternal_crm_doc_checks';

type DocChecksStore = Record<string, Record<string, DocumentCheckItem>>;

function getStore(): DocChecksStore {
  try {
    const raw = localStorage.getItem(LOCAL_DOC_CHECKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: DocChecksStore) {
  try {
    localStorage.setItem(LOCAL_DOC_CHECKS_KEY, JSON.stringify(store));
  } catch {
    // Ignore
  }
}

export function useCaseDocumentChecks(caseId: string | null | undefined) {
  return useQuery({
    queryKey: ['doc_checks', caseId],
    enabled: Boolean(caseId),
    queryFn: (): DocumentCheckItem[] => {
      if (!caseId) return [];
      const store = getStore();
      const existing = store[caseId] || {};

      return STANDARD_REQUIRED_DOCUMENTS.map((doc) => {
        if (existing[doc.key]) {
          return existing[doc.key];
        }
        return {
          key: doc.key,
          label: doc.label,
          applicable: doc.defaultApplicable,
          status: doc.defaultApplicable ? 'Pending' : 'Not Applicable',
          verifiedBy: null,
          verifiedAt: null,
          notes: '',
        };
      });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const toggleChecklist = useToggleChecklistItem();

  return useMutation({
    mutationFn: async ({
      caseId,
      docKey,
      verified,
      applicable,
      notes,
    }: {
      caseId: string;
      docKey: string;
      verified: boolean;
      applicable?: boolean;
      notes?: string;
    }) => {
      const store = getStore();
      if (!store[caseId]) store[caseId] = {};

      const current = store[caseId][docKey] || {
        key: docKey,
        label: STANDARD_REQUIRED_DOCUMENTS.find((d) => d.key === docKey)?.label || docKey,
        applicable: applicable ?? true,
        status: 'Pending',
        verifiedBy: null,
        verifiedAt: null,
        notes: '',
      };

      const staffName = profile?.full_name || user?.email || 'Staff';
      const isApplicable = applicable !== undefined ? applicable : current.applicable;

      store[caseId][docKey] = {
        ...current,
        applicable: isApplicable,
        status: !isApplicable ? 'Not Applicable' : verified ? 'Verified' : 'Pending',
        verifiedBy: verified && isApplicable ? staffName : null,
        verifiedAt: verified && isApplicable ? new Date().toISOString() : null,
        notes: notes !== undefined ? notes : current.notes,
      };

      saveStore(store);

      // Check if all applicable documents are verified
      const allDocs = STANDARD_REQUIRED_DOCUMENTS.map((d) => store[caseId][d.key] || {
        applicable: d.defaultApplicable,
        status: d.defaultApplicable ? 'Pending' : 'Not Applicable',
      });
      const applicableDocs = allDocs.filter((d) => d.applicable);
      const allDone = applicableDocs.length > 0 && applicableDocs.every((d) => d.status === 'Verified');

      toggleChecklist.mutate({ id: caseId, key: 'docsChecked', value: allDone });

      return store[caseId][docKey];
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['doc_checks', vars.caseId] });
      queryClient.invalidateQueries({ queryKey: ['arrangements'] });
    },
  });
}
