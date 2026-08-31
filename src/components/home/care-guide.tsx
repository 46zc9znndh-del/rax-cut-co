import Link from "next/link";
import { Droplets, Hand, Flame } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Droplets,
    value: "season",
    title: "Seasoning",
    body: "Flood the face with food-grade mineral oil until the grain stops drinking. Let it sit overnight. Wipe dry. A new board wants oil three nights in a row — then monthly after that. Never use cooking oil. It goes rancid.",
  },
  {
    icon: Hand,
    value: "wash",
    title: "Washing",
    body: "Hand wash. Warm water. Mild soap. Rinse. Stand it on edge to dry. Never soak, never dishwasher, never leave it in a wet sink. Heat and standing water are how good boards die.",
  },
  {
    icon: Flame,
    value: "wax",
    title: "Wax Conditioning",
    body: "After oiling, buff on a thin coat of beeswax-carnauba blend. It seals the surface, sheds water, and keeps the grain from raising. Repeat whenever the board looks thirsty — usually every 4–6 weeks in a working kitchen.",
  },
];

export function CareGuide() {
  return (
    <section className="bg-rax-black py-20 text-rax-cream sm:py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="section-kicker">Keep It Forever</p>
          <h2 className="mt-4 font-display text-4xl tracking-[0.08em] uppercase sm:text-5xl">
            Board Care & Maintenance
          </h2>
          <p className="mt-6 max-w-lg text-rax-muted leading-relaxed">
            A RAX board is not disposable kitchenware. Treat it like a tool and
            it will outlast the knives you use on it. Three habits. That’s the
            whole doctrine.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/care">Full Care Guide</Link>
          </Button>
        </Reveal>

        <Reveal delay={0.12}>
          <Accordion type="single" defaultValue="season" collapsible>
            {steps.map((step) => (
              <AccordionItem key={step.value} value={step.value}>
                <AccordionTrigger>
                  <span className="flex items-center gap-3">
                    <step.icon className="h-5 w-5 text-rax-ember" />
                    {step.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent>{step.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
