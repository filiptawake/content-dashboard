// Supabase client — optional, and deliberately mirrors the AI layer.
//
//   No env vars  -> getSupabase()/getServiceSupabase() return null and the app
//                   keeps running on the demo data in src/data/*.
//   Env vars set -> a real client is returned and the data layer can read from
//                   / write to Postgres.
//
// Generate typed bindings once the project exists:
//   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
// then swap createClient(...) for createClient<Database>(...).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the anon client can be constructed (URL + anon key present). */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

let browserClient: SupabaseClient | null = null;

/**
 * Anon client (respects Row Level Security). Safe to use from client and server
 * reads. Returns null in demo mode so callers can fall back to src/data/*.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  browserClient ??= createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return browserClient;
}

/**
 * Service-role client (BYPASSES RLS) for server-only writes — the seam our API
 * routes and n8n workflows write through. Never import this into a client
 * component; the service key must never reach the browser bundle.
 */
export function getServiceSupabase(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
