"use client";

import { createContext, useContext } from "react";
import type { StoreSettings } from "@/lib/cms/types";
import { DEFAULT_STORE_SETTINGS } from "@/lib/constants";

const StoreSettingsContext = createContext<StoreSettings>(DEFAULT_STORE_SETTINGS);

export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
