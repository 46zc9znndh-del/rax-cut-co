"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import type { NavLink } from "@/lib/cms/types";
import { useCartCount, useCartStore, useUiStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export function Header({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const count = useCartCount();
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const openCart = useCartStore((s) => s.openCart);
  const { openSearch, mobileOpen, openMobile, closeMobile } = useUiStore();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black">
      <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          className="text-white lg:hidden"
          aria-label="Open menu"
          onClick={openMobile}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="shrink-0" aria-label="RAX Cut Co. home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-display text-[13px] tracking-[0.18em] uppercase transition-colors hover:text-rax-ember",
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "text-rax-ember"
                  : "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center text-white hover:text-rax-ember"
            onClick={openSearch}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/account"
            aria-label="Customer support"
            className="hidden h-10 w-10 items-center justify-center text-white hover:text-rax-ember sm:flex"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center text-white hover:text-rax-ember"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {hasHydrated && count > 0 && (
              <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center bg-rax-ember px-1 font-display text-[10px] leading-none text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <button
          className={cn(
            "absolute inset-0 bg-black/70 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close menu"
          onClick={closeMobile}
        />
        <div
          className={cn(
            "absolute top-0 left-0 flex h-full w-[min(100%,320px)] flex-col bg-black p-6 transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-10 flex items-center justify-between">
            <Logo variant="mark" />
            <button aria-label="Close menu" onClick={closeMobile} className="text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="font-display text-2xl tracking-[0.12em] text-white uppercase"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={closeMobile}
              className="font-display text-2xl tracking-[0.12em] text-white uppercase"
            >
              Support
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
