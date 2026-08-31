import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminDashboardStats,
  Order,
  OrderLineItem,
  OrderStatus,
  OrderUpdateInput,
  ShippingAddress,
} from "./types";

type OrderRow = {
  id: string;
  order_number: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress | null;
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  tracking_number: string | null;
  admin_notes: string | null;
  confirmation_email_sent_at: string | null;
  admin_email_sent_at: string | null;
  shipped_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
    status: row.status,
    customerEmail: row.customer_email,
    customerName: row.customer_name ?? undefined,
    customerPhone: row.customer_phone ?? undefined,
    shippingAddress: row.shipping_address ?? undefined,
    items: row.items,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    currency: row.currency,
    trackingNumber: row.tracking_number ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    confirmationEmailSentAt: row.confirmation_email_sent_at ?? undefined,
    adminEmailSentAt: row.admin_email_sent_at ?? undefined,
    shippedEmailSentAt: row.shipped_email_sent_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function orderToRow(order: Order): OrderRow {
  return {
    id: order.id,
    order_number: order.orderNumber,
    stripe_session_id: order.stripeSessionId,
    stripe_payment_intent_id: order.stripePaymentIntentId ?? null,
    status: order.status,
    customer_email: order.customerEmail,
    customer_name: order.customerName ?? null,
    customer_phone: order.customerPhone ?? null,
    shipping_address: order.shippingAddress ?? null,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    currency: order.currency,
    tracking_number: order.trackingNumber ?? null,
    admin_notes: order.adminNotes ?? null,
    confirmation_email_sent_at: order.confirmationEmailSentAt ?? null,
    admin_email_sent_at: order.adminEmailSentAt ?? null,
    shipped_email_sent_at: order.shippedEmailSentAt ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

async function getNextOrderNumber() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_state")
    .select("value")
    .eq("key", "orders")
    .maybeSingle();

  if (error) throw error;

  const nextOrderNumber =
    typeof data?.value?.nextOrderNumber === "number" ? data.value.nextOrderNumber : 1001;

  const { error: updateError } = await supabase.from("app_state").upsert({
    key: "orders",
    value: { nextOrderNumber: nextOrderNumber + 1 },
    updated_at: new Date().toISOString(),
  });

  if (updateError) throw updateError;

  return nextOrderNumber;
}

export async function getOrdersFromSupabase(): Promise<Order[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as OrderRow[]).map(rowToOrder);
}

export async function getOrderByIdFromSupabase(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as OrderRow) : null;
}

export async function getOrderBySessionIdFromSupabase(sessionId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToOrder(data as OrderRow) : null;
}

export async function addOrderToSupabase(
  order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
) {
  const existing = await getOrderBySessionIdFromSupabase(order.stripeSessionId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const nextOrderNumber = await getNextOrderNumber();
  const nextOrder: Order = {
    ...order,
    id: `order_${Date.now()}`,
    orderNumber: `RAX-${nextOrderNumber}`,
    createdAt: now,
    updatedAt: now,
  };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .insert(orderToRow(nextOrder))
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const duplicate = await getOrderBySessionIdFromSupabase(order.stripeSessionId);
      if (duplicate) return duplicate;
    }
    throw error;
  }

  return rowToOrder(data as OrderRow);
}

export async function markOrderEmailSentInSupabase(
  id: string,
  patch: Pick<Order, "confirmationEmailSentAt" | "adminEmailSentAt" | "shippedEmailSentAt">
) {
  const supabase = createSupabaseServerClient();
  const rowPatch: Record<string, string> = { updated_at: new Date().toISOString() };

  if (patch.confirmationEmailSentAt) {
    rowPatch.confirmation_email_sent_at = patch.confirmationEmailSentAt;
  }
  if (patch.adminEmailSentAt) {
    rowPatch.admin_email_sent_at = patch.adminEmailSentAt;
  }
  if (patch.shippedEmailSentAt) {
    rowPatch.shipped_email_sent_at = patch.shippedEmailSentAt;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(rowPatch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToOrder(data as OrderRow) : null;
}

export async function updateOrderInSupabase(id: string, patch: OrderUpdateInput) {
  const supabase = createSupabaseServerClient();
  const rowPatch: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.status !== undefined) rowPatch.status = patch.status;
  if (patch.trackingNumber !== undefined) rowPatch.tracking_number = patch.trackingNumber;
  if (patch.adminNotes !== undefined) rowPatch.admin_notes = patch.adminNotes;

  const { data, error } = await supabase
    .from("orders")
    .update(rowPatch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToOrder(data as OrderRow) : null;
}

export async function getAdminDashboardStatsFromSupabase(
  lowStock: AdminDashboardStats["lowStock"]
): Promise<AdminDashboardStats> {
  const orders = await getOrdersFromSupabase();
  return buildDashboardStats(orders, lowStock);
}

export function buildDashboardStats(
  orders: Order[],
  lowStock: AdminDashboardStats["lowStock"]
): AdminDashboardStats {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const activeOrders = orders.filter((order) => order.status !== "cancelled");

  const statusCounts: Record<OrderStatus, number> = {
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    statusCounts[order.status] += 1;
  }

  return {
    totalOrders: activeOrders.length,
    totalRevenue: activeOrders.reduce((sum, order) => sum + order.total, 0),
    ordersToday: activeOrders.filter((order) => new Date(order.createdAt) >= startOfDay).length,
    revenueThisMonth: activeOrders
      .filter((order) => new Date(order.createdAt) >= startOfMonth)
      .reduce((sum, order) => sum + order.total, 0),
    statusCounts,
    recentOrders: orders.slice(0, 6),
    lowStock,
  };
}
