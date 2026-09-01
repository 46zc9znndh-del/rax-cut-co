import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let serverClient: SupabaseClient | null = null;

export function createSupabaseServerClient() {
  if (serverClient) return serverClient;

  const { url, secretKey } = getSupabaseConfig();

  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not fully configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY."
    );
  }

  serverClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return serverClient;
}
