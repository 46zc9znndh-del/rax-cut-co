import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const DEFAULT_OG_IMAGE = "/images/portfolio/steak-rest.jpg";

export const BRAND_KEYWORDS = [
  "RAX Cut Co",
  "cutting board",
  "drip board",
  "drip tray cutting board",
  "maple cutting board",
  "BBQ cutting board",
  "butcher block",
  "meat cutting board",
  "American hardwood",
  "Washington USA",
] as const;

export function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [...BRAND_KEYWORDS],
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(ogImage);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export function buildProductMetadata(product: {
  name: string;
  wood: string;
  tagline: string;
  description: string;
  slug: string;
  price: number;
  images: string[];
  inStock: boolean;
}): Metadata {
  const title = `${product.name} — ${product.wood}`;
  const description = `${product.tagline} ${product.description.split("\n")[0]}`.slice(
    0,
    160
  );

  return {
    ...buildPageMetadata({
      title,
      description,
      path: `/shop/${product.slug}`,
      ogImage: product.images[0],
      keywords: [
        ...BRAND_KEYWORDS,
        product.wood.toLowerCase(),
        "original drip board",
        `$${product.price}`,
      ],
    }),
    openGraph: {
      type: "website",
      url: absoluteUrl(`/shop/${product.slug}`),
      title: `${title} | ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      images: product.images.map((url) => ({
        url: absoluteUrl(url),
        width: 1200,
        height: 1200,
        alt: `${product.name} — ${product.wood}`,
      })),
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "USD",
      "product:availability": product.inStock ? "in stock" : "out of stock",
    },
  };
}
