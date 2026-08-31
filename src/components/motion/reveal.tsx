import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("reveal-on-scroll", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
