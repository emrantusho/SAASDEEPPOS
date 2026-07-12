import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, userId } = body;

    if (!orderId || !status || !userId) {
      return NextResponse.json({ error: "orderId, status, and userId are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(and(eq(orders.id, orderId), eq(orders.user_uid, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("Order status update failed:", err);
    return NextResponse.json(
      { error: "Failed to update order status", details: (err as Error).message },
      { status: 500 }
    );
  }
}
