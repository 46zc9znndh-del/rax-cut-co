import type { Coupon } from "@/lib/cms/types";

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function findCoupon(coupons: Coupon[], code: string) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;

  return (
    coupons.find((coupon) => normalizeCouponCode(coupon.code) === normalized) ?? null
  );
}

export function validateCoupon(coupon: Coupon, now = new Date()) {
  if (!coupon.enabled) {
    return { ok: false as const, error: "This promo code is not active." };
  }

  const percentOff = Number(coupon.percentOff);
  if (!Number.isFinite(percentOff) || percentOff < 1 || percentOff > 100) {
    return { ok: false as const, error: "This promo code is misconfigured." };
  }

  const startsAt = new Date(coupon.startsAt);
  const endsAt = new Date(coupon.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { ok: false as const, error: "This promo code is misconfigured." };
  }

  if (now < startsAt) {
    return { ok: false as const, error: "This promo code is not valid yet." };
  }

  if (now > endsAt) {
    return { ok: false as const, error: "This promo code has expired." };
  }

  return { ok: true as const, percentOff };
}

export function resolveCoupon(coupons: Coupon[], code?: string | null) {
  if (!code?.trim()) return null;

  const coupon = findCoupon(coupons, code);
  if (!coupon) {
    return { ok: false as const, error: "Invalid promo code." };
  }

  const validation = validateCoupon(coupon);
  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true as const,
    coupon,
    percentOff: validation.percentOff,
    code: normalizeCouponCode(coupon.code),
    stripePromotionCodeId: coupon.stripePromotionCodeId,
  };
}

export function discountAmount(subtotal: number, percentOff: number) {
  return Math.round(subtotal * (percentOff / 100) * 100) / 100;
}

export function discountedSubtotal(subtotal: number, percentOff: number) {
  return Math.max(0, Math.round(subtotal * (100 - percentOff)) / 100);
}

export function applyPercentDiscountToCents(unitAmountCents: number, percentOff: number) {
  return Math.max(0, Math.round((unitAmountCents * (100 - percentOff)) / 100));
}

export function createCoupon(partial?: Partial<Coupon>): Coupon {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    id: `coupon-${Date.now()}`,
    code: partial?.code ?? "SAVE10",
    label: partial?.label ?? "New promo",
    percentOff: partial?.percentOff ?? 10,
    startsAt: partial?.startsAt ?? now.toISOString(),
    endsAt: partial?.endsAt ?? weekLater.toISOString(),
    enabled: partial?.enabled ?? true,
  };
}

export function toDatetimeLocalValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}
