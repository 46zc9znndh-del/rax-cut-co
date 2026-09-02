import type { StoreSettings } from "@/lib/cms/types";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeShippingThreshold: 150,
  standardShippingRate: 18,
  lowStockThreshold: 10,
  lowStockMessage: "Limited stock — order soon",
  coupons: [],
};

/** @deprecated Use useStoreSettings() or getStoreSettings() */
export const FREE_SHIPPING_THRESHOLD = DEFAULT_STORE_SETTINGS.freeShippingThreshold;
