import { SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";
import type { Product, StorefrontProduct } from "@/types";

type ProductSchemaInput = Product | StorefrontProduct;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description:
      "American hardwood cutting boards with an integrated drip tray — built for steaks, brisket, BBQ, and wild game.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "WA",
      addressCountry: "US",
    },
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(product: ProductSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.wood}`,
    description: product.description.split("\n")[0],
    image: product.images.map((image) => absoluteUrl(image)),
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/shop/${product.slug}`),
      priceCurrency: "USD",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

export function productSchemaJson(product: ProductSchemaInput) {
  const schema = productSchema(product);
  if (!schema.aggregateRating) {
    const { aggregateRating: _removed, ...rest } = schema;
    return rest;
  }
  return schema;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
