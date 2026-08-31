import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/product/search-results";
import { searchProducts } from "@/lib/products";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Search",
  description: "Search RAX Cut Co. for drip boards, wood options, and shop collections.",
  path: "/search",
  keywords: ["search RAX Cut Co", "find cutting board", "drip board search"],
});

export default async function SearchPage() {
  const products = await searchProducts("");

  return (
    <Suspense fallback={<div className="px-4 py-20 text-rax-muted">Loading search…</div>}>
      <SearchResults products={products} />
    </Suspense>
  );
}
