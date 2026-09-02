"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useStoreSettings } from "@/lib/store-settings-context";
import {
  useCartStore,
  useCartSubtotal,
} from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";

type AppliedCoupon = {
  code: string;
  percentOff: number;
  discount: number;
};

function CheckoutContent() {
  const { items } = useCartStore();
  const subtotal = useCartSubtotal();
  const { freeShippingThreshold, standardShippingRate } = useStoreSettings();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const discountedSubtotal = appliedCoupon
    ? Math.max(0, subtotal - appliedCoupon.discount)
    : subtotal;
  const shipping =
    discountedSubtotal >= freeShippingThreshold || discountedSubtotal === 0
      ? 0
      : standardShippingRate;
  const total = discountedSubtotal + shipping;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Enter a promo code.");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        percentOff?: number;
        discount?: number;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.code || data.percentOff == null || data.discount == null) {
        throw new Error(data.error || "Invalid promo code.");
      }

      setAppliedCoupon({
        code: data.code,
        percentOff: data.percentOff,
        discount: data.discount,
      });
      setCouponInput(data.code);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Invalid promo code.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h1 className="font-display text-4xl tracking-[0.1em] uppercase">Checkout</h1>
        {canceled && (
          <p className="mt-4 border border-rax-ember/40 bg-rax-ember/10 px-4 py-3 text-sm text-rax-ink">
            Checkout was canceled. Your cart is still ready when you are.
          </p>
        )}
        {items.length === 0 ? (
          <p className="mt-8 text-rax-muted">
            Cart is empty.{" "}
            <Link href="/shop" className="text-rax-ember hover:underline">
              Shop the Original Drip Board
            </Link>
          </p>
        ) : (
          <div className="mt-8 space-y-6">
            <p className="max-w-lg text-rax-muted leading-relaxed">
              You’ll complete payment securely on Stripe — shipping address and
              card details collected there. Free shipping unlocks at{" "}
              {formatCurrency(freeShippingThreshold)}.
            </p>

            <div className="max-w-md space-y-3 border border-rax-sand bg-white p-4">
              <p className="font-display text-xs tracking-[0.16em] text-rax-muted uppercase">
                Promo Code
              </p>
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(event) => {
                    setCouponInput(event.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Enter code"
                  className="font-mono uppercase"
                  disabled={Boolean(appliedCoupon)}
                />
                {appliedCoupon ? (
                  <Button type="button" variant="outline" onClick={removeCoupon}>
                    Remove
                  </Button>
                ) : (
                  <Button type="button" variant="outline" disabled={couponLoading} onClick={applyCoupon}>
                    {couponLoading ? "Checking…" : "Apply"}
                  </Button>
                )}
              </div>
              {appliedCoupon ? (
                <p className="text-sm text-emerald-700">
                  {appliedCoupon.code} applied — {appliedCoupon.percentOff}% off (
                  {formatCurrency(appliedCoupon.discount)})
                </p>
              ) : null}
              {couponError ? <p className="text-sm text-red-700">{couponError}</p> : null}
            </div>

            {error && (
              <p className="border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={loading}
              onClick={startCheckout}
            >
              {loading
                ? "Redirecting to Stripe…"
                : `Pay with Stripe · ${formatCurrency(total)}`}
            </Button>
          </div>
        )}
      </div>

      <aside className="border border-white/10 bg-rax-charcoal p-6 text-white lg:col-span-5">
        <h2 className="font-display tracking-[0.16em] uppercase">Order summary</h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-16 w-16 overflow-hidden bg-rax-steel">
                <Image src={item.image} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1">
                <p className="font-display text-sm uppercase">{item.name}</p>
                <p className="text-xs text-rax-muted-dark">
                  {item.wood ? `${item.wood} · ` : ""}Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm">{formatCurrency(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <p className="mb-2 text-xs tracking-widest text-rax-muted-dark uppercase">
            {shipping === 0
              ? "Free shipping"
              : `${formatCurrency(Math.max(0, freeShippingThreshold - discountedSubtotal))} to free shipping`}
          </p>
          <Progress
            value={Math.min(100, (discountedSubtotal / freeShippingThreshold) * 100)}
          />
        </div>
        <dl className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-rax-muted-dark">Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          {appliedCoupon ? (
            <div className="flex justify-between text-rax-ember">
              <dt>Promo ({appliedCoupon.code})</dt>
              <dd>-{formatCurrency(appliedCoupon.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-rax-muted-dark">Est. shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
          </div>
          <div className="flex justify-between font-display text-lg tracking-wide">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-rax-muted">Loading checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
