import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { sendShippingNotificationEmail } from "@/lib/email/send";
import { getOrderById, getOrders, updateOrder } from "@/lib/orders/store";
import type { OrderStatus, OrderUpdateInput } from "@/lib/orders/types";

export async function GET(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = new URL(request.url).searchParams.get("status") as OrderStatus | "all" | null;
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";

  let orders = await getOrders();

  if (status && status !== "all") {
    orders = orders.filter((order) => order.status === status);
  }

  if (query) {
    orders = orders.filter((order) =>
      [
        order.orderNumber,
        order.customerEmail,
        order.customerName ?? "",
        order.stripeSessionId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as OrderUpdateInput & { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const previous = await getOrderById(body.id);
    if (!previous) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await updateOrder(body.id, {
      status: body.status,
      trackingNumber: body.trackingNumber,
      adminNotes: body.adminNotes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (previous.status !== "shipped" && updated.status === "shipped") {
      try {
        await sendShippingNotificationEmail(updated);
      } catch (error) {
        console.error("Shipping email failed:", error);
      }
    }

    const refreshed = (await getOrderById(body.id)) ?? updated;

    return NextResponse.json({ order: refreshed });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const order = await getOrderById(body.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
