"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { PortfolioCategory, PortfolioSettings } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

const filters: Array<"All" | PortfolioCategory> = [
  "All",
  "In Action",
  "Craft & Detail",
  "The Mark",
];

export function PortfolioGallery({
  settings,
  featuredOnly = false,
  hideHeader = false,
}: {
  settings: PortfolioSettings;
  featuredOnly?: boolean;
  hideHeader?: boolean;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const items = useMemo(() => {
    const source = featuredOnly
      ? settings.items.filter((item) => settings.featuredIds.includes(item.id))
      : settings.items;

    if (filter === "All") return source;
    return source.filter((item) => item.category === filter);
  }, [filter, featuredOnly, settings.featuredIds, settings.items]);

  return (
    <section
      className={cn(
        featuredOnly ? "bg-black py-16 sm:py-20" : hideHeader ? "bg-white" : "bg-white py-16 sm:py-20"
      )}
    >
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6", hideHeader && "px-0")}>
        {!hideHeader ? (
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className={featuredOnly ? "font-display text-xs tracking-[0.28em] text-rax-ember uppercase" : "section-kicker"}>
                {featuredOnly ? settings.homeKicker : settings.page.kicker}
              </p>
              <h2
                className={cn(
                  "mt-3 font-display text-4xl tracking-[0.08em] uppercase sm:text-5xl",
                  featuredOnly ? "text-white" : "text-rax-ink"
                )}
              >
                {featuredOnly ? settings.homeHeadline : settings.page.headline}
              </h2>
              <p
                className={cn(
                  "mt-4 max-w-2xl leading-relaxed",
                  featuredOnly ? "text-rax-muted-dark" : "text-rax-muted"
                )}
              >
                {featuredOnly ? settings.homeDescription : settings.page.description}
              </p>
            </div>
            {featuredOnly ? (
              <Link
                href={settings.homeLinkHref}
                className="font-display text-sm tracking-[0.18em] text-rax-ember uppercase hover:text-white"
              >
                {settings.homeLinkText}
              </Link>
            ) : null}
          </div>
        </Reveal>
        ) : null}

        {!featuredOnly ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={cn(
                  "border px-4 py-2 font-display text-xs tracking-[0.18em] uppercase transition-colors",
                  filter === item
                    ? "border-rax-ember bg-rax-ember text-white"
                    : "border-black/15 text-rax-muted hover:border-rax-ember hover:text-rax-ink"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
            featuredOnly && "lg:grid-cols-3"
          )}
        >
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.04}>
              <figure
                className={cn(
                  "group relative overflow-hidden bg-black",
                  featuredOnly ? "aspect-[4/5]" : "aspect-[4/5] lg:aspect-[3/4]"
                )}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  loading={index < 3 ? undefined : "lazy"}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: item.imagePosition }}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5">
                  <p className="font-display text-[10px] tracking-[0.22em] text-rax-ember uppercase">
                    {item.category}
                  </p>
                  <h3 className="mt-2 font-display text-xl tracking-[0.08em] text-white uppercase">
                    {item.title}
                  </h3>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {featuredOnly ? (
          <div className="mt-10 flex justify-center">
            <Button asChild variant="outline">
              <Link href={settings.homeLinkHref}>{settings.homeLinkText}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
