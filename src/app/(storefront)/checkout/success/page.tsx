"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";

function SuccessContent() {
  const clear = useCartStore((s) => s.clear);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(Boolean(sessionId));

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!sessionId) return;

    let active = true;

    async function confirmOrder() {
      try {
        const response = await fetch(
          `/api/checkout/confirm?session_id=${encodeURIComponent(sessionId as string)}`
        );

        if (!response.ok || !active) return;

        const data = (await response.json()) as {
          order?: { orderNumber: string; total: number };
        };

        if (data.order) {
          setOrderNumber(data.order.orderNumber);
          setOrderTotal(data.order.total);
        }
      } finally {
        if (active) setConfirming(false);
      }
    }

    confirmOrder();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="section-kicker">Order Confirmed</p>
      <h1 className="mt-3 font-display text-5xl tracking-[0.08em] uppercase">
        You’re locked in.
      </h1>
      <p className="mt-6 text-rax-muted leading-relaxed">
        Thanks for backing RAX Cut Co. A Stripe receipt is on its way to your
        email. We’ll ship your Original Drip Board from Washington.
      </p>
      {confirming ? (
        <p className="mt-4 text-sm text-rax-muted">Confirming your order...</p>
      ) : null}
      {orderNumber ? (
        <div className="mt-6 rounded-xl border border-black/10 bg-[#f3f1ec] px-5 py-4 text-left">
          <p className="font-display text-xs tracking-[0.18em] text-rax-ember uppercase">
            Order Number
          </p>
          <p className="mt-2 font-display text-2xl tracking-[0.08em] uppercase">
            {orderNumber}
          </p>
          {orderTotal !== null ? (
            <p className="mt-2 text-sm text-rax-muted">
              Total paid: {formatCurrency(orderTotal)}
            </p>
          ) : null}
        </div>
      ) : null}
      {sessionId && !orderNumber && !confirming ? (
        <p className="mt-4 break-all text-xs text-rax-muted">
          Reference: {sessionId}
        </p>
      ) : null}
      <Button asChild className="mt-10">
        <Link href="/shop">Back to shop</Link>
      </Button>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-rax-muted">Confirming…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
