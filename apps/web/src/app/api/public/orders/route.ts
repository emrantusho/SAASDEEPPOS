import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, transactions, paymentMethods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
  stripe: "Stripe",
  paypal: "PayPal",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total, currency, customerName, customerPhone, customerEmail, paymentMethod, orderType, tableNumber, deliveryAddress, notes, userId } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "userId and items are required" }, { status: 400 });
    }

    const paymentMethodName = PAYMENT_METHOD_MAP[paymentMethod] || paymentMethod;

    const pm = await db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.name, paymentMethodName),
    });

    const paymentMethodId = pm?.id || 1;

    const result = await db.transaction(async (tx) => {
      const totalCents = Math.round(total * 100);

      const [order] = await tx
        .insert(orders)
        .values({
          total_amount: totalCents,
          user_uid: userId,
          status: "pending",
          order_type: orderType || "delivery",
          customer_phone: customerPhone || null,
          customer_name: customerName || null,
          table_number: tableNumber || null,
          delivery_address: deliveryAddress || null,
          notes: notes || null,
        })
        .returning();

      await tx.insert(orderItems).values(
        items.map((item: { productId: number; quantity: number; price: number }) => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: Math.round(item.price * 100),
        }))
      );

      await tx.insert(transactions).values({
        order_id: order.id,
        payment_method_id: paymentMethodId,
        amount: totalCents,
        user_uid: userId,
        type: "income",
        category: "selling",
        status: paymentMethod === "cash" ? "completed" : "pending",
        description: `Storefront order #${order.id}`,
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      orderId: result.id,
      status: result.status,
    });
  } catch (err) {
    console.error("Public order creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create order", details: (err as Error).message },
      { status: 500 }
    );
  }
}
