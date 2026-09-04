"use client";

import dynamic from "next/dynamic";
import type { SitePopupSettings } from "@/lib/cms/types";

const SitePopup = dynamic(
  () => import("@/components/layout/site-popup").then((module) => module.SitePopup),
  { ssr: false }
);

export function SitePopupLoader({ settings }: { settings: SitePopupSettings }) {
  return <SitePopup settings={settings} />;
}
