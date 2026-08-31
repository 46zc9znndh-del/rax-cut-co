import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Customer Support",
  description:
    "Order help, shipping questions, and product support for RAX Cut Co. customers.",
  path: "/account",
});

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <p className="section-kicker">Customer Support</p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.1em] uppercase sm:text-5xl">
        We&apos;re Here to Help
      </h1>
      <p className="mt-6 leading-relaxed text-rax-muted">
        RAX Cut Co. checkout does not require a customer account. After you place an order,
        your confirmation email includes your order details and receipt from Stripe.
      </p>

      <div className="mt-10 space-y-6 border border-black/10 bg-rax-paper p-6">
        <div>
          <h2 className="font-display text-lg tracking-[0.12em] uppercase">Order questions</h2>
          <p className="mt-2 text-sm leading-relaxed text-rax-muted">
            Reply to your order confirmation email or contact us with your order number and
            we&apos;ll help with shipping, changes, or delivery updates.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg tracking-[0.12em] uppercase">Product & care</h2>
          <p className="mt-2 text-sm leading-relaxed text-rax-muted">
            See our care guide and lifetime guarantee for board maintenance and warranty coverage.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/care">Care Guide</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/guarantee">Lifetime Guarantee</Link>
            </Button>
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg tracking-[0.12em] uppercase">Contact</h2>
          <p className="mt-2 text-sm leading-relaxed text-rax-muted">
            Email{" "}
            <a href="mailto:hello@raxcuttingco.com" className="text-rax-ember hover:underline">
              hello@raxcuttingco.com
            </a>{" "}
            and we&apos;ll get back to you as soon as we can.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Button asChild>
          <Link href="/shop">Shop Boards</Link>
        </Button>
      </div>
    </section>
  );
}
