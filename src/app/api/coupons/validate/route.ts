import { NextResponse } from "next/server";
import { getCmsData } from "@/lib/cms/store";
import { discountAmount, resolveCoupon } from "@/lib/coupons";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`coupon-validate:${ip}`, { limit: 60, windowMs: 60 * 60_000 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as { code?: string; subtotal?: number };
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json({ error: "Enter a promo code." }, { status: 400 });
    }

    const subtotal = Number(body.subtotal ?? 0);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: "Invalid cart subtotal." }, { status: 400 });
    }

    const cms = await getCmsData();
    const resolved = resolveCoupon(cms.site.storeSettings.coupons ?? [], code);

    if (!resolved || !resolved.ok) {
      return NextResponse.json({ error: resolved?.error ?? "Invalid promo code." }, { status: 400 });
    }

    const discount = discountAmount(subtotal, resolved.percentOff);
    const discountedSubtotal = Math.max(0, subtotal - discount);

    return NextResponse.json({
      ok: true,
      code: resolved.code,
      percentOff: resolved.percentOff,
      discount,
      discountedSubtotal,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ error: "Unable to validate promo code." }, { status: 500 });
  }
}
