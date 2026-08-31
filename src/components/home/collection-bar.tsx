import Link from "next/link";
import type { CollectionBarSettings } from "@/lib/cms/types";

export function CollectionBar({ settings }: { settings: CollectionBarSettings }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      <Link
        href={settings.left.href}
        className="bg-rax-ember px-6 py-5 text-center font-display text-lg tracking-[0.22em] text-white uppercase hover:bg-rax-ember-dark sm:text-xl"
      >
        {settings.left.text}
      </Link>
      <Link
        href={settings.right.href}
        className="bg-rax-steel px-6 py-5 text-center font-display text-lg tracking-[0.22em] text-white uppercase hover:bg-rax-iron sm:text-xl"
      >
        {settings.right.text}
      </Link>
    </div>
  );
}
