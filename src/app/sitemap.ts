import type { MetadataRoute } from "next";
import { getCmsData } from "@/lib/cms/store";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { updatedAt } = await getCmsData();
  const lastModified = new Date(updatedAt);

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/shop", priority: 0.95, changeFrequency: "weekly" },
    { path: "/portfolio", priority: 0.85, changeFrequency: "monthly" },
    { path: "/our-story", priority: 0.75, changeFrequency: "monthly" },
    { path: "/care", priority: 0.7, changeFrequency: "monthly" },
    { path: "/guarantee", priority: 0.7, changeFrequency: "monthly" },
    { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  const productRoutes = (await getProducts()).map((product) => ({
    url: `${SITE_URL}/shop/${product.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const pages = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  return [...pages, ...productRoutes];
}
