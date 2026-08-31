import "server-only";

import type { Product, StorefrontProduct } from "@/types";
import { getCmsData } from "@/lib/cms/store";
import { stripProductsForStorefront } from "@/lib/products/stock";

export { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export async function getProducts(): Promise<Product[]> {
  return (await getCmsData()).products;
}

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  const cms = await getCmsData();
  return stripProductsForStorefront(
    cms.products,
    cms.site.storeSettings.lowStockThreshold
  );
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getStorefrontProduct(slug: string) {
  return (await getStorefrontProducts()).find((p) => p.slug === slug);
}

export async function getProductById(id: string) {
  return (await getProducts()).find((p) => p.id === id);
}

export async function getFeaturedProducts() {
  return (await getStorefrontProducts()).filter((p) => p.category === "board");
}

export async function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  const products = await getStorefrontProducts();
  if (!q) return products;
  return products.filter((p) =>
    [p.name, p.tagline, p.wood, p.description].join(" ").toLowerCase().includes(q)
  );
}
