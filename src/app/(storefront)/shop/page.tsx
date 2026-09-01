import type { Metadata } from "next";
import { ShopCatalog } from "@/components/product/shop-catalog";
import { getCmsData } from "@/lib/cms/store";
import { getStorefrontProductsFromCms } from "@/lib/products";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Shop Original Drip Board",
  description:
    "Shop the RAX Original Drip Board in Maple ($180). Integrated drainage system with removable drip tray. Free shipping over $150.",
  path: "/shop",
  keywords: [
    "shop cutting board",
    "buy drip board",
    "maple drip board",
    "RAX Original Drip Board",
  ],
});

export default async function ShopPage() {
  const cms = await getCmsData();
  const { shopPage } = cms.site;
  const products = getStorefrontProductsFromCms(cms);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="section-kicker">{shopPage.kicker}</p>
        <h1 className="mt-3 font-display text-5xl tracking-[0.08em] text-rax-ink uppercase sm:text-6xl">
          {shopPage.headline}
        </h1>
        <p className="mt-4 max-w-xl text-rax-muted">{shopPage.description}</p>
        <div className="mt-12">
          <ShopCatalog products={products} />
        </div>
      </div>
    </section>
  );
}
