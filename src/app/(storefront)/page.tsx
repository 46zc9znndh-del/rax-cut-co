import { Hero } from "@/components/home/hero";
import { CollectionBar } from "@/components/home/collection-bar";
import { TrustBadges } from "@/components/home/trust-badges";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HomeVideo } from "@/components/home/home-video";
import { FeatureSpotlight } from "@/components/home/feature-spotlight";
import { CareGuide } from "@/components/home/care-guide";
import { Reviews } from "@/components/home/reviews";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { getCmsData } from "@/lib/cms/store";
import { getStorefrontProductsFromCms } from "@/lib/products";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Original Drip Board — Crafted for the Cut",
  description:
    "RAX Cut Co. Original Drip Board — American hardwood with integrated drainage and removable drip tray. Maple $180. Free shipping over $150.",
  path: "/",
  ogImage: "/images/portfolio/steak-rest.jpg",
});

export default async function Home() {
  const cms = await getCmsData();
  const products = getStorefrontProductsFromCms(cms).filter(
    (product) => product.category === "board"
  );

  return (
    <>
      <Hero settings={cms.site.hero} />
      <CollectionBar settings={cms.site.collectionBar} />
      <FeaturedProducts
        settings={cms.site.featuredSection}
        products={products}
        lowStockMessage={cms.site.storeSettings.lowStockMessage}
      />
      <HomeVideo poster="/images/portfolio/steak-rest.jpg" />
      <PortfolioGallery settings={cms.site.portfolio} featuredOnly />
      <TrustBadges badges={cms.site.trustBadges} />
      <FeatureSpotlight sections={cms.site.featureSections} />
      <CareGuide />
      <Reviews settings={cms.site.reviews} />
    </>
  );
}
