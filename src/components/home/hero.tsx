import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HeroSettings } from "@/lib/cms/types";

export function Hero({ settings }: { settings: HeroSettings }) {
  const headlineLines = settings.headline.split("\n");

  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden bg-black lg:min-h-[86vh]">
      <Image
        src={settings.image}
        alt="RAX Cut Co. hardwood cutting board with branded bull mark"
        fill
        priority
        fetchPriority="high"
        className="object-cover"
        style={{ objectPosition: settings.imagePosition }}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:min-h-[86vh] lg:justify-center lg:pb-8">
        <p className="hero-fade-up font-display text-xs tracking-[0.32em] text-rax-ember uppercase">
          {settings.kicker}
        </p>
        <h1 className="hero-fade-up hero-delay-1 mt-4 max-w-4xl font-display text-5xl leading-[0.9] tracking-[0.06em] text-white uppercase sm:text-7xl lg:text-8xl">
          {headlineLines.map((line, index) => (
            <span key={line}>
              {line}
              {index < headlineLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h1>
        <p className="hero-fade-up hero-delay-2 mt-6 max-w-xl text-lg text-white/80">
          {settings.subheadline}
        </p>
        <div className="hero-fade-up hero-delay-3 mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={settings.primaryCta.href}>{settings.primaryCta.text}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={settings.secondaryCta.href}>{settings.secondaryCta.text}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
