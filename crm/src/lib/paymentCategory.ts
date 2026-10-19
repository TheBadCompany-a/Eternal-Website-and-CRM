import type { Arrangement } from '../types';

export type PayCategory = 'star' | 'package' | 'service';

export const STAR_PRICE = 4999;

export function categoryOf(a: Arrangement): PayCategory {
  const t = a.serviceType.toLowerCase();
  if (t.startsWith('book a star')) return 'star';
  if (t === 'customised package' || t.startsWith('package:')) return 'package';
  return 'service';
}

const PACKAGE_PRICES: Record<string, number> = {
  'package: essential farewell': 11564,
  'package: complete farewell': 46300,
  'package: signature farewell': 69800,
};

/** What a case is worth: its quotation, or the fixed price of a star or fixed package. */
export const quotedFor = (a: Arrangement) =>
  a.quotation?.total || (categoryOf(a) === 'star' ? STAR_PRICE : PACKAGE_PRICES[a.serviceType.toLowerCase()] ?? 0);
