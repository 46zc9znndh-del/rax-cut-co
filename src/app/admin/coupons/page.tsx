import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { CouponsAdminPage } from "@/components/admin/coupons-editor";

export default async function AdminCouponsPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }

  return <CouponsAdminPage />;
}
