import type { BookingDraft } from '../../../utils/crmBooking';

/** Ported unchanged from the CRM's own wizard (state/pricing.ts). */
export function calculatePricing(draft: Pick<BookingDraft, 'needCategory' | 'services'>): {
  baseMin: number;
  baseMax: number;
} {
  let baseMin = 16000;
  let baseMax = 22000;

  if (draft.needCategory === 'Immediate Arrangement') {
    baseMin += 5000;
    baseMax += 7000;
  } else if (draft.needCategory === 'Transfer / Transportation') {
    baseMin += 8000;
    baseMax += 12000;
  }

  if (draft.services && Array.isArray(draft.services)) {
    draft.services.forEach((s) => {
      if (s.includes('Family transportation')) {
        baseMin += 4500;
        baseMax += 6000;
      }
      if (s.includes('Floral')) {
        baseMin += 3500;
        baseMax += 5000;
      }
      if (s.includes('Documentation')) {
        baseMin += 2500;
        baseMax += 3500;
      }
      if (s.includes('Cremation')) {
        baseMin += 4000;
        baseMax += 6000;
      }
      if (s.includes('Burial')) {
        baseMin += 6000;
        baseMax += 9000;
      }
      if (s.includes('Priest')) {
        baseMin += 5000;
        baseMax += 7500;
      }
      if (s.includes('Airport')) {
        baseMin += 14000;
        baseMax += 19000;
      }
    });
  }

  return { baseMin, baseMax };
}
