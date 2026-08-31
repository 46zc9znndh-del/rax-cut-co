import Link from "next/link";
import type { AnnouncementSettings } from "@/lib/cms/types";

export function AnnouncementBar({ settings }: { settings: AnnouncementSettings }) {
  return (
    <div className="bg-rax-ember">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-2.5 sm:px-6">
        <p className="text-center font-display text-[11px] tracking-[0.22em] text-white sm:text-xs">
          {settings.line1}
          <span className="mx-3 hidden sm:inline">·</span>
          <span className="mt-0.5 block sm:mt-0 sm:inline">{settings.line2}</span>
        </p>
        <Link
          href={settings.ctaHref}
          className="hidden shrink-0 bg-black px-3 py-1.5 font-display text-[10px] tracking-[0.18em] text-white uppercase sm:inline-block"
        >
          {settings.ctaText}
        </Link>
      </div>
    </div>
  );
}
