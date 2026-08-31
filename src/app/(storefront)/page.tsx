import { Hero } from "@/components/home/hero";
import { CollectionBar } from "@/components/home/collection-bar";
import { TrustBadges } from "@/components/home/trust-badges";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FeatureSpotlight } from "@/components/home/feature-spotlight";
import { CareGuide } from "@/components/home/care-guide";
import { Reviews } from "@/components/home/reviews";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { getCmsData } from "@/lib/cms/store";
import { getProducts } from "@/lib/products";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Original Drip Board — Crafted for the Cut",
  description:
    "RAX Cut Co. Original Drip Board — American hardwood with integrated drainage and removable drip tray. Bamboo $99.99 · Maple $180. Free shipping over $150.",
  path: "/",
  ogImage: "/images/portfolio/steak-rest.jpg",
});

export default async function Home() {
  const { site } = await getCmsData();
  const products = await getProducts();

  return (
    <>
      <Hero settings={site.hero} />
      <CollectionBar settings={site.collectionBar} />
      <FeaturedProducts settings={site.featuredSection} products={products} />
      <PortfolioGallery settings={site.portfolio} featuredOnly />
      <TrustBadges badges={site.trustBadges} />
      <FeatureSpotlight sections={site.featureSections} />
      <CareGuide />
      <Reviews settings={site.reviews} />
    </>
  );
}
