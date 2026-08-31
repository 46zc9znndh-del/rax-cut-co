import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full border border-white/15 bg-rax-black px-4 text-sm text-rax-cream placeholder:text-rax-muted outline-none transition-colors focus:border-rax-wood",
        className
      )}
      {...props}
    />
  );
}

export { Input };
