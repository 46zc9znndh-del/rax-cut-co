import { NextResponse } from "next/server";
import { getCmsData } from "@/lib/cms/store";
import { stripProductsForStorefront } from "@/lib/products/stock";

export async function GET() {
  const cms = await getCmsData();
  const threshold = cms.site.storeSettings.lowStockThreshold;

  return NextResponse.json(
    {
      ...cms,
      products: stripProductsForStorefront(cms.products, threshold),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
