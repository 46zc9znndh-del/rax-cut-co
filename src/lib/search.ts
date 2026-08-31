import type { Product } from "@/types";

export function filterProducts(products: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) =>
    [product.name, product.tagline, product.wood, product.description]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
