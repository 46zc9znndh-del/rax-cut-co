import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/motion/reveal";
import type { FeaturedSectionSettings } from "@/lib/cms/types";
import type { StorefrontProduct } from "@/types";

export function FeaturedProducts({
  settings,
  products,
}: {
  settings: FeaturedSectionSettings;
  products: StorefrontProduct[];
}) {

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker">{settings.kicker}</p>
              <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-rax-ink uppercase sm:text-5xl">
                {settings.headline}
              </h2>
            </div>
            <Link
              href={settings.linkHref}
              className="font-display text-sm tracking-[0.18em] text-rax-ember uppercase hover:text-rax-ink"
            >
              {settings.linkText}
            </Link>
          </div>
        </Reveal>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
