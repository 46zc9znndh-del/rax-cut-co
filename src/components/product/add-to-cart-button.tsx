"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  wood: string;
};

export function AddToCartButton({
  product,
  disabled,
  size = "sm",
  className,
  label = "Add",
}: {
  product: CartItem;
  disabled?: boolean;
  size?: "sm" | "lg" | "default";
  className?: string;
  label?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      size={size}
      className={className}
      disabled={disabled}
      onClick={() => addItem(product)}
    >
      {label}
    </Button>
  );
}
