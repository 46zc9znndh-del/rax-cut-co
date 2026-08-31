import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

export function createSupabaseServerClient() {
  const { url, secretKey } = getSupabaseConfig();

  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not fully configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY."
    );
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
