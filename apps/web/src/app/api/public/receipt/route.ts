import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendOrderConfirmation } from "@/lib/whatsapp";
import { getSmsProvider } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { orderId, method } = await request.json();

    if (!orderId || !method) {
      return NextResponse.json(
        { error: "orderId and method (email|whatsapp|sms) are required" },
        { status: 400 }
      );
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        orderItems: {
          with: {
            product: { columns: { name: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = order.orderItems.map((oi) => ({
      name: oi.product?.name || "Unknown",
      quantity: oi.quantity,
      price: oi.price,
    }));

    const customer = order.customer_id
      ? await db.query.customers.findFirst({
          where: eq(customers.id, order.customer_id),
        })
      : null;

    switch (method) {
      case "whatsapp": {
        const phone = order.customer_phone || customer?.phone;
        if (!phone) {
          return NextResponse.json(
            { error: "No phone number for WhatsApp" },
            { status: 400 }
          );
        }
        await sendOrderConfirmation(phone, order.id, items, order.total_amount);
        break;
      }

      case "sms": {
        const phone = order.customer_phone || customer?.phone;
        if (!phone) {
          return NextResponse.json(
            { error: "No phone number for SMS" },
            { status: 400 }
          );
        }
        const sms = getSmsProvider();
        const itemSummary = items
          .slice(0, 3)
          .map((i) => `${i.name} x${i.quantity}`)
          .join(", ");
        const message = `SaasDeep - Order #${order.id} confirmed!\nItems: ${itemSummary}\nTotal: ৳${(order.total_amount / 100).toFixed(2)}`;
        await sms.send(phone, message);
        break;
      }

      case "email": {
        console.log(`[EMAIL] Receipt for order #${order.id} would be sent to customer`);
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }

    return NextResponse.json({ success: true, method, orderId: order.id });
  } catch (err) {
    console.error("Receipt send failed:", err);
    return NextResponse.json(
      { error: "Failed to send receipt", details: (err as Error).message },
      { status: 500 }
    );
  }
}
