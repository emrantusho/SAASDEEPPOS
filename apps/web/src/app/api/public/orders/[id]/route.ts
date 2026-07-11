import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, numericId),
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

  return NextResponse.json({
    id: order.id,
    status: order.status,
    total_amount: order.total_amount,
    order_type: order.order_type,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    table_number: order.table_number,
    delivery_address: order.delivery_address,
    notes: order.notes,
    created_at: order.created_at,
    items: order.orderItems.map((oi) => ({
      id: oi.id,
      product_id: oi.product_id,
      product_name: oi.product?.name || "Unknown",
      product_image: oi.product?.images?.[0] || null,
      quantity: oi.quantity,
      price: oi.price,
    })),
  });
}
