"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminPanel,
  AdminShell,
  FieldLabel,
  SaveBar,
  useAdminCms,
} from "@/components/admin/admin-shell";
import { ProductPhotosEditor } from "@/components/admin/product-photos-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CmsProduct } from "@/lib/cms/types";
import { WOOD_TYPES } from "@/lib/cms/types";
import { DEFAULT_PRODUCT_IMAGES } from "@/lib/cms/product-images";
import { createProduct, slugify, validateProducts } from "@/lib/cms/product-factory";

export function ProductsAdminPage() {
  const router = useRouter();
  const { loading, error, cms, setCms, productImages, addToLibrary, saving, savedAt, save } =
    useAdminCms();
  const [validationError, setValidationError] = useState("");

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
    setValidationError("");
    setCms((current) => {
      if (!current) return current;
      const products = [...current.products];
      products[index] = { ...products[index], ...patch };
      return { ...current, products };
    });
  }

  function addProduct() {
    setValidationError("");
    setCms((current) => {
      if (!current) return current;
      return {
        ...current,
        products: [...current.products, createProduct()],
      };
    });
  }

  function removeProduct(index: number) {
    if (!cms) return;
    const product = cms.products[index];
    if (!window.confirm(`Remove "${product.name}" (${product.wood})? This cannot be undone until you save.`)) {
      return;
    }

    setValidationError("");
    setCms((current) => {
      if (!current) return current;
      return {
        ...current,
        products: current.products.filter((_, productIndex) => productIndex !== index),
      };
    });
  }

  async function handleSave() {
    if (!cms) return;

    const next = {
      ...cms,
      products: cms.products.map((product) => ({
        ...product,
        id: product.id.trim(),
        slug: (product.slug || slugify(product.name)).trim(),
        name: product.name.trim(),
        wood: product.wood.trim(),
      })),
    };

    const validationMessage = validateProducts(next.products);
    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    setValidationError("");
    await save(next);
  }

  return (
    <AdminShell title="Products">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-white/60">
          Add, edit, or remove products. Set price, stock, photos, and URL slug. First photo is the
          main image. Click Save Changes when done.
        </p>
        <Button type="button" onClick={addProduct}>
          Add Product
        </Button>
      </div>

      {cms.products.length === 0 ? (
        <AdminPanel title="No products yet">
          <p className="text-sm text-white/60">
            Your shop is empty. Add a product to get started.
          </p>
          <Button type="button" className="mt-4" onClick={addProduct}>
            Add Product
          </Button>
        </AdminPanel>
      ) : null}

      <div className="space-y-6">
        {cms.products.map((product, index) => {
          const photos = product.images.length ? product.images : [...DEFAULT_PRODUCT_IMAGES.maple];

          return (
            <AdminPanel key={product.id} title={`${product.name} — ${product.wood}`}>
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="dark"
                  size="sm"
                  className="border-red-500/60 text-red-400 hover:bg-red-950"
                  onClick={() => removeProduct(index)}
                >
                  Remove Product
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={product.name}
                    onChange={(event) => updateProduct(index, { name: event.target.value })}
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <FieldLabel>Wood / Material</FieldLabel>
                  <Input
                    value={product.wood}
                    list="wood-types"
                    onChange={(event) => updateProduct(index, { wood: event.target.value })}
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <FieldLabel>URL Slug</FieldLabel>
                  <Input
                    value={product.slug}
                    onChange={(event) => updateProduct(index, { slug: slugify(event.target.value) })}
                    className="border-white/20 bg-black text-white"
                  />
                  <p className="mt-1 text-xs text-white/40">/shop/{product.slug || "your-slug"}</p>
                </div>
                <div>
                  <FieldLabel>Product ID</FieldLabel>
                  <Input
                    value={product.id}
                    onChange={(event) => updateProduct(index, { id: event.target.value.trim() })}
                    className="border-white/20 bg-black text-white"
                  />
                  <p className="mt-1 text-xs text-white/40">Used by cart and checkout — keep stable after launch.</p>
                </div>
                <div>
                  <FieldLabel>Tagline</FieldLabel>
                  <Input
                    value={product.tagline}
                    onChange={(event) => updateProduct(index, { tagline: event.target.value })}
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <FieldLabel>Badge</FieldLabel>
                  <Input
                    value={product.badge ?? ""}
                    onChange={(event) =>
                      updateProduct(index, { badge: event.target.value || undefined })
                    }
                    placeholder="e.g. PREMIUM"
                    className="border-white/20 bg-black text-white"
                  />
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
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <select
                    value={product.category}
                    onChange={(event) =>
                      updateProduct(index, {
                        category: event.target.value as CmsProduct["category"],
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/20 bg-black px-3 text-white"
                  >
                    <option value="board">Board (featured on homepage)</option>
                    <option value="gear">Gear</option>
                  </select>
                </div>
                <div className="flex items-end">
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
              </div>

              <ProductPhotosEditor
                photos={photos}
                library={productImages}
                onChange={(nextPhotos) => {
                  const positions = product.imagePosition ?? [];
                  updateProduct(index, {
                    images: nextPhotos,
                    imagePosition: nextPhotos.map(
                      (_, photoIndex) => positions[photoIndex] ?? "50% 46%"
                    ),
                  });
                }}
                onUploaded={addToLibrary}
              />
            </AdminPanel>
          );
        })}
      </div>

      <datalist id="wood-types">
        {WOOD_TYPES.map((wood) => (
          <option key={wood} value={wood} />
        ))}
      </datalist>

      <div className="mt-8">
        <SaveBar
          saving={saving}
          savedAt={savedAt}
          error={validationError || (error === "Unauthorized" ? "" : error)}
          onSave={handleSave}
        />
      </div>
    </AdminShell>
  );
}
