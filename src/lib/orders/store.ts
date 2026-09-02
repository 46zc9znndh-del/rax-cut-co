import fs from "node:fs";
import path from "node:path";
import "server-only";
import { isSupabaseOrdersEnabled } from "@/lib/supabase/config";
import { getCmsData, saveCmsData } from "@/lib/cms/store";
import { buildSalesStats } from "./sales-stats";
import type {
  AdminDashboardStats,
  Order,
  OrderUpdateInput,
  OrdersData,
} from "./types";
import {
  addOrderToSupabase,
  buildDashboardStats,
  getAdminDashboardStatsFromSupabase,
  getOrderByIdFromSupabase,
  getOrderBySessionIdFromSupabase,
  getOrdersFromSupabase,
  markOrderEmailSentInSupabase,
  updateOrderInSupabase,
} from "./store-supabase";

const ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");
const READ_ONLY_FS = process.env.VERCEL === "1";

let cache: OrdersData | null = null;
let cacheMtime = 0;

function defaultOrdersData(): OrdersData {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    nextOrderNumber: 1001,
    orders: [],
  };
}

function ensureOrdersFile() {
  if (READ_ONLY_FS) return;
  if (!fs.existsSync(ORDERS_PATH)) {
    const initial = defaultOrdersData();
    fs.mkdirSync(path.dirname(ORDERS_PATH), { recursive: true });
    fs.writeFileSync(ORDERS_PATH, `${JSON.stringify(initial, null, 2)}\n`, "utf8");
  }
}

function readOrdersFile(): OrdersData {
  if (READ_ONLY_FS && !fs.existsSync(ORDERS_PATH)) {
    if (!cache) cache = defaultOrdersData();
    return cache;
  }

  ensureOrdersFile();
  const stat = fs.statSync(ORDERS_PATH);
  if (cache && stat.mtimeMs === cacheMtime) {
    return cache;
  }

  const raw = fs.readFileSync(ORDERS_PATH, "utf8");
  cache = JSON.parse(raw) as OrdersData;
  cacheMtime = stat.mtimeMs;
  return cache;
}

function writeOrdersFile(data: OrdersData): OrdersData {
  const next: OrdersData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (READ_ONLY_FS) {
    cache = next;
    return next;
  }

  fs.mkdirSync(path.dirname(ORDERS_PATH), { recursive: true });
  fs.writeFileSync(ORDERS_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  cache = next;
  cacheMtime = fs.statSync(ORDERS_PATH).mtimeMs;
  return next;
}

function getLowStockProducts() {
  return getCmsData().then((cms) => {
    const threshold = cms.site.storeSettings.lowStockThreshold;
    return cms.products
      .filter((product) => product.inventory > 0 && product.inventory < threshold)
      .map((product) => ({
        id: product.id,
        name: product.name,
        wood: product.wood,
        inventory: product.inventory,
      }))
      .sort((a, b) => a.inventory - b.inventory);
  });
}

async function applyInventoryForOrder(order: Order) {
  const cms = await getCmsData();
  let changed = false;

  for (const item of order.items) {
    const product = cms.products.find((entry) => entry.id === item.productId);
    if (!product) continue;

    product.inventory = Math.max(0, product.inventory - item.quantity);
    if (product.inventory === 0) {
      product.inStock = false;
    }
    changed = true;
  }

  if (changed) {
    await saveCmsData(cms);
  }
}

async function addOrderToFile(order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) {
  const data = readOrdersFile();
  const existing = data.orders.find((entry) => entry.stripeSessionId === order.stripeSessionId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const nextOrder: Order = {
    ...order,
    id: `order_${Date.now()}`,
    orderNumber: `RAX-${data.nextOrderNumber}`,
    createdAt: now,
    updatedAt: now,
  };

  const nextData: OrdersData = {
    ...data,
    nextOrderNumber: data.nextOrderNumber + 1,
    orders: [nextOrder, ...data.orders],
  };

  writeOrdersFile(nextData);
  await applyInventoryForOrder(nextOrder);
  return nextOrder;
}

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseOrdersEnabled()) {
    return getOrdersFromSupabase();
  }

  return [...readOrdersFile().orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getOrderById(id: string) {
  if (isSupabaseOrdersEnabled()) {
    return getOrderByIdFromSupabase(id);
  }

  return readOrdersFile().orders.find((order) => order.id === id) ?? null;
}

export async function getOrderBySessionId(sessionId: string) {
  if (isSupabaseOrdersEnabled()) {
    return getOrderBySessionIdFromSupabase(sessionId);
  }

  return readOrdersFile().orders.find((order) => order.stripeSessionId === sessionId) ?? null;
}

export async function addOrder(
  order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
) {
  if (isSupabaseOrdersEnabled()) {
    const nextOrder = await addOrderToSupabase(order);
    await applyInventoryForOrder(nextOrder);
    return nextOrder;
  }

  return addOrderToFile(order);
}

export async function markOrderEmailSent(
  id: string,
  patch: Pick<Order, "confirmationEmailSentAt" | "adminEmailSentAt" | "shippedEmailSentAt">
) {
  if (isSupabaseOrdersEnabled()) {
    return markOrderEmailSentInSupabase(id, patch);
  }

  const data = readOrdersFile();
  const index = data.orders.findIndex((order) => order.id === id);
  if (index === -1) return null;

  const orders = [...data.orders];
  orders[index] = {
    ...orders[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeOrdersFile({ ...data, orders });
  return orders[index];
}

export async function updateOrder(id: string, patch: OrderUpdateInput) {
  if (isSupabaseOrdersEnabled()) {
    return updateOrderInSupabase(id, patch);
  }

  const data = readOrdersFile();
  const index = data.orders.findIndex((order) => order.id === id);
  if (index === -1) {
    return null;
  }

  const current = data.orders[index];
  const orders = [...data.orders];
  orders[index] = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeOrdersFile({ ...data, orders });
  return orders[index];
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const cms = await getCmsData();
  const lowStock = await getLowStockProducts();
  const products = cms.products;
  const coupons = cms.site.storeSettings.coupons ?? [];

  if (isSupabaseOrdersEnabled()) {
    return getAdminDashboardStatsFromSupabase(lowStock, products, coupons);
  }

  const orders = await getOrders();
  return buildDashboardStats(orders, lowStock, products, coupons);
}

export async function getSalesStats() {
  const cms = await getCmsData();
  const orders = await getOrders();
  return buildSalesStats(orders, cms.products, cms.site.storeSettings.coupons ?? []);
}

export function getOrdersBackendLabel() {
  return isSupabaseOrdersEnabled() ? "supabase" : READ_ONLY_FS ? "memory" : "file";
}
