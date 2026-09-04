import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

export function ProductCard({
  product,
  lowStockMessage,
}: {
  product: StorefrontProduct;
  lowStockMessage: string;
}) {
  const posA = product.imagePosition?.[0] ?? "50% 46%";
  const posB = product.imagePosition?.[1] ?? posA;
  const hoverImage = product.images[1] ?? product.images[0];

  return (
    <article className="group flex flex-col">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-[#ece7df]"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
          style={{ objectPosition: posA }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {hoverImage !== product.images[0] ? (
          <Image
            src={hoverImage}
            alt=""
            fill
            loading="lazy"
            className="object-cover opacity-0 scale-105 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            style={{ objectPosition: posB }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
        {product.badge ? (
          <Badge className="absolute top-3 left-3 border-none bg-rax-ember text-white">
            {product.badge}
          </Badge>
        ) : null}
        {product.lowStock ? (
          <Badge className="absolute top-3 right-3 border-none bg-black/80 text-white">
            {lowStockMessage}
          </Badge>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <h3 className="font-display text-[15px] tracking-[0.12em] text-rax-ink uppercase">
          <Link href={`/shop/${product.slug}`} className="hover:text-rax-ember">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-rax-muted">{product.tagline}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge className="border-black/10">{product.wood}</Badge>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="font-display text-lg tracking-wide text-rax-ink">
              {formatCurrency(product.price)}
            </p>
            {product.lowStock ? (
              <p className="text-xs font-medium text-rax-ember">{lowStockMessage}</p>
            ) : null}
          </div>
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0],
              wood: product.wood,
            }}
            disabled={!product.inStock}
          />
        </div>
      </div>
    </article>
  );
}
