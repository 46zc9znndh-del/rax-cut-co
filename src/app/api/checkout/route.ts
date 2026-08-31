import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getProductById } from "@/lib/products";
import { getCmsData } from "@/lib/cms/store";
import { getSiteOrigin } from "@/lib/site";
import { getStripe, toStripeCents } from "@/lib/stripe";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

type CartLine = {
  id: string;
  quantity: number;
};

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
    const body = (await request.json()) as { items?: CartLine[] };
    const items = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const origin = getSiteOrigin(request);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = await getProductById(item.id);
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

      const imageUrl = product.images[0].startsWith("http")
        ? product.images[0]
        : `${origin}${product.images[0]}`;

      line_items.push({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: toStripeCents(product.price),
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
      });
    }

    const stripe = getStripe();
    const { freeShippingThreshold, standardShippingRate } = (await getCmsData()).site
      .storeSettings;

    const subtotalCents = line_items.reduce((sum, line) => {
      const qty = line.quantity ?? 1;
      const unit = line.price_data?.unit_amount ?? 0;
      return sum + unit * qty;
    }, 0);

    const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
      subtotalCents >= freeShippingThreshold * 100
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
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      shipping_options,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      metadata: {
        brand: "RAX Cut Co.",
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
