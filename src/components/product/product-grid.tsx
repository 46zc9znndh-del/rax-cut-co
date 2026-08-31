import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-20 text-center font-display tracking-[0.16em] text-rax-muted uppercase">
        No boards match that filter.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
