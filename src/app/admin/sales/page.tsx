import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { SalesAdminPage } from "@/components/admin/sales-tracker";

export default async function AdminSalesPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }

  return <SalesAdminPage />;
}
