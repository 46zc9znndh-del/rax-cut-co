"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { cn } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

export function ShopCatalog({
  products,
  lowStockMessage,
}: {
  products: StorefrontProduct[];
  lowStockMessage: string;
}) {
  const filters = useMemo(() => {
    const woods = [...new Set(products.map((product) => product.wood).filter(Boolean))].sort();
    return ["All", ...woods] as const;
  }, [products]);

  const [filter, setFilter] = useState<string>("All");

  const visible = useMemo(() => {
    if (filter === "All") return products;
    return products.filter((product) => product.wood === filter);
  }, [filter, products]);

  return (
    <>
      {filters.length > 2 ? (
        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={cn(
                "border px-4 py-2 font-display text-xs tracking-[0.18em] uppercase transition-colors",
                filter === item
                  ? "border-rax-ember bg-rax-ember text-white"
                  : "border-black/15 text-rax-muted hover:border-rax-ember hover:text-rax-ink"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <ProductGrid products={visible} lowStockMessage={lowStockMessage} />
    </>
  );
}
