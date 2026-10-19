// "Book a Star" — a paid, Signature-Farewell-exclusive memorial star with a dedicated family login.
// Data lives in Supabase (see supabase/booked_stars.sql):
//  - visitors can submit a booking REQUEST (status 'requested'); staff activates it by hand
//  - the family sets a password at booking time and signs in with email + password thereafter
//  - once active, the family can edit their own star only
//  - the public only ever sees active, slugged stars, via the `public_booked_stars` view
import { supabase } from './supabaseClient';

export interface BookingRequestInput {
  name: string;
  relationship?: string;
  about?: string;
  birthDate?: string; // yyyy-mm-dd
  deathDate?: string; // yyyy-mm-dd
  photoPath?: string;
  requesterName: string;
  requesterPhone: string;
  ownerEmail: string;
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('That email already has an account — please sign in instead.');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export interface MyStar {
  id: string;
  slug: string | null;
  owner_email: string;
  name: string;
  relationship: string | null;
  about: string | null;
  birth_date: string | null;
  death_date: string | null;
  photo_path: string | null;
  status: 'requested' | 'active' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MyStarUpdate {
  name?: string;
  relationship?: string | null;
  about?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  photo_path?: string | null;
}

export interface PublicBookedStar {
  id: string;
  slug: string;
  name: string;
  relationship: string | null;
  about: string | null;
  birth_date: string | null;
  death_date: string | null;
  photo_path: string | null;
  created_at: string;
}

/** Submits a booking request. Always lands as 'requested' — nothing is public or editable yet. */
export async function requestStarBooking(input: BookingRequestInput): Promise<void> {
  const { error } = await supabase.from('booked_stars').insert({
    name: input.name.trim(),
    relationship: input.relationship?.trim() || null,
    about: input.about?.trim() || null,
    birth_date: input.birthDate || null,
    death_date: input.deathDate || null,
    photo_path: input.photoPath || null,
    requester_name: input.requesterName.trim(),
    requester_phone: input.requesterPhone.trim(),
    owner_email: input.ownerEmail.trim().toLowerCase(),
    status: 'requested',
  });
  if (error) throw new Error(error.message);
}

/**
 * Creates the family's login account at booking time. Supabase emails a confirmation link;
 * sign-in won't succeed until that's clicked (if the project has "Confirm email" turned on).
 */
export async function signUpWithPassword(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { emailRedirectTo: `${window.location.origin}/my-star` },
  });
  if (error) throw new Error(error.message);
  // Supabase returns a "fake" user with an empty identities array instead of an error when the
  // email is already registered (to avoid leaking which emails exist) — treat that as a real error.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new EmailAlreadyRegisteredError();
  }
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw new Error(error.message);
}

/** Sends a password-reset email with a link back to the "set new password" page. */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/my-star/reset-password`,
  });
  if (error) throw new Error(error.message);
}

/** Sets a new password — used right after a password-reset link signs the family in. */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** The currently signed-in family's star(s) — RLS guarantees only their own rows come back. */
export async function getMyStars(): Promise<MyStar[]> {
  const { data, error } = await supabase
    .from('booked_stars')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MyStar[];
}

export async function updateMyStar(id: string, patch: MyStarUpdate): Promise<void> {
  const { error } = await supabase.from('booked_stars').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Uploads/replaces the signed-in family's own star photo. Path is namespaced by star id. */
export async function uploadOwnedStarPhoto(starId: string, photo: Blob): Promise<string> {
  const path = `owned/${starId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from('star-photos')
    .upload(path, photo, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/** Uploads a photo attached to a brand-new booking request (before any login exists). */
export async function uploadRequestStarPhoto(photo: Blob): Promise<string> {
  const path = `incoming/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from('star-photos')
    .upload(path, photo, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export function bookedStarPhotoUrl(path: string): string {
  const { data } = supabase.storage.from('star-photos').getPublicUrl(path);
  return data.publicUrl;
}

/** A public, active star's profile — safe columns only, via the public_booked_stars view. */
export async function getPublicBookedStar(slug: string): Promise<PublicBookedStar | null> {
  const { data, error } = await supabase
    .from('public_booked_stars')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PublicBookedStar) ?? null;
}
