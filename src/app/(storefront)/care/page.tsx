import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Care & Maintenance",
  description:
    "How to wash, oil, and maintain your RAX Original Drip Board — bamboo or maple — so it lasts a lifetime.",
  path: "/care",
});

export default function CarePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="section-kicker">Doctrine</p>
      <h1 className="mt-3 font-display text-5xl tracking-[0.08em] uppercase">
        Care & Maintenance
      </h1>
      <p className="mt-5 text-rax-muted leading-relaxed">
        Hardwood is alive until you kill it with heat, standing water, or
        neglect. Follow this and a RAX board will outlast the kitchen.
      </p>

      <Accordion type="single" defaultValue="oil" collapsible className="mt-12">
        <AccordionItem value="oil">
          <AccordionTrigger>01 — First-week seasoning</AccordionTrigger>
          <AccordionContent>
            Oil it the night it arrives, then again the next two nights. Flood
            the surface. When the grain stops drinking, wipe it dry. Use only
            food-grade mineral oil — never olive, canola, or anything from the
            pantry.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="wash">
          <AccordionTrigger>02 — Daily wash</AccordionTrigger>
          <AccordionContent>
            Scrape, wash by hand, rinse, and stand on edge. Do not soak. Do not
            dishwasher. If you cut raw meat, a dilute vinegar wipe after soap is
            plenty. Dry is the goal.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="wax">
          <AccordionTrigger>03 — Wax the thirsty months</AccordionTrigger>
          <AccordionContent>
            After oiling, buff on RAX board wax (beeswax + carnauba). It sheds
            water and keeps the grain from raising. Most working kitchens wax
            every 4–6 weeks. You’ll know when the board looks dull and dry.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fix">
          <AccordionTrigger>04 — Marks, stains, warps</AccordionTrigger>
          <AccordionContent>
            Knife marks are honest. Deep grooves can be sanded with 180 then 220
            and re-oiled. Lemon and coarse salt lift garlic and onion odor.
            If a board ever cups beyond true, contact us — the lifetime
            guarantee covers structural failure, not neglect.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button asChild className="mt-12">
        <Link href="/shop">Shop the Original Drip Board</Link>
      </Button>
    </section>
  );
}
