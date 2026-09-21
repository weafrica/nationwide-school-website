import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Both values are meant to be public (they go into the browser bundle) —
// the anon key only grants what Row Level Security in 001_schema.sql
// allows. Set these in Vercel → Project Settings → Environment
// Variables, and in a local .env for `npm run dev`.
//
// IMPORTANT: createClient() throws immediately if given an empty string,
// and this file is imported (via AuthContext) at the very top of the
// app, before any page renders — so until the real env vars are set,
// this fallback keeps the whole public site (Home, About, Admissions...)
// working normally. Only actual portal sign-in attempts will fail (with
// a clear network error) until the real values are configured.
const hasRealConfig = Boolean(url && anonKey);
if (!hasRealConfig) {
  console.warn(
    'Supabase env vars are missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'The public site works normally, but the portal cannot sign anyone in until these are set.'
  );
}

export const isSupabaseConfigured = hasRealConfig;

export const supabase = createClient(
  hasRealConfig ? url : 'https://placeholder.supabase.co',
  hasRealConfig ? anonKey : 'placeholder-anon-key'
);
