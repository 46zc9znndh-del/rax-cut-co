import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Lifetime Guarantee",
  description:
    "Every RAX Original Drip Board is backed by a lifetime structural guarantee — if we built it, we stand behind it.",
  path: "/guarantee",
});

export default function GuaranteePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ShieldCheck className="h-12 w-12 text-rax-ember" />
      <p className="section-kicker mt-6">No Fine Print Heroics</p>
      <h1 className="mt-3 font-display text-5xl tracking-[0.08em] uppercase">
        Lifetime Guarantee
      </h1>
      <p className="mt-6 leading-relaxed text-rax-muted">
        If a RAX board fails structurally — splits, delaminates, or cups beyond
        true from a manufacturing defect — we repair or replace it. That’s the
        whole policy. We built it. We stand behind it.
      </p>
      <div className="mt-10 space-y-6 border-y border-white/10 py-10">
        <div>
          <h2 className="font-display tracking-[0.14em] uppercase">Covered</h2>
          <p className="mt-2 text-rax-muted">
            Glue-line failure, milling defects, and warpage that isn’t caused by
            soaking, dishwashers, or stovetop heat.
          </p>
        </div>
        <div>
          <h2 className="font-display tracking-[0.14em] uppercase">Not covered</h2>
          <p className="mt-2 text-rax-muted">
            Knife marks, stains, burned faces, and damage from standing water or
            machines. Those are use. We can still talk through a refinish.
          </p>
        </div>
      </div>
      <p className="mt-8 font-serif text-2xl italic">
        Heritage quality isn’t a slogan. It’s a mill that answers the phone.
      </p>
      <Button asChild className="mt-10">
        <Link href="/shop">Shop with confidence</Link>
      </Button>
    </section>
  );
}
