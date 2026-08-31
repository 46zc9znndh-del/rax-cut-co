"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SitePopupSettings } from "@/lib/cms/types";

const DISMISS_KEY = "rax-site-popup-dismissed";

export function SitePopup({ settings }: { settings: SitePopupSettings }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settings.enabled) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setOpen(true);
  }, [settings.enabled]);

  if (!settings.enabled || !open) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-popup-title"
        className="w-full max-w-md border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl"
      >
        <p className="font-display text-[10px] tracking-[0.24em] text-rax-ember uppercase">
          RAX Cut Co.
        </p>
        <h2 id="site-popup-title" className="mt-3 font-display text-2xl tracking-[0.08em] uppercase">
          {settings.headline}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/75">{settings.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={settings.ctaHref}>{settings.ctaText}</Link>
          </Button>
          <Button type="button" variant="dark" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
