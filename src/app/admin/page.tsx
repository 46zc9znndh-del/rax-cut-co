import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { AdminLoginForm } from "@/components/admin/admin-shell";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black p-8">
        <p className="font-display text-xs tracking-[0.24em] text-rax-ember uppercase">
          RAX Cut Co.
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-[0.08em] text-white uppercase">
          Admin
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Sign in to manage orders, products, and site content.
        </p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
