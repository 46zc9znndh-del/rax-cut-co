import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display tracking-[0.16em] uppercase transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rax-ember cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-rax-ember text-rax-cream hover:bg-rax-ember-dark",
        outline:
          "border border-rax-cream/80 bg-transparent text-rax-cream hover:bg-rax-cream hover:text-rax-black",
        ghost: "text-rax-cream hover:text-rax-wood",
        wood: "bg-rax-wood text-rax-black hover:bg-[#d4b57a]",
        dark: "bg-rax-black text-rax-cream hover:bg-rax-steel border border-white/10",
      },
      size: {
        default: "h-12 px-6 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 tracking-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
