import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StorefrontChrome } from "@/components/layout/storefront-chrome";
import { SitePopup } from "@/components/layout/site-popup";
import { getCmsData } from "@/lib/cms/store";
import { organizationSchema, websiteSchema } from "@/lib/seo/json-ld";
import { StoreSettingsProvider } from "@/lib/store-settings-context";

export const revalidate = 300;

export default async function StorefrontLayout({
  children,
}: LayoutProps<"/">) {
  const { site } = await getCmsData();

  return (
    <StoreSettingsProvider settings={site.storeSettings}>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <AnnouncementBar settings={site.announcement} />
      <Header links={site.nav.links} />
      <main className="flex-1">{children}</main>
      <Footer settings={site.footer} links={site.nav.links} />
      <SitePopup settings={site.popup} />
      <StorefrontChrome />
    </StoreSettingsProvider>
  );
}
