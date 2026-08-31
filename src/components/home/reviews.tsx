"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StarRating } from "@/components/product/star-rating";
import type { ReviewsSettings } from "@/lib/cms/types";

export function Reviews({ settings }: { settings: ReviewsSettings }) {
  const reviews = settings.items;
  const [index, setIndex] = useState(0);
  const review = reviews[index];

  const prev = () => setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1));

  return (
    <section className="bg-rax-charcoal py-20 text-rax-cream sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">{settings.kicker}</p>
          <h2 className="mt-3 font-display text-4xl tracking-[0.08em] uppercase sm:text-5xl">
            {settings.headline}
          </h2>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-black">
            <Image
              src={review.image}
              alt={`${review.product} in use`}
              fill
              className="object-cover object-[50%_45%]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <StarRating rating={review.rating} />
            <h3 className="mt-4 font-display text-3xl tracking-[0.06em] uppercase">
              {review.title}
            </h3>
            <p className="mt-5 font-serif text-2xl italic leading-snug text-rax-cream/90">
              “{review.body}”
            </p>
            <p className="mt-6 text-sm tracking-[0.14em] text-rax-muted uppercase">
              {review.name} · {review.location}
            </p>
            <p className="mt-1 text-sm text-rax-wood">{review.product}</p>
            <div className="mt-8 flex gap-3">
              <button
                aria-label="Previous review"
                onClick={prev}
                className="grid h-11 w-11 place-items-center border border-white/20 hover:border-rax-wood hover:text-rax-wood"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next review"
                onClick={next}
                className="grid h-11 w-11 place-items-center border border-white/20 hover:border-rax-wood hover:text-rax-wood"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="ml-2 self-center font-display text-xs tracking-[0.2em] text-rax-muted">
                {String(index + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {reviews.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden ${
                i === index ? "ring-2 ring-rax-ember" : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`Show review from ${item.name}`}
            >
              <Image src={item.image} alt="" fill className="object-cover object-[50%_45%]" sizes="160px" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
