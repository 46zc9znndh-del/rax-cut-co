"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { useCartStore } from "@/store/cart-store";
import { useStoreSettings } from "@/lib/store-settings-context";
import { formatCurrency, cn } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

export function ProductDetail({
  slug,
  products,
}: {
  slug: string;
  products: StorefrontProduct[];
}) {
  const product = products.find((item) => item.slug === slug);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { freeShippingThreshold, lowStockMessage } = useStoreSettings();
  const [active, setActive] = useState(0);

  if (!product) {
    notFound();
  }

  const item = product;

  const variants = products.filter((p) => p.name === item.name);
  const related = products.filter((p) => p.id !== item.id);
  const gallery = item.images.filter(
    (src, index, all) => all.indexOf(src) === index
  );

  function handleAddToCart() {
    addItem(
      {
        id: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        image: item.images[0],
        wood: item.wood,
      },
      1
    );
    openCart();
  }

  return (
    <article className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="mb-6 text-xs tracking-[0.18em] text-rax-muted uppercase">
          <Link href="/shop" className="hover:text-rax-ember">
            Shop
          </Link>{" "}
          / {item.name} / {item.wood}
        </p>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden bg-[#ece7df]">
              <Image
                src={gallery[active] ?? item.images[0]}
                alt={`${item.name} — ${item.wood}`}
                fill
                className="object-cover"
                style={{
                  objectPosition:
                    item.imagePosition?.[active] ?? item.imagePosition?.[0] ?? "50% 46%",
                }}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {item.badge && (
                <Badge className="absolute top-4 left-4 border-none bg-rax-ember text-white">
                  {item.badge}
                </Badge>
              )}
            </div>
            {gallery.length > 1 ? (
              <div
                className={cn(
                  "mt-3 gap-2",
                  gallery.length > 2
                    ? "flex overflow-x-auto pb-1"
                    : "grid grid-cols-2 gap-3"
                )}
              >
                {gallery.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "relative overflow-hidden bg-[#ece7df]",
                      gallery.length > 2
                        ? "h-20 w-20 shrink-0"
                        : "aspect-[4/3]",
                      active === i ? "ring-2 ring-rax-ember" : "opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: item.imagePosition?.[i] ?? "50% 46%",
                      }}
                      sizes="240px"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <Badge>{item.wood}</Badge>
            <h1 className="mt-4 font-display text-4xl tracking-[0.08em] uppercase sm:text-5xl">
              {item.name}
            </h1>
            <p className="mt-3 text-lg text-rax-muted">{item.tagline}</p>
            <p className="mt-6 font-display text-3xl tracking-wide">
              {formatCurrency(item.price)}
            </p>
            {item.lowStock ? (
              <p className="mt-3 text-sm font-medium text-rax-ember">{lowStockMessage}</p>
            ) : null}
            {!item.inStock ? (
              <p className="mt-3 text-sm font-medium text-rax-muted">Currently out of stock</p>
            ) : null}

            {variants.length > 1 ? (
              <div className="mt-6">
                <p className="mb-2 text-xs tracking-[0.18em] text-rax-muted uppercase">
                  Wood
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <Link
                      key={variant.id}
                      href={`/shop/${variant.slug}`}
                      className={cn(
                        "border px-4 py-2 font-display text-xs tracking-[0.14em] uppercase",
                        variant.id === item.id
                          ? "border-rax-ember bg-rax-ember text-white"
                          : "border-black/15 text-rax-ink hover:border-rax-ember"
                      )}
                    >
                      {variant.wood} · {formatCurrency(variant.price)}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 border border-black/10 bg-rax-charcoal p-5 text-white">
              <Button
                className="w-full"
                size="lg"
                disabled={!item.inStock}
                onClick={handleAddToCart}
              >
                {item.inStock
                  ? `Add to Cart · ${formatCurrency(item.price)}`
                  : "Out of Stock"}
              </Button>
              <p className="mt-3 text-center text-xs tracking-[0.12em] text-rax-muted-dark uppercase">
                Free shipping over {formatCurrency(freeShippingThreshold)} · Lifetime guarantee
              </p>
            </div>

            <p className="mt-8 whitespace-pre-line leading-relaxed text-rax-muted">
              {item.description}
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-black/10 py-6 text-sm">
              <div>
                <dt className="text-rax-muted">Size</dt>
                <dd className="mt-1 font-display tracking-wide">
                  {item.dimensions}
                </dd>
              </div>
              <div>
                <dt className="text-rax-muted">Thickness</dt>
                <dd className="mt-1 font-display tracking-wide">
                  {item.thickness}
                </dd>
              </div>
              <div>
                <dt className="text-rax-muted">Wood</dt>
                <dd className="mt-1 font-display tracking-wide">{item.wood}</dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-2 text-sm">
              {item.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-rax-ember">▸</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-24">
            <h2 className="mb-8 font-display text-3xl tracking-[0.1em] uppercase">
              Other wood options
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
