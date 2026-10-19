// "Name a Star" tributes. Data lives in Supabase (see supabase/tributes.sql):
//  - visitors can only ADD a tribute, which always starts as 'pending'
//  - the site reads only the `approved_tributes` view (no private contact details)
import { SUPABASE_URL, SUPABASE_KEY } from './concierge';

// New tributes are saved in the CRM database (so staff can approve them there). Tributes
// approved earlier in the website's own project are still read so nothing disappears.
const CRM_REST = 'https://xcuqaxgmpcrszptjlzva.supabase.co/rest/v1';
const CRM_KEY = 'sb_publishable_dwu1JAFa5KUaUq9X2wVnNA_iMdFl5t3';
const crmHeaders = { apikey: CRM_KEY, Authorization: `Bearer ${CRM_KEY}`, 'Content-Type': 'application/json' };

export interface Tribute {
  id: string;
  slug: string;
  name: string;
  born_year: number | null;
  passed_year: number | null;
  message: string | null;
  photo_path: string | null;
  created_at: string;
}

export interface TributeInput {
  name: string;
  bornYear?: number;
  passedYear?: number;
  message?: string;
  submitterName: string;
  submitterContact: string;
}

// Thrown when the tributes tables have not been set up yet (or the network is down).
export class SkyUnavailableError extends Error {
  constructor() {
    super('The star sky is not available yet.');
    this.name = 'SkyUnavailableError';
  }
}

const REST = `${SUPABASE_URL}/rest/v1`;
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
const COLUMNS = 'id,slug,name,born_year,passed_year,message,photo_path,created_at';

export const photoUrl = (path: string): string => `${SUPABASE_URL}/storage/v1/object/public/tribute-photos/${path}`;

async function legacyTributes(path: string): Promise<Tribute[]> {
  try {
    const res = await fetch(`${REST}/${path}`, { headers });
    return res.ok ? ((await res.json()) as Tribute[]) : [];
  } catch {
    return [];
  }
}

async function crmTributes(fn: string, args: Record<string, unknown>): Promise<Tribute[]> {
  const res = await fetch(`${CRM_REST}/rpc/${fn}`, { method: 'POST', headers: crmHeaders, body: JSON.stringify(args) });
  if (!res.ok) throw new SkyUnavailableError();
  return (await res.json()) as Tribute[];
}

export async function listApprovedTributes(): Promise<Tribute[]> {
  const [fromCrm, legacy] = await Promise.all([
    crmTributes('list_approved_tributes', {}).catch(() => null),
    legacyTributes(`approved_tributes?select=${COLUMNS}&order=created_at.asc&limit=80`),
  ]);
  if (fromCrm === null && legacy.length === 0) throw new SkyUnavailableError();
  return [...legacy, ...(fromCrm ?? [])];
}

export async function getApprovedTribute(slug: string): Promise<Tribute | null> {
  const fromCrm = await crmTributes('get_approved_tribute', { p_slug: slug }).catch(() => []);
  if (fromCrm[0]) return fromCrm[0];
  const legacy = await legacyTributes(`approved_tributes?select=${COLUMNS}&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  return legacy[0] ?? null;
}

/**
 * Validates a chosen photograph and re-encodes it as a smaller JPEG.
 * Re-encoding also drops hidden metadata (such as location) from the original file.
 */
export async function preparePhoto(file: File, maxSide = 1000): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Please choose a JPG, PNG or WebP photograph.');
  if (file.size > 15 * 1024 * 1024) throw new Error('That photograph is very large. Please choose one under 15 MB.');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('We could not open that photograph. Please try a different one.');
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('We could not prepare that photograph. Please try a different one.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
  if (!blob) throw new Error('We could not prepare that photograph. Please try a different one.');
  if (blob.size > 5 * 1024 * 1024) throw new Error('That photograph is still too large. Please choose a smaller one.');
  return blob;
}

const slugify = (name: string): string => {
  const base = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  const tail = Math.random().toString(36).slice(2, 7);
  return `${base || 'star'}-${tail}`;
};

/** Uploads the photograph (if any) and saves the tribute as 'pending'. Nothing is shown publicly until approved. */
export async function submitTribute(input: TributeInput, photo?: Blob): Promise<void> {
  let photoPath: string | null = null;
  if (photo) {
    photoPath = `incoming/${crypto.randomUUID()}.jpg`;
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/tribute-photos/${photoPath}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'image/jpeg', 'x-upsert': 'false' },
      body: photo,
    });
    if (!up.ok) throw new Error(`Photo upload failed (${up.status})`);
  }
  const res = await fetch(`${CRM_REST}/rpc/submit_tribute`, {
    method: 'POST',
    headers: crmHeaders,
    body: JSON.stringify({
      p_slug: slugify(input.name),
      p_name: input.name.trim(),
      p_born_year: input.bornYear ?? null,
      p_passed_year: input.passedYear ?? null,
      p_message: input.message?.trim() || null,
      p_photo_path: photoPath,
      p_submitter_name: input.submitterName.trim(),
      p_submitter_contact: input.submitterContact.trim(),
    }),
  });
  if (!res.ok) throw new Error(`Tribute save failed (${res.status})`);
}
