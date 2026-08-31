import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { getAdminDashboardStats, getOrdersBackendLabel } from "@/lib/orders/store";
import { getCmsBackendLabel } from "@/lib/cms/store";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseConfig();

  return NextResponse.json({
    stats: await getAdminDashboardStats(),
    integrations: {
      ordersBackend: getOrdersBackendLabel(),
      cmsBackend: getCmsBackendLabel(),
      supabase: {
        hasUrl: Boolean(supabase.url),
        hasPublishableKey: Boolean(supabase.publishableKey),
        hasSecretKey: Boolean(supabase.secretKey),
        ready: supabase.isServerConfigured,
      },
    },
  });
}
