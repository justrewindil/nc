import { createClient } from '@supabase/supabase-js';

// supabase-js expects the BASE project URL (https://xxxx.supabase.co),
// not the REST path. Normalize whatever is in .env so it always works.
function normalizeUrl(u) {
  if (!u) return '';
  let s = u.trim().replace(/\/+$/, '');           // drop trailing slashes
  s = s.replace(/\/rest\/v1$/i, '');               // drop /rest/v1 if pasted
  return s;
}

const url = normalizeUrl(import.meta.env.VITE_SUPABASE_URL);
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseReady = Boolean(url && anon);

export const supabase = isSupabaseReady
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
