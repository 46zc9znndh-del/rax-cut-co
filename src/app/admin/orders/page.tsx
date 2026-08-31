import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { OrdersAdminPage } from "@/components/admin/orders-manager";

export default async function AdminOrdersRoute() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }

  return <OrdersAdminPage />;
}
