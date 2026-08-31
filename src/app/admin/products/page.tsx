import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { ProductsAdminPage } from "@/components/admin/products-editor";

export default async function AdminProductsPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }

  return <ProductsAdminPage />;
}
