import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { getCmsData } from "@/lib/cms/store";
import { getStorefrontProductsFromCms } from "@/lib/products";
import { ProductDetail } from "@/components/product/product-detail";
import { buildProductMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, productSchemaJson } from "@/lib/seo/json-ld";

export async function generateStaticParams() {
  const products = getStorefrontProductsFromCms(await getCmsData());
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getStorefrontProductsFromCms(await getCmsData()).find(
    (item) => item.slug === slug
  );
  if (!product) {
    return { title: "Product Not Found" };
  }
  return buildProductMetadata(product);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = getStorefrontProductsFromCms(await getCmsData());
  const product = products.find((item) => item.slug === slug);

  return (
    <>
      {product ? (
        <JsonLd
          data={[
            productSchemaJson(product),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              { name: `${product.name} — ${product.wood}`, path: `/shop/${product.slug}` },
            ]),
          ]}
        />
      ) : null}
      <ProductDetail slug={slug} products={products} />
    </>
  );
}
