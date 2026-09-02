import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { getSalesStats } from "@/lib/orders/store";
import { isStripeConfigured } from "@/lib/stripe/sync";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    sales: await getSalesStats(),
    stripeConfigured: isStripeConfigured(),
  });
}
