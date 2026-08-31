"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () => import("@/components/layout/cart-drawer").then((module) => module.CartDrawer),
  { ssr: false }
);

const SearchDialog = dynamic(
  () => import("@/components/layout/search-dialog").then((module) => module.SearchDialog),
  { ssr: false }
);

export function StorefrontChrome() {
  return (
    <>
      <CartDrawer />
      <SearchDialog />
    </>
  );
}
