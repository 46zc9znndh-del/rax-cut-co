import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { AdminDashboardPage } from "@/components/admin/dashboard";

export default async function AdminDashboardRoute() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }

  return <AdminDashboardPage />;
}
