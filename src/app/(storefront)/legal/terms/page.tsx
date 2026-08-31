import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description: "Terms of use for shopping at RAX Cut Co. — orders, shipping, returns, and site use.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-[0.1em] uppercase">Terms of Use</h1>
      <p className="mt-6 text-rax-muted leading-relaxed">
        By using raxcuttingco.com you agree to these terms. Products are sold as described on
        each product page. Prices and availability may change. Orders are confirmed when
        payment succeeds through Stripe checkout.
      </p>
      <p className="mt-4 text-rax-muted leading-relaxed">
        Cutting boards are natural wood products — grain and tone vary. Our lifetime guarantee
        covers structural defects under normal kitchen use. For questions, contact
        hello@raxcuttingco.com.
      </p>
    </section>
  );
}
