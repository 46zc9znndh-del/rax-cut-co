import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="section-kicker">404</p>
      <h1 className="mt-3 font-display text-5xl tracking-[0.1em] uppercase">
        Off the mill floor
      </h1>
      <p className="mt-4 text-rax-muted">That page isn’t in the catalog.</p>
      <Button asChild className="mt-8">
        <Link href="/shop">Back to shop</Link>
      </Button>
    </section>
  );
}
