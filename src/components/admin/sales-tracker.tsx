"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import type { SalesStats } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/utils";

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

export function SalesAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sales, setSales] = useState<SalesStats | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  async function loadSales() {
    const response = await fetch("/api/admin/sales");
    if (response.status === 401) {
      router.push("/admin");
      return;
    }
    if (!response.ok) {
      setError("Unable to load sales data.");
      return;
    }

    const data = (await response.json()) as {
      sales: SalesStats;
      stripeConfigured: boolean;
    };
    setSales(data.sales);
    setStripeConfigured(data.stripeConfigured);
    setError("");
  }

  useEffect(() => {
    loadSales().finally(() => setLoading(false));
  }, [router]);

  async function syncStripe() {
    setSyncing(true);
    setSyncMessage("");
    const response = await fetch("/api/admin/stripe/sync", { method: "POST" });
    setSyncing(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setSyncMessage(body.error || "Stripe sync failed.");
      return;
    }

    const body = (await response.json()) as {
      productsSynced: number;
      couponsSynced: number;
      errors?: string[];
    };

    setSyncMessage(
      body.errors?.length
        ? `Synced ${body.productsSynced} products and ${body.couponsSynced} coupons with warnings.`
        : `Synced ${body.productsSynced} products and ${body.couponsSynced} coupons to Stripe.`
    );
    await loadSales();
  }

  if (loading) {
    return (
      <AdminShell title="Sales Tracker">
        <p className="text-white/60">Loading sales...</p>
      </AdminShell>
    );
  }

  if (!sales) {
    return (
      <AdminShell title="Sales Tracker">
        <p className="text-red-400">{error || "Sales data unavailable."}</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Sales Tracker">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-sm text-white/60">
          Revenue and units sold by product, plus coupon performance tied to each promo code used
          at checkout. Products and coupons sync to Stripe when you save in admin or use Sync Now.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/coupons">Manage Coupons</Link>
          </Button>
          {stripeConfigured ? (
            <Button size="sm" onClick={syncStripe} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync to Stripe"}
            </Button>
          ) : null}
        </div>
      </div>

      {syncMessage ? <p className="mb-6 text-sm text-white/70">{syncMessage}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Revenue" value={formatCurrency(sales.totalRevenue)} />
        <StatCard
          label="Coupon Orders"
          value={String(sales.ordersWithCoupons)}
          hint="Paid orders using a promo code"
        />
        <StatCard
          label="Discounts Given"
          value={formatCurrency(sales.totalDiscountGiven)}
          hint="Total promo savings"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Sales by Coupon">
          {sales.couponSales.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-white/50">
                  <tr>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Code
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Orders
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Revenue
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Discount
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Stripe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.couponSales.map((coupon) => (
                    <tr key={coupon.code} className="border-b border-white/5">
                      <td className="px-3 py-4">
                        <p className="font-mono text-rax-ember">{coupon.code}</p>
                        <p className="text-xs text-white/50">{coupon.label}</p>
                      </td>
                      <td className="px-3 py-4">{coupon.orderCount}</td>
                      <td className="px-3 py-4">{formatCurrency(coupon.revenue)}</td>
                      <td className="px-3 py-4">{formatCurrency(coupon.discountTotal)}</td>
                      <td className="px-3 py-4 text-xs text-white/60">
                        {coupon.stripeSynced ? "Synced" : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/50">
              No coupons configured yet. Add promo codes to track takeaway sales.
            </p>
          )}
        </AdminPanel>

        <AdminPanel title="Sales by Product">
          {sales.productSales.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-white/50">
                  <tr>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Product
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Units
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Revenue
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Stripe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.productSales.map((product) => (
                    <tr key={product.productId} className="border-b border-white/5">
                      <td className="px-3 py-4">
                        <p className="font-display tracking-[0.08em] uppercase">{product.name}</p>
                        <p className="text-xs text-white/50">{product.wood}</p>
                      </td>
                      <td className="px-3 py-4">{product.unitsSold}</td>
                      <td className="px-3 py-4">{formatCurrency(product.revenue)}</td>
                      <td className="px-3 py-4 text-xs text-white/60">
                        {product.stripeSynced ? "Synced" : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/50">
              No product sales yet. Completed checkouts will appear here.
            </p>
          )}
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
