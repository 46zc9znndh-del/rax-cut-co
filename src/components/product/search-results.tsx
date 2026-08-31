"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { filterProducts } from "@/lib/search";
import type { Product } from "@/types";

export function SearchResults({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const results = useMemo(() => filterProducts(products, q), [products, q]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="section-kicker">Search</p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.08em] uppercase sm:text-5xl">
        {q ? `Results for “${q}”` : "Search the mill"}
      </h1>
      <p className="mt-3 text-rax-muted">
        {results.length} item{results.length === 1 ? "" : "s"}
      </p>
      <div className="mt-10">
        <ProductGrid products={results} />
      </div>
    </section>
  );
}
