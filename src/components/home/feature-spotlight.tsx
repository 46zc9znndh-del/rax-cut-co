import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { FeatureSection } from "@/lib/cms/types";

const panelStyles = {
  charcoal: "bg-rax-charcoal text-rax-cream",
  black: "bg-black text-rax-cream",
  ember: "bg-rax-ember text-white",
} as const;

function FeatureBlock({ section }: { section: FeatureSection }) {
  const imageFirst = section.imageSide === "left";
  const panelClass = panelStyles[section.variant];

  const imageBlock = (
    <div className="relative min-h-[420px] bg-black lg:min-h-[640px]">
      <Image
        src={section.image}
        alt={section.headline}
        fill
        className="object-cover"
        style={{ objectPosition: section.imagePosition }}
        sizes="50vw"
      />
    </div>
  );

  const textBlock = (
    <div className={`flex items-center px-6 py-16 sm:px-12 lg:px-16 ${panelClass}`}>
      <Reveal>
        <p
          className={
            section.variant === "ember"
              ? "font-display text-xs tracking-[0.28em] uppercase text-white/80"
              : "section-kicker"
          }
        >
          {section.kicker}
        </p>
        <h2 className="mt-4 font-display text-4xl tracking-[0.08em] uppercase sm:text-5xl">
          {section.headline}
        </h2>
        <p
          className={`mt-6 max-w-lg leading-relaxed ${
            section.variant === "ember" ? "text-white/90" : "text-rax-muted-dark"
          }`}
        >
          {section.body}
        </p>
        {section.bullets?.length ? (
          <ul className="mt-8 space-y-3 font-display text-sm tracking-[0.12em] uppercase">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="border-l-2 border-rax-ember pl-4">
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}
        {section.quote ? (
          <p className="mt-6 font-serif text-2xl italic text-white/90">
            “{section.quote}”
          </p>
        ) : null}
        {section.cta ? (
          <Button
            asChild
            variant={
              section.variant === "black"
                ? "outline"
                : section.variant === "ember"
                  ? "dark"
                  : "default"
            }
            className="mt-10"
          >
            <Link href={section.cta.href}>{section.cta.text}</Link>
          </Button>
        ) : null}
      </Reveal>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2">
      {imageFirst ? (
        <>
          {imageBlock}
          {textBlock}
        </>
      ) : (
        <>
          <div className="lg:order-1">{textBlock}</div>
          <div className="lg:order-2">{imageBlock}</div>
        </>
      )}
    </div>
  );
}

export function FeatureSpotlight({ sections }: { sections: FeatureSection[] }) {
  return (
    <section>
      {sections.map((section) => (
        <FeatureBlock key={section.id} section={section} />
      ))}
    </section>
  );
}
