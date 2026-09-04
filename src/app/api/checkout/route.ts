import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getCmsData } from "@/lib/cms/store";
import { getStorefrontProductsFromCms } from "@/lib/products";
import { applyPercentDiscountToCents, resolveCoupon } from "@/lib/coupons";
import { getSiteOrigin } from "@/lib/site";
import { getStripe, toStripeCents } from "@/lib/stripe";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

type CartLine = {
  id: string;
  quantity: number;
};

function buildLineItem(
  product: import("@/types").Product,
  quantity: number,
  origin: string,
  unitAmountCents: number
): Stripe.Checkout.SessionCreateParams.LineItem {
  if (product.stripePriceId) {
    return {
      price: product.stripePriceId,
      quantity,
    };
  }

  const imageUrl = product.images[0].startsWith("http")
    ? product.images[0]
    : `${origin}${product.images[0]}`;

  return {
    quantity,
    price_data: {
      currency: "usd",
      unit_amount: unitAmountCents,
      product_data: {
        name: `${product.name} — ${product.wood}`,
        description: `${product.dimensions} × ${product.thickness}. Integrated drainage with removable drip tray.`,
        images: [imageUrl],
        metadata: {
          productId: product.id,
          wood: product.wood,
          slug: product.slug,
        },
      },
    },
  };
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`checkout:${ip}`, { limit: 20, windowMs: 60 * 60_000 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait and try again." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as { items?: CartLine[]; couponCode?: string };
    const items = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const cms = await getCmsData();
    const { freeShippingThreshold, standardShippingRate } = cms.site.storeSettings;
    const productMap = new Map(cms.products.map((product) => [product.id, product]));

    let percentOff: number | null = null;
    let appliedCode: string | null = null;
    let stripePromotionCodeId: string | null = null;

    if (body.couponCode?.trim()) {
      const resolved = resolveCoupon(cms.site.storeSettings.coupons ?? [], body.couponCode);
      if (!resolved || !resolved.ok) {
        return NextResponse.json(
          { error: resolved?.error ?? "Invalid promo code." },
          { status: 400 }
        );
      }
      percentOff = resolved.percentOff;
      appliedCode = resolved.code;
      stripePromotionCodeId = resolved.stripePromotionCodeId ?? null;
    }

    const useStripeDiscount = Boolean(stripePromotionCodeId);
    const origin = getSiteOrigin(request);
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let preDiscountSubtotalCents = 0;

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product || !product.inStock) {
        return NextResponse.json(
          { error: `Product unavailable: ${item.id}` },
          { status: 400 }
        );
      }
      if (item.quantity < 1 || item.quantity > product.inventory) {
        return NextResponse.json(
          { error: `Invalid quantity for ${product.name} (${product.wood})` },
          { status: 400 }
        );
      }

      const unitAmountCents = toStripeCents(product.price);
      preDiscountSubtotalCents += unitAmountCents * item.quantity;

      const checkoutUnitAmountCents =
        !useStripeDiscount && percentOff !== null
          ? applyPercentDiscountToCents(unitAmountCents, percentOff)
          : unitAmountCents;

      line_items.push(buildLineItem(product, item.quantity, origin, checkoutUnitAmountCents));
    }

    const stripe = getStripe();

    const effectiveSubtotalCents =
      percentOff !== null
        ? applyPercentDiscountToCents(preDiscountSubtotalCents, percentOff)
        : preDiscountSubtotalCents;

    const discountCents = preDiscountSubtotalCents - effectiveSubtotalCents;

    const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
      effectiveSubtotalCents >= freeShippingThreshold * 100
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 0, currency: "usd" },
                display_name: "Free shipping",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 5 },
                  maximum: { unit: "business_day", value: 10 },
                },
              },
            },
          ]
        : [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: {
                  amount: Math.round(standardShippingRate * 100),
                  currency: "usd",
                },
                display_name: "Standard shipping",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 5 },
                  maximum: { unit: "business_day", value: 10 },
                },
              },
            },
          ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      ...(useStripeDiscount && stripePromotionCodeId
        ? { discounts: [{ promotion_code: stripePromotionCodeId }] }
        : {}),
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      shipping_options,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      metadata: {
        brand: "RAX Cut Co.",
        ...(appliedCode
          ? {
              couponCode: appliedCode,
              couponPercentOff: String(percentOff),
              discountCents: String(discountCents),
              ...(stripePromotionCodeId
                ? { stripePromotionCodeId }
                : {}),
            }
          : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 }
    );
  }
}
