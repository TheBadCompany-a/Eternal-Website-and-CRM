import { createClient } from '@supabase/supabase-js';
import type { Database } from '../data/database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Fall back to harmless placeholder values so the client can always be
// constructed — every real call will simply fail until configured, and
// <RequireSupabaseConfig> (see App.tsx) keeps the app from ever rendering
// past that point without a clear setup screen.
export const supabase = createClient<Database>(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key');
