import type { Metadata } from "next";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { getCmsData } from "@/lib/cms/store";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio — Boards in Action",
  description:
    "See the RAX Original Drip Board in real kitchens — brisket, steaks, wild game, laser branding, and hardwood craft detail.",
  path: "/portfolio",
  ogImage: "/images/portfolio/brisket-service.jpg",
});

export default async function PortfolioPage() {
  const { site } = await getCmsData();
  const { page } = site.portfolio;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="section-kicker">{page.kicker}</p>
        <h1 className="mt-3 font-display text-5xl tracking-[0.08em] text-rax-ink uppercase sm:text-6xl">
          {page.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-rax-muted">{page.description}</p>
        <PortfolioGallery settings={site.portfolio} hideHeader />
      </div>
    </section>
  );
}
