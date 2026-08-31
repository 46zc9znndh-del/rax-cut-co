export type OrderStatus =
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

export type OrderLineItem = {
  productId: string;
  slug: string;
  name: string;
  wood: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  status: OrderStatus;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: ShippingAddress;
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  trackingNumber?: string;
  adminNotes?: string;
  confirmationEmailSentAt?: string;
  adminEmailSentAt?: string;
  shippedEmailSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrdersData = {
  version: number;
  updatedAt: string;
  nextOrderNumber: number;
  orders: Order[];
};

export type OrderUpdateInput = {
  status?: OrderStatus;
  trackingNumber?: string;
  adminNotes?: string;
};

export type AdminDashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueThisMonth: number;
  statusCounts: Record<OrderStatus, number>;
  recentOrders: Order[];
  lowStock: Array<{
    id: string;
    name: string;
    wood: string;
    inventory: number;
  }>;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
