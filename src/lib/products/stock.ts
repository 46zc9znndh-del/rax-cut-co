import type { Product, StorefrontProduct } from "@/types";

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export function isLowStock(inventory: number, threshold = DEFAULT_LOW_STOCK_THRESHOLD) {
  return inventory > 0 && inventory < threshold;
}

export function toStorefrontProduct(
  product: Product,
  threshold = DEFAULT_LOW_STOCK_THRESHOLD
): StorefrontProduct {
  const { inventory, ...rest } = product;
  const available = product.inStock && inventory > 0;

  return {
    ...rest,
    inStock: available,
    lowStock: available && isLowStock(inventory, threshold),
  };
}

export function stripProductsForStorefront(
  products: Product[],
  threshold = DEFAULT_LOW_STOCK_THRESHOLD
): StorefrontProduct[] {
  return products.map((product) => toStorefrontProduct(product, threshold));
}
