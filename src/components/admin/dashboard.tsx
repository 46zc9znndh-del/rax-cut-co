"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminPanel,
  AdminShell,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import type { AdminDashboardStats, Order } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/utils";

function TestEmailButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function sendTest() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/email/test", { method: "POST" });
    setLoading(false);
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setMessage(body.error || "Test failed.");
      return;
    }
    setMessage("Test email sent to admin inbox.");
  }

  return (
    <div>
      <Button variant="outline" onClick={sendTest} disabled={loading}>
        {loading ? "Sending..." : "Send Branded Test Email"}
      </Button>
      {message ? <p className="mt-2 text-xs text-white/60">{message}</p> : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-5">
      <p className="font-display text-[11px] tracking-[0.18em] text-white/50 uppercase">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl tracking-[0.06em] text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-white/50">{hint}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles = {
    paid: "bg-emerald-500/15 text-emerald-300",
    processing: "bg-amber-500/15 text-amber-300",
    shipped: "bg-sky-500/15 text-sky-300",
    delivered: "bg-white/10 text-white",
    cancelled: "bg-red-500/15 text-red-300",
  } as const;

  return (
    <span
      className={`inline-flex px-2 py-1 font-display text-[10px] tracking-[0.16em] uppercase ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [integrations, setIntegrations] = useState<{
    ordersBackend: string;
    cmsBackend: string;
    supabase: {
      hasUrl: boolean;
      hasPublishableKey: boolean;
      hasSecretKey: boolean;
      ready: boolean;
    };
  } | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/dashboard");
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        setError("Unable to load dashboard.");
        setLoading(false);
        return;
      }
      const data = (await response.json()) as {
        stats: AdminDashboardStats;
        integrations?: {
          ordersBackend: string;
          cmsBackend: string;
          supabase: {
            hasUrl: boolean;
            hasPublishableKey: boolean;
            hasSecretKey: boolean;
            ready: boolean;
          };
        };
      };
      setStats(data.stats);
      setIntegrations(data.integrations ?? null);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <AdminShell title="Dashboard">
        <p className="text-white/60">Loading dashboard...</p>
      </AdminShell>
    );
  }

  if (!stats) {
    return (
      <AdminShell title="Dashboard">
        <p className="text-red-400">{error || "Dashboard unavailable."}</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-white/60">
          Store overview — orders, revenue, and inventory alerts.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/orders">View All Orders</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={String(stats.totalOrders)} />
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
        <StatCard label="Orders Today" value={String(stats.ordersToday)} />
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(stats.revenueThisMonth)}
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminPanel title="Order Status">
          <div className="space-y-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <StatusBadge status={status as Order["status"]} />
                <span className="text-white/70">{count}</span>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Low Stock">
          {stats.lowStock.length ? (
            <div className="space-y-3">
              {stats.lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-display text-sm tracking-[0.08em] uppercase">
                      {product.name}
                    </p>
                    <p className="text-xs text-white/50">{product.wood}</p>
                  </div>
                  <span className="font-display text-sm text-rax-ember">
                    {product.inventory} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50">All products are well stocked.</p>
          )}
        </AdminPanel>

        <AdminPanel title="Integrations">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/70">CMS storage</span>
              <span className="font-display text-xs tracking-[0.14em] uppercase text-white">
                {integrations?.cmsBackend ?? "unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/70">Orders storage</span>
              <span className="font-display text-xs tracking-[0.14em] uppercase text-white">
                {integrations?.ordersBackend ?? "unknown"}
              </span>
            </div>
            <div className="rounded-md border border-white/10 p-3 text-white/60">
              <p className="font-display text-[10px] tracking-[0.16em] text-white/50 uppercase">
                Supabase
              </p>
              <p className="mt-2 text-xs">
                {integrations?.supabase.ready
                  ? "Connected — CMS, orders, and image uploads are live."
                  : "Not connected — check env vars in Vercel and redeploy."}
              </p>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Quick Actions">
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/orders">Manage Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/products">Edit Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/site">Edit Site</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/settings">Settings & Email</Link>
            </Button>
            <TestEmailButton />
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title="Recent Orders">
        {stats.recentOrders.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-white/50">
                <tr>
                  <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                    Order
                  </th>
                  <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                    Customer
                  </th>
                  <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                    Total
                  </th>
                  <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                    Status
                  </th>
                  <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5">
                    <td className="px-3 py-4 font-display tracking-[0.08em] text-rax-ember uppercase">
                      {order.orderNumber}
                    </td>
                    <td className="px-3 py-4">
                      <p>{order.customerName ?? "Customer"}</p>
                      <p className="text-xs text-white/50">{order.customerEmail}</p>
                    </td>
                    <td className="px-3 py-4">{formatCurrency(order.total)}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-4 text-white/50">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-white/50">
            No orders yet. Completed Stripe checkouts will appear here.
          </p>
        )}
      </AdminPanel>
    </AdminShell>
  );
}
