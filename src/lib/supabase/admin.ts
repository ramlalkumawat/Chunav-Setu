import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase Admin Client
 * Uses the server-only SUPABASE_SERVICE_ROLE_KEY to perform elevated auth & tenant operations.
 * CRITICAL: This module MUST NEVER be imported in client-side code / browser bundle.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Security Violation: createAdminClient cannot be called from the browser.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // In local development before credentials are fully provisioned, return standard client with fallback
    return createSupabaseClient(
      supabaseUrl || "https://placeholder-chunav-setu.supabase.co",
      serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
