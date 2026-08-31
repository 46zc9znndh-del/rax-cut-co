"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStoreSettings } from "@/lib/store-settings-context";
import {
  useCartStore,
  useCartSubtotal,
} from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem } = useCartStore();
  const subtotal = useCartSubtotal();
  const { freeShippingThreshold, standardShippingRate } = useStoreSettings();
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 className="font-display text-lg tracking-[0.16em] uppercase">
          Your Kit
        </h2>
        <button aria-label="Close cart" onClick={closeCart}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-5 py-4">
        <p className="mb-2 text-xs tracking-[0.14em] text-rax-muted uppercase">
          {remaining === 0
            ? "Free shipping unlocked."
            : `${formatCurrency(remaining)} away from free shipping`}
        </p>
        <Progress value={progress} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="font-display tracking-[0.12em] uppercase text-rax-muted">
              Cart is empty
            </p>
            <Button asChild onClick={closeCart}>
              <Link href="/shop">Shop Cutting Boards</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-5">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-rax-steel">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={closeCart}
                        className="font-display text-sm tracking-[0.08em] uppercase hover:text-rax-wood"
                      >
                        {item.name}
                      </Link>
                      {item.wood && (
                        <p className="mt-0.5 text-xs text-rax-muted">{item.wood}</p>
                      )}
                    </div>
                    <button
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                      className="text-rax-muted hover:text-rax-cream"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-white/15">
                      <button
                        className="grid h-8 w-8 place-items-center"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="grid h-8 w-8 place-items-center"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-display tracking-wide">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm tracking-[0.14em] text-rax-muted uppercase">
              Subtotal
            </span>
            <span className="font-display text-xl tracking-wide">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link href="/checkout" onClick={closeCart}>
              Proceed to Checkout
            </Link>
          </Button>
          <p className="mt-3 text-center text-xs text-rax-muted">
            Taxes calculated at checkout. Lifetime guarantee on every board.
          </p>
        </div>
      )}
    </Sheet>
  );
}
