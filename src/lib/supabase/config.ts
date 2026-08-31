import "server-only";

function resolveSupabaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (explicit) return explicit;

  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();
  if (projectRef) return `https://${projectRef}.supabase.co`;

  return undefined;
}

export function getSupabaseConfig() {
  const url = resolveSupabaseUrl();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  return {
    url,
    publishableKey,
    secretKey,
    isServerConfigured: Boolean(url && secretKey),
    isClientConfigured: Boolean(url && publishableKey),
  };
}

export function isSupabaseEnabled() {
  return getSupabaseConfig().isServerConfigured;
}

export function isSupabaseOrdersEnabled() {
  return isSupabaseEnabled();
}
