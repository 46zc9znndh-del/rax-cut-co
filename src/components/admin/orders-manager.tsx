"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminPanel,
  AdminShell,
  FieldLabel,
  SaveBar,
} from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: OrderStatus }) {
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

export function OrdersAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    status: OrderStatus;
    trackingNumber: string;
    adminNotes: string;
  } | null>(null);

  async function loadOrders(nextStatus = statusFilter, nextQuery = query) {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());

    const response = await fetch(`/api/admin/orders?${params.toString()}`);
    if (response.status === 401) {
      router.push("/admin");
      return;
    }
    if (!response.ok) {
      setError("Unable to load orders.");
      return;
    }

    const data = (await response.json()) as { orders: Order[] };
    setOrders(data.orders);
    setError("");
  }

  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, [router]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? null,
    [orders, selectedId]
  );

  useEffect(() => {
    if (!selectedOrder) {
      setDraft(null);
      return;
    }

    setDraft({
      status: selectedOrder.status,
      trackingNumber: selectedOrder.trackingNumber ?? "",
      adminNotes: selectedOrder.adminNotes ?? "",
    });
  }, [selectedOrder]);

  async function handleSave() {
    if (!selectedOrder || !draft) return;

    setSaving(true);
    setError("");

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedOrder.id,
        status: draft.status,
        trackingNumber: draft.trackingNumber,
        adminNotes: draft.adminNotes,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "Save failed.");
      return;
    }

    const data = (await response.json()) as { order: Order };
    setOrders((current) =>
      current.map((order) => (order.id === data.order.id ? data.order : order))
    );
    setSavedAt(new Date().toLocaleTimeString());
  }

  if (loading) {
    return (
      <AdminShell title="Orders">
        <p className="text-white/60">Loading orders...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Orders">
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search order #, email, or customer"
          className="border-white/20 bg-black text-white"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", ...ORDER_STATUSES] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                loadOrders(status, query);
              }}
              className={cn(
                "border px-3 py-2 font-display text-[10px] tracking-[0.16em] uppercase",
                statusFilter === status
                  ? "border-rax-ember bg-rax-ember text-white"
                  : "border-white/15 text-white/60 hover:border-white/30"
              )}
            >
              {status}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders(statusFilter, query)}
          >
            Search
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AdminPanel title={`Order History (${orders.length})`}>
          {orders.length ? (
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
                      Items
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Total
                    </th>
                    <th className="px-3 py-3 font-display text-[10px] tracking-[0.16em] uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelectedId(order.id);
                        setSavedAt(null);
                      }}
                      className={cn(
                        "cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5",
                        selectedId === order.id && "bg-white/5"
                      )}
                    >
                      <td className="px-3 py-4">
                        <p className="font-display tracking-[0.08em] text-rax-ember uppercase">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-white/40">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p>{order.customerName ?? "Customer"}</p>
                        <p className="text-xs text-white/50">{order.customerEmail}</p>
                      </td>
                      <td className="px-3 py-4 text-white/70">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-3 py-4">{formatCurrency(order.total)}</td>
                      <td className="px-3 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/50">
              No orders found. Orders are recorded when Stripe checkout completes.
            </p>
          )}
        </AdminPanel>

        <AdminPanel title={selectedOrder ? selectedOrder.orderNumber : "Order Detail"}>
          {selectedOrder && draft ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/50">Customer</p>
                <p className="mt-1">{selectedOrder.customerName ?? "Customer"}</p>
                <p className="text-sm text-white/60">{selectedOrder.customerEmail}</p>
                {selectedOrder.customerPhone ? (
                  <p className="text-sm text-white/60">{selectedOrder.customerPhone}</p>
                ) : null}
              </div>

              {selectedOrder.shippingAddress ? (
                <div>
                  <p className="text-xs text-white/50">Shipping Address</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">
                    {selectedOrder.shippingAddress.line1}
                    {selectedOrder.shippingAddress.line2
                      ? `, ${selectedOrder.shippingAddress.line2}`
                      : ""}
                    <br />
                    {selectedOrder.shippingAddress.city}
                    {selectedOrder.shippingAddress.state
                      ? `, ${selectedOrder.shippingAddress.state}`
                      : ""}{" "}
                    {selectedOrder.shippingAddress.postalCode}
                    <br />
                    {selectedOrder.shippingAddress.country}
                  </p>
                </div>
              ) : null}

              <div>
                <p className="text-xs text-white/50">Items</p>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.name}`}
                      className="flex items-start justify-between border-b border-white/10 pb-2 text-sm"
                    >
                      <div>
                        <p>{item.name}</p>
                        <p className="text-xs text-white/50">
                          {item.wood} · Qty {item.quantity}
                        </p>
                      </div>
                      <span>{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        selectedOrder.discount
                          ? selectedOrder.subtotal + selectedOrder.discount
                          : selectedOrder.subtotal
                      )}
                    </span>
                  </div>
                  {selectedOrder.discount && selectedOrder.couponCode ? (
                    <div className="flex justify-between text-rax-ember">
                      <span>Promo ({selectedOrder.couponCode})</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span>{formatCurrency(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between font-display tracking-[0.08em] uppercase">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({ ...draft, status: event.target.value as OrderStatus })
                  }
                  className="h-10 w-full rounded-md border border-white/20 bg-black px-3 text-white"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Tracking Number</FieldLabel>
                <Input
                  value={draft.trackingNumber}
                  onChange={(event) =>
                    setDraft({ ...draft, trackingNumber: event.target.value })
                  }
                  placeholder="UPS / USPS tracking"
                  className="border-white/20 bg-black text-white"
                />
              </div>

              <div>
                <FieldLabel>Admin Notes</FieldLabel>
                <textarea
                  value={draft.adminNotes}
                  onChange={(event) =>
                    setDraft({ ...draft, adminNotes: event.target.value })
                  }
                  rows={4}
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
                />
              </div>

              <p className="break-all text-xs text-white/40">
                Stripe session: {selectedOrder.stripeSessionId}
              </p>

              <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-xs text-white/60">
                <p className="font-display tracking-[0.14em] text-white/80 uppercase">
                  Email Status
                </p>
                <ul className="mt-3 space-y-2">
                  <li>
                    Confirmation:{" "}
                    {selectedOrder.confirmationEmailSentAt
                      ? new Date(selectedOrder.confirmationEmailSentAt).toLocaleString()
                      : "Not sent"}
                  </li>
                  <li>
                    Admin alert:{" "}
                    {selectedOrder.adminEmailSentAt
                      ? new Date(selectedOrder.adminEmailSentAt).toLocaleString()
                      : "Not sent"}
                  </li>
                  <li>
                    Shipped notice:{" "}
                    {selectedOrder.shippedEmailSentAt
                      ? new Date(selectedOrder.shippedEmailSentAt).toLocaleString()
                      : "Not sent"}
                  </li>
                </ul>
              </div>

              <SaveBar
                saving={saving}
                savedAt={savedAt}
                error={error}
                onSave={handleSave}
              />
            </div>
          ) : (
            <p className="text-sm text-white/50">
              Select an order to view details, update fulfillment status, or add tracking.
            </p>
          )}
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
