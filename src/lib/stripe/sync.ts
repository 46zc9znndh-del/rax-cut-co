import "server-only";

import type { Coupon } from "@/lib/cms/types";
import type { CmsData } from "@/lib/cms/types";
import type { Product } from "@/types";
import { normalizeCouponCode } from "@/lib/coupons";
import { getSiteUrl } from "@/lib/site";
import { getStripe, toStripeCents } from "@/lib/stripe";

export type StripeSyncResult = {
  products: CmsData["products"];
  coupons: Coupon[];
  errors: string[];
};

function productImageUrls(origin: string, product: Product) {
  return product.images
    .slice(0, 8)
    .map((image) => (image.startsWith("http") ? image : `${origin}${image}`));
}

function couponShouldBeActive(coupon: Coupon) {
  const now = Date.now();
  const startsAt = new Date(coupon.startsAt).getTime();
  const endsAt = new Date(coupon.endsAt).getTime();
  return coupon.enabled && now >= startsAt && now <= endsAt;
}

async function syncProduct(product: Product, origin: string): Promise<Product> {
  const stripe = getStripe();
  const name = `${product.name} — ${product.wood}`;
  const description = `${product.dimensions} × ${product.thickness}. Integrated drainage with removable drip tray.`;
  const unitAmount = toStripeCents(product.price);

  let stripeProductId = product.stripeProductId;
  let stripePriceId = product.stripePriceId;

  if (!stripeProductId) {
    const created = await stripe.products.create({
      name,
      description,
      images: productImageUrls(origin, product),
      active: product.inStock,
      metadata: {
        productId: product.id,
        slug: product.slug,
        wood: product.wood,
      },
    });
    stripeProductId = created.id;

    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: unitAmount,
      currency: "usd",
      metadata: { productId: product.id },
    });
    stripePriceId = price.id;

    return { ...product, stripeProductId, stripePriceId };
  }

  await stripe.products.update(stripeProductId, {
    name,
    description,
    images: productImageUrls(origin, product),
    active: product.inStock,
    metadata: {
      productId: product.id,
      slug: product.slug,
      wood: product.wood,
    },
  });

  if (stripePriceId) {
    const existingPrice = await stripe.prices.retrieve(stripePriceId);
    if (existingPrice.unit_amount !== unitAmount) {
      await stripe.prices.update(stripePriceId, { active: false });
      const nextPrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: unitAmount,
        currency: "usd",
        metadata: { productId: product.id },
      });
      stripePriceId = nextPrice.id;
    }
  } else {
    const nextPrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: unitAmount,
      currency: "usd",
      metadata: { productId: product.id },
    });
    stripePriceId = nextPrice.id;
  }

  return { ...product, stripeProductId, stripePriceId };
}

async function syncCoupon(coupon: Coupon): Promise<Coupon> {
  const stripe = getStripe();
  const code = normalizeCouponCode(coupon.code);
  const percentOff = Math.round(coupon.percentOff);
  const endsAt = Math.floor(new Date(coupon.endsAt).getTime() / 1000);
  const active = couponShouldBeActive(coupon);

  let stripeCouponId = coupon.stripeCouponId;
  let stripePromotionCodeId = coupon.stripePromotionCodeId;
  let needsNewCoupon = !stripeCouponId;

  if (stripeCouponId) {
    try {
      const existing = await stripe.coupons.retrieve(stripeCouponId);
      if (existing.percent_off !== percentOff) {
        needsNewCoupon = true;
      }
    } catch {
      needsNewCoupon = true;
      stripeCouponId = undefined;
    }
  }

  if (needsNewCoupon) {
    if (stripePromotionCodeId) {
      try {
        await stripe.promotionCodes.update(stripePromotionCodeId, { active: false });
      } catch {
        // Ignore stale promotion code references.
      }
    }

    const createdCoupon = await stripe.coupons.create({
      percent_off: percentOff,
      duration: "forever",
      name: coupon.label || code,
      redeem_by: endsAt,
      metadata: { cmsCouponId: coupon.id },
    });
    stripeCouponId = createdCoupon.id;

    const createdPromotion = await stripe.promotionCodes.create({
      promotion: {
        type: "coupon",
        coupon: stripeCouponId,
      },
      code,
      active,
      metadata: { cmsCouponId: coupon.id },
    });

    return {
      ...coupon,
      stripeCouponId,
      stripePromotionCodeId: createdPromotion.id,
    };
  }

  if (stripePromotionCodeId) {
    try {
      const promotion = await stripe.promotionCodes.retrieve(stripePromotionCodeId);
      if (promotion.code !== code) {
        await stripe.promotionCodes.update(stripePromotionCodeId, { active: false });
        const createdPromotion = await stripe.promotionCodes.create({
          promotion: {
            type: "coupon",
            coupon: stripeCouponId!,
          },
          code,
          active,
          metadata: { cmsCouponId: coupon.id },
        });
        stripePromotionCodeId = createdPromotion.id;
      } else {
        await stripe.promotionCodes.update(stripePromotionCodeId, { active });
      }
    } catch {
      const createdPromotion = await stripe.promotionCodes.create({
        promotion: {
          type: "coupon",
          coupon: stripeCouponId!,
        },
        code,
        active,
        metadata: { cmsCouponId: coupon.id },
      });
      stripePromotionCodeId = createdPromotion.id;
    }
  } else {
    const createdPromotion = await stripe.promotionCodes.create({
      promotion: {
        type: "coupon",
        coupon: stripeCouponId!,
      },
      code,
      active,
      metadata: { cmsCouponId: coupon.id },
    });
    stripePromotionCodeId = createdPromotion.id;
  }

  await stripe.coupons.update(stripeCouponId!, {
    name: coupon.label || code,
    metadata: { cmsCouponId: coupon.id },
  });

  return { ...coupon, stripeCouponId, stripePromotionCodeId };
}

export async function syncCmsCatalogToStripe(cms: CmsData): Promise<StripeSyncResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      products: cms.products,
      coupons: cms.site.storeSettings.coupons ?? [],
      errors: [],
    };
  }

  const origin = getSiteUrl();
  const errors: string[] = [];
  const products: Product[] = [];
  const coupons: Coupon[] = [];

  for (const product of cms.products) {
    try {
      products.push(await syncProduct(product, origin));
    } catch (error) {
      errors.push(
        `Product ${product.name}: ${error instanceof Error ? error.message : "sync failed"}`
      );
      products.push(product);
    }
  }

  for (const coupon of cms.site.storeSettings.coupons ?? []) {
    try {
      coupons.push(await syncCoupon(coupon));
    } catch (error) {
      errors.push(
        `Coupon ${coupon.code}: ${error instanceof Error ? error.message : "sync failed"}`
      );
      coupons.push(coupon);
    }
  }

  return { products, coupons, errors };
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
