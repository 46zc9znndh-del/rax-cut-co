"use client";

import type { ComponentProps } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-1.5 w-full overflow-hidden bg-white/10", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-rax-wood transition-all duration-500"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
