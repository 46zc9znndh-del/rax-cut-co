import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import type { Coupon } from "@/lib/cms/types";
import type { CmsProduct } from "@/lib/cms/types";
import { getFreshCmsData, saveCmsData } from "@/lib/cms/store";
import { syncCmsCatalogToStripe } from "@/lib/stripe/sync";

export async function POST() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cms = await getFreshCmsData();
    const sync = await syncCmsCatalogToStripe(cms);

    const saved = await saveCmsData({
      ...cms,
      products: sync.products,
      site: {
        ...cms.site,
        storeSettings: {
          ...cms.site.storeSettings,
          coupons: sync.coupons,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      errors: sync.errors,
      productsSynced: saved.products.filter((product: CmsProduct) => product.stripePriceId).length,
      couponsSynced: saved.site.storeSettings.coupons.filter(
        (coupon: Coupon) => coupon.stripePromotionCodeId
      ).length,
    });
  } catch (error) {
    console.error("Stripe sync error:", error);
    return NextResponse.json({ error: "Unable to sync catalog to Stripe." }, { status: 500 });
  }
}
