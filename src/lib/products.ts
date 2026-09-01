import "server-only";

import type { Product, StorefrontProduct } from "@/types";
import { getCmsData } from "@/lib/cms/store";
import { stripProductsForStorefront } from "@/lib/products/stock";

export { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

type CmsSnapshot = Awaited<ReturnType<typeof getCmsData>>;

export function getStorefrontProductsFromCms(cms: CmsSnapshot): StorefrontProduct[] {
  return stripProductsForStorefront(
    cms.products,
    cms.site.storeSettings.lowStockThreshold
  );
}

export async function getProducts(): Promise<Product[]> {
  return (await getCmsData()).products;
}

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  return getStorefrontProductsFromCms(await getCmsData());
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
  return getStorefrontProductsFromCms(await getCmsData()).filter(
    (product) => product.category === "board"
  );
}

export async function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  const products = await getStorefrontProducts();
  if (!q) return products;
  return products.filter((p) =>
    [p.name, p.tagline, p.wood, p.description].join(" ").toLowerCase().includes(q)
  );
}
