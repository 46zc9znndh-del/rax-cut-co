"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <>
      {open && (
        <button
          aria-label="Close panel"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]"
          onClick={() => onOpenChange(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-rax-charcoal transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
        aria-hidden={!open}
      >
        {children}
      </aside>
    </>
  );
}

export { Sheet };
