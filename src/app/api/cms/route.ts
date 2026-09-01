import { NextResponse } from "next/server";
import { getFreshCmsData } from "@/lib/cms/store";
import { stripProductsForStorefront } from "@/lib/products/stock";

export async function GET() {
  const cms = await getFreshCmsData();
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
