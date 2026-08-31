import "server-only";

import type { Product } from "@/types";
import { getCmsData } from "@/lib/cms/store";

export { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export async function getProducts(): Promise<Product[]> {
  return (await getCmsData()).products;
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getProductById(id: string) {
  return (await getProducts()).find((p) => p.id === id);
}

export async function getFeaturedProducts() {
  return (await getProducts()).filter((p) => p.category === "board");
}

export async function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  const products = await getProducts();
  if (!q) return products;
  return products.filter((p) =>
    [p.name, p.tagline, p.wood, p.description].join(" ").toLowerCase().includes(q)
  );
}
