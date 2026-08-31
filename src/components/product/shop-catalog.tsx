"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { cn } from "@/lib/utils";
import type { Product, WoodType } from "@/types";

const filters: Array<"All" | WoodType> = ["All", "Bamboo", "Maple"];

export function ShopCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const visible = useMemo(() => {
    if (filter === "All") return products;
    return products.filter((p) => p.wood === filter);
  }, [filter, products]);

  return (
    <>
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
      <ProductGrid products={visible} />
    </>
  );
}
