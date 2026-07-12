import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, transactions, paymentMethods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        orderItems: {
          with: {
            product: { columns: { name: true, images: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const tx = await db.query.transactions.findFirst({
      where: eq(transactions.order_id, orderId),
      with: {
        paymentMethod: { columns: { name: true } },
      },
    });

    const receipt = {
      order: {
        id: order.id,
        status: order.status,
        order_type: order.order_type,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        table_number: order.table_number,
        delivery_address: order.delivery_address,
        notes: order.notes,
        created_at: order.created_at,
      },
      items: order.orderItems.map((oi) => ({
        id: oi.id,
        product_name: oi.product?.name || "Unknown",
        product_image: oi.product?.images?.[0] || null,
        quantity: oi.quantity,
        price: oi.price,
        subtotal: oi.price * oi.quantity,
      })),
      totals: {
        subtotal: order.total_amount,
        discount: order.discount_amount || 0,
        total: order.total_amount - (order.discount_amount || 0),
      },
      payment: tx
        ? {
            method: tx.paymentMethod?.name || null,
            amount: tx.amount,
            status: tx.status,
          }
        : null,
    };

    return NextResponse.json(receipt);
  } catch (err) {
    console.error("Receipt generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate receipt", details: (err as Error).message },
      { status: 500 }
    );
  }
}
