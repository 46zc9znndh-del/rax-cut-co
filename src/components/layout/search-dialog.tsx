"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/cart-store";
import { filterProducts } from "@/lib/search";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

export function SearchDialog() {
  const { searchOpen, closeSearch } = useUiStore();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!searchOpen || loaded) return;

    let cancelled = false;
    void fetch("/api/cms")
      .then((response) => response.json())
      .then((data: { products?: StorefrontProduct[] }) => {
        if (!cancelled) {
          setProducts(data.products ?? []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [searchOpen, loaded]);

  const results = useMemo(
    () => filterProducts(products, query).slice(0, 6),
    [products, query]
  );

  return (
    <Dialog
      open={searchOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeSearch();
          setQuery("");
        }
      }}
    >
      <DialogContent>
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search className="h-4 w-4 text-rax-muted" />
          <DialogTitle className="sr-only">Search RAX Cut Co.</DialogTitle>
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards, wood, gear…"
            className="border-0 bg-transparent px-0 focus:border-0"
          />
          <button aria-label="Close search" onClick={closeSearch}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-96 overflow-y-auto p-2">
          {results.map((product) => (
            <li key={product.id}>
              <Link
                href={`/shop/${product.slug}`}
                onClick={closeSearch}
                className="flex items-center gap-3 px-3 py-3 hover:bg-white/5"
              >
                <div className="relative h-14 w-14 overflow-hidden bg-rax-steel">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display tracking-[0.08em] uppercase">
                    {product.name}
                  </p>
                  <p className="truncate text-sm text-rax-muted">{product.tagline}</p>
                </div>
                <span className="text-sm text-rax-wood">
                  {formatCurrency(product.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {query ? (
          <div className="border-t border-white/10 p-3 text-center">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={closeSearch}
              className="font-display text-xs tracking-[0.18em] text-rax-wood uppercase"
            >
              View all results
            </Link>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
