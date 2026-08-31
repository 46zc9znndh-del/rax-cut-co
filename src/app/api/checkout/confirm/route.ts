import { NextResponse } from "next/server";
import { createOrderFromStripeSession } from "@/lib/orders/sync";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const order = await createOrderFromStripeSession(sessionId);

    if (!order) {
      return NextResponse.json(
        { error: "Payment not completed yet" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        customerEmail: order.customerEmail,
      },
    });
  } catch (error) {
    console.error("Checkout confirm error:", error);
    return NextResponse.json({ error: "Unable to confirm order" }, { status: 500 });
  }
}
