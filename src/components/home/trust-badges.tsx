import { Droplets, Hammer, Trees, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { TrustBadge } from "@/lib/cms/types";

const iconMap = {
  drainage: Droplets,
  build: Hammer,
  wood: Trees,
  guarantee: ShieldCheck,
} as const;

export function TrustBadges({ badges }: { badges: TrustBadge[] }) {
  return (
    <section className="border-y border-black/8 bg-[#f3f1ec]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {badges.map((badge, i) => {
          const Icon = iconMap[badge.id as keyof typeof iconMap] ?? ShieldCheck;
          return (
            <Reveal key={badge.id} delay={i * 0.08}>
              <div className="flex gap-4">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-rax-ember" />
                <div>
                  <h2 className="font-display text-sm tracking-[0.12em] text-rax-ink uppercase">
                    {badge.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-rax-muted">
                    {badge.copy}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
