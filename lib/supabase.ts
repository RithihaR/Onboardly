// lib/supabase.ts
// Get these two values from Supabase → Settings → API.
// SUPABASE_SERVICE_ROLE_KEY is the "service_role" secret key — it bypasses
// Row Level Security, so it must ONLY be used in server-side code
// (API routes, server components) and must NEVER be exposed to the browser.
// Do not prefix it with NEXT_PUBLIC_ — that would ship it to the client.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check your .env.local"
  );
}

// This client is for server-side use only (API routes, server components).
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});