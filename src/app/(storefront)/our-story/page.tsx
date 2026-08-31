import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Our Story — Inside RAX",
  description:
    "RAX Cut Co. is an American mill building heavy-duty hardwood drip boards with integrated drainage — crafted in Washington, USA.",
  path: "/our-story",
  ogImage: "/images/portfolio/mill-shot.jpg",
});

export default function OurStoryPage() {
  return (
    <>
      <section className="relative isolate min-h-[50vh] overflow-hidden bg-black">
        <Image
          src="/images/portfolio/mill-shot.jpg"
          alt="RAX cutting board at the mill"
          fill
          className="object-cover object-[50% 45%]"
          priority
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-7xl items-end px-4 pb-16 sm:px-6">
          <div>
            <p className="section-kicker">The Mill</p>
            <h1 className="mt-3 font-display text-5xl tracking-[0.08em] text-white uppercase sm:text-7xl">
              Our Story
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#ece7df]">
            <Image
              src="/images/portfolio/grain-finish.jpg"
              alt="RAX board grain and finish detail"
              fill
              className="object-cover object-[50%_40%]"
              sizes="50vw"
            />
          </div>
          <div>
            <p className="font-serif text-3xl italic leading-snug text-rax-ink">
              We didn’t set out to make pretty boards. We set out to make boards
              that could take a beating and still look like they belonged on the
              table.
            </p>
            <p className="mt-8 leading-relaxed text-rax-muted">
              RAX Cut Co. started in Washington in 2026 with a mill, a stack of
              hardwood, and cooks who were tired of boards that cupped after a
              season. Every slab is still precision-milled, hand-finished, and
              stamped with the bull before it leaves the floor.
            </p>
            <p className="mt-5 leading-relaxed text-rax-muted">
              Tough. Precise. Built to last a lifetime. That’s the whole catalog.
            </p>
            <Button asChild className="mt-10">
              <Link href="/shop">Shop the line</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
