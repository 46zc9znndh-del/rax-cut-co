import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { addOrder, getOrderBySessionId } from "./store";
import type { Order, OrderLineItem, ShippingAddress } from "./types";

function mapShippingAddress(
  address: Stripe.Address | null | undefined
): ShippingAddress | undefined {
  if (!address?.line1) return undefined;

  return {
    line1: address.line1,
    line2: address.line2 ?? undefined,
    city: address.city ?? "",
    state: address.state ?? undefined,
    postalCode: address.postal_code ?? "",
    country: address.country ?? "",
  };
}

function mapLineItems(lineItems: Stripe.LineItem[]): OrderLineItem[] {
  return lineItems.map((line) => {
    const product = line.price?.product;
    const metadata =
      typeof product === "object" && product && "metadata" in product
        ? product.metadata
        : {};

    const unitPrice = (line.price?.unit_amount ?? 0) / 100;
    const quantity = line.quantity ?? 1;

    const productName =
      typeof product === "object" && product && "name" in product && product.name
        ? product.name
        : "Product";

    return {
      productId: metadata.productId ?? line.id,
      slug: metadata.slug ?? "",
      name: line.description ?? productName,
      wood: metadata.wood ?? "",
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });
}

export async function createOrderFromStripeSession(
  sessionId: string
): Promise<Order | null> {
  const existing = await getOrderBySessionId(sessionId);
  if (existing) {
    return existing;
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return null;
  }

  const lineItemsResponse = await stripe.checkout.sessions.listLineItems(sessionId, {
    expand: ["data.price.product"],
  });

  const items = mapLineItems(lineItemsResponse.data);
  const subtotal = (session.amount_subtotal ?? 0) / 100;
  const shipping = (session.total_details?.amount_shipping ?? 0) / 100;
  const total = (session.amount_total ?? 0) / 100;
  const couponCode = session.metadata?.couponCode?.trim() || undefined;
  const discountFromMetadata = session.metadata?.discountCents
    ? Number(session.metadata.discountCents)
    : 0;
  const discountFromStripe = (session.total_details?.amount_discount ?? 0) / 100;
  const discount =
    couponCode && Number.isFinite(discountFromMetadata) && discountFromMetadata > 0
      ? discountFromMetadata / 100
      : discountFromStripe > 0
        ? discountFromStripe
        : undefined;

  const sessionWithShipping = session as Stripe.Checkout.Session & {
    shipping_details?: {
      address?: Stripe.Address | null;
      name?: string | null;
    };
  };

  const shippingAddress = mapShippingAddress(
    sessionWithShipping.shipping_details?.address ?? session.customer_details?.address
  );

  const order = await addOrder({
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id,
    status: "paid",
    customerEmail: session.customer_details?.email ?? "unknown@customer.rax",
    customerName:
      session.customer_details?.name ??
      sessionWithShipping.shipping_details?.name ??
      undefined,
    customerPhone: session.customer_details?.phone ?? undefined,
    shippingAddress,
    items,
    subtotal,
    shipping,
    total,
    couponCode,
    discount,
    currency: (session.currency ?? "usd").toUpperCase(),
  });

  const { sendOrderEmails } = await import("@/lib/email/send");
  await sendOrderEmails(order);
  return order;
}
