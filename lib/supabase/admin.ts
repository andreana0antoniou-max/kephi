import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client using the service role key. Bypasses RLS entirely, and can
 * look up any user's email via supabase.auth.admin. Only ever use this
 * inside server-only code (API routes) — never in a client component, and
 * never send this key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
