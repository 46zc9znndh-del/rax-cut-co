import type { StorefrontProduct } from "@/types";

export function filterProducts(products: StorefrontProduct[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) =>
    [product.name, product.tagline, product.wood, product.description]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
