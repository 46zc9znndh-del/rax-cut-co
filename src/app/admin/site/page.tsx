import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { SiteEditorPage } from "@/components/admin/site-editor";

export default async function AdminSitePage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }

  return <SiteEditorPage />;
}
