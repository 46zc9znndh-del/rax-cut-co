import type { CmsProduct } from "@/lib/cms/types";
import { DEFAULT_PRODUCT_IMAGES } from "@/lib/cms/product-images";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createProduct(partial?: Partial<CmsProduct>): CmsProduct {
  const name = partial?.name?.trim() || "New Product";
  const wood = partial?.wood?.trim() || "Maple";
  const slug = partial?.slug?.trim() || slugify(`${name}-${wood}`);
  const id = partial?.id?.trim() || `${slug}-${Date.now()}`;

  return {
    tagline: `${wood} · Integrated drip tray.`,
    description:
      "Describe your product — features, materials, and what makes it worth the cut.",
    price: 0,
    rating: 5,
    reviewCount: 0,
    dimensions: '16" × 20"',
    thickness: '2"',
    weight: "—",
    inventory: 0,
    images: [...DEFAULT_PRODUCT_IMAGES.maple],
    imagePosition: ["50% 50%"],
    features: [],
    inStock: true,
    category: "board",
    ...partial,
    id,
    slug,
    name,
    wood,
  };
}

export function validateProducts(products: CmsProduct[]): string | null {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const product of products) {
    if (!product.name.trim()) {
      return "Every product needs a name.";
    }
    if (!product.slug.trim()) {
      return `"${product.name}" needs a URL slug.`;
    }
    if (!product.id.trim()) {
      return `"${product.name}" needs an ID.`;
    }
    if (!product.images.length) {
      return `"${product.name}" needs at least one photo.`;
    }
    if (product.price < 0) {
      return `"${product.name}" price cannot be negative.`;
    }
    if (ids.has(product.id)) {
      return `Duplicate product ID: ${product.id}`;
    }
    if (slugs.has(product.slug)) {
      return `Duplicate product slug: ${product.slug}`;
    }
    ids.add(product.id);
    slugs.add(product.slug);
  }

  return null;
}
