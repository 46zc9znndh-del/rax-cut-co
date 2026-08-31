import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-rax-wood/40 bg-rax-wood/10 px-2 py-0.5 font-display text-[10px] tracking-[0.18em] text-rax-wood uppercase",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
