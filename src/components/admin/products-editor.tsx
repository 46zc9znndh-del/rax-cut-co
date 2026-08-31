"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AdminPanel,
  AdminShell,
  FieldLabel,
  SaveBar,
  useAdminCms,
} from "@/components/admin/admin-shell";
import { ProductPhotosEditor } from "@/components/admin/product-photos-editor";
import { Input } from "@/components/ui/input";
import type { CmsProduct } from "@/lib/cms/types";
import { DEFAULT_PRODUCT_IMAGES } from "@/lib/cms/product-images";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductsAdminPage() {
  const router = useRouter();
  const { loading, error, cms, setCms, productImages, addToLibrary, saving, savedAt, save } =
    useAdminCms();

  useEffect(() => {
    if (error === "Unauthorized") {
      router.push("/admin");
    }
  }, [error, router]);

  if (loading) {
    return (
      <AdminShell title="Products">
        <p className="text-white/60">Loading...</p>
      </AdminShell>
    );
  }

  if (!cms) {
    return (
      <AdminShell title="Products">
        <p className="text-red-400">{error || "Unable to load products."}</p>
      </AdminShell>
    );
  }

  function updateProduct(index: number, patch: Partial<CmsProduct>) {
    setCms((current) => {
      if (!current) return current;
      const products = [...current.products];
      products[index] = { ...products[index], ...patch };
      return { ...current, products };
    });
  }

  async function handleSave() {
    if (!cms) return;
    const next = {
      ...cms,
      products: cms.products.map((product) => ({
        ...product,
        slug: product.slug || slugify(product.name),
      })),
    };
    await save(next);
  }

  return (
    <AdminShell title="Products">
      <p className="mb-6 text-sm text-white/60">
        Edit price, stock, description, and photos. Add as many product photos as you need — first
        photo is the main image. Click Save Changes when done.
      </p>

      <div className="space-y-6">
        {cms.products.map((product, index) => {
          const photos = product.images.length ? product.images : [...DEFAULT_PRODUCT_IMAGES.bamboo];

          return (
            <AdminPanel key={product.id} title={`${product.name} — ${product.wood}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={product.name}
                    onChange={(event) =>
                      updateProduct(index, {
                        name: event.target.value,
                        slug: slugify(event.target.value),
                      })
                    }
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <FieldLabel>Wood</FieldLabel>
                  <select
                    value={product.wood}
                    onChange={(event) =>
                      updateProduct(index, {
                        wood: event.target.value as CmsProduct["wood"],
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/20 bg-black px-3 text-white"
                  >
                    <option value="Bamboo">Bamboo</option>
                    <option value="Maple">Maple</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Price</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(event) =>
                      updateProduct(index, { price: Number(event.target.value) })
                    }
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <FieldLabel>Inventory</FieldLabel>
                  <Input
                    type="number"
                    value={product.inventory}
                    onChange={(event) =>
                      updateProduct(index, { inventory: Number(event.target.value) })
                    }
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={product.description}
                    onChange={(event) =>
                      updateProduct(index, { description: event.target.value })
                    }
                    rows={4}
                    className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={(event) =>
                        updateProduct(index, { inStock: event.target.checked })
                      }
                    />
                    In stock
                  </label>
                </div>
              </div>

              <ProductPhotosEditor
                photos={photos}
                library={productImages}
                onChange={(nextPhotos) => {
                  const positions = product.imagePosition ?? [];
                  updateProduct(index, {
                    images: nextPhotos,
                    imagePosition: nextPhotos.map((_, photoIndex) => positions[photoIndex] ?? "50% 46%"),
                  });
                }}
                onUploaded={addToLibrary}
              />
            </AdminPanel>
          );
        })}
      </div>

      <div className="mt-8">
        <SaveBar
          saving={saving}
          savedAt={savedAt}
          error={error === "Unauthorized" ? "" : error}
          onSave={handleSave}
        />
      </div>
    </AdminShell>
  );
}
