import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total, currency, customerEmail, customerName, paymentMethod } = body;

    if (!items || !total || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const mutation = {
      id: crypto.randomUUID(),
      type: "order",
      data: {
        order: {
          id: crypto.randomUUID(),
          orderNumber: `SF-${Date.now()}`,
          status: "pending",
          items: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: total,
          tax: 0,
          shipping: 0,
          total,
          currency: currency || "USD",
          customerEmail: customerEmail || "",
          customerName: customerName || "",
          paymentMethod,
          paymentStatus: "pending",
          source: "storefront",
          createdAt: new Date().toISOString(),
        },
        inventoryChanges: items.map((item: any) => ({
          productId: item.productId,
          quantityDelta: -item.quantity,
        })),
      },
      timestamp: Date.now(),
      source: "storefront",
    };

    const mutationsApi = process.env.MUTATIONS_API_URL;
    if (mutationsApi) {
      const res = await fetch(mutationsApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mutation),
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to submit order" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, orderId: mutation.data.order.id });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
