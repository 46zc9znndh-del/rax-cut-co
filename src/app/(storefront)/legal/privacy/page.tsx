import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "RAX Cut Co. privacy policy — how we collect, use, and protect your information.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-[0.1em] uppercase">Privacy Policy</h1>
      <p className="mt-6 text-rax-muted leading-relaxed">
        RAX Cut Co. respects your privacy. We collect information you provide at checkout
        (name, email, shipping address) and newsletter signup to fulfill orders and send
        updates you request. Payment data is processed securely by Stripe — we do not store
        card numbers.
      </p>
      <p className="mt-4 text-rax-muted leading-relaxed">
        We do not sell your personal information. Contact us at hello@raxcuttingco.com with
        privacy questions or deletion requests.
      </p>
    </section>
  );
}
