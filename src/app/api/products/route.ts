import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getCmsData } from "@/lib/cms/store";
import { stripProductsForStorefront } from "@/lib/products/stock";

const getCatalog = unstable_cache(
  async () => {
    const cms = await getCmsData();
    const threshold = cms.site.storeSettings.lowStockThreshold;

    return stripProductsForStorefront(cms.products, threshold).map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      price: product.price,
      wood: product.wood,
      image: product.images[0],
      inStock: product.inStock,
    }));
  },
  ["rax-product-catalog"],
  { revalidate: 300, tags: ["cms"] }
);

export async function GET() {
  const products = await getCatalog();

  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
