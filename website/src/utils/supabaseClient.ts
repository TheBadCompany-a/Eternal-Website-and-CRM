import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './concierge';

// Shared Supabase client for features that need real auth (magic-link sign-in,
// sessions, row-level-security-scoped reads/writes) — e.g. the "Book a Star"
// family dashboard. Other features on this site (concierge enquiries, the free
// "Name a Star" wall) talk to Supabase via plain REST + the anon key and don't
// need this, so they're left as-is.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
