"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FooterSettings, NavLink } from "@/lib/cms/types";
import { isSocialLinkConfigured } from "@/lib/social";

function SocialIcon({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} aria-label={label} className="hover:text-rax-cream">
      {children}
    </a>
  );
}

export function Footer({
  settings,
  links,
}: {
  settings: FooterSettings;
  links: NavLink[];
}) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinedMessage, setJoinedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    const body = (await response.json()) as { welcomeSent?: boolean; error?: string };

    if (!response.ok) {
      setError(body.error || "Unable to subscribe right now.");
      return;
    }

    setJoinedMessage(
      body.welcomeSent === false
        ? "You're on the list."
        : settings.newsletterSuccess
    );
    setJoined(true);
  }

  return (
    <footer className="border-t border-white/10 bg-black text-rax-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo variant="stack" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-rax-muted">
            {settings.tagline}
          </p>
          <p className="mt-4 font-display text-xs tracking-[0.28em] text-rax-wood uppercase">
            {settings.locationLine}
          </p>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-display text-sm tracking-[0.2em] uppercase">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-rax-muted">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-rax-cream">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/account" className="hover:text-rax-cream">
                Support
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h3 className="font-display text-sm tracking-[0.2em] uppercase">
            {settings.newsletterHeadline}
          </h3>
          <p className="mt-3 text-sm text-rax-muted">
            {settings.newsletterDescription}
          </p>
          {joined ? (
            <p className="mt-4 font-display tracking-[0.12em] text-rax-wood uppercase">
              {joinedMessage || settings.newsletterSuccess}
            </p>
          ) : (
            <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Joining..." : "Join"}
                </Button>
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </form>
          )}
          <div className="mt-6 flex gap-4 text-rax-muted">
            {isSocialLinkConfigured(settings.social.instagram) ? (
            <SocialIcon label="Instagram" href={settings.social.instagram}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
            </SocialIcon>
            ) : null}
            {isSocialLinkConfigured(settings.social.facebook) ? (
            <SocialIcon label="Facebook" href={settings.social.facebook}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z" />
              </svg>
            </SocialIcon>
            ) : null}
            {isSocialLinkConfigured(settings.social.youtube) ? (
            <SocialIcon label="YouTube" href={settings.social.youtube}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 12.2s-.2-3.2-1-4.6c-.9-1.2-1.9-1.2-2.4-1.3C16.4 6 12 6 12 6s-4.4 0-7.6.3c-.5.1-1.5.1-2.4 1.3-.8 1.4-1 4.6-1 4.6S.8 16 .8 16.8c.2 1.5 1.5 2.2 1.9 2.4 1.4.6 6.3.8 9.3.8s7.9-.2 9.3-.8c.4-.2 1.7-.9 1.9-2.4.2-.8.8-4.6.8-4.6ZM9.8 15.5v-6l6 3-6 3Z" />
              </svg>
            </SocialIcon>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-rax-muted sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} RAX Cut Co. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:justify-end">
            <Link href="/legal/privacy" className="hover:text-rax-cream">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-rax-cream">
              Terms of Use
            </Link>
            {settings.employeeLoginLabel ? (
              <Link
                href={settings.employeeLoginHref || "/admin"}
                className="text-rax-muted/40 hover:text-rax-muted"
              >
                {settings.employeeLoginLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
