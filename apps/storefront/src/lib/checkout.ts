import type { OrderSubmitData } from "@saasdeep/shared";

const MUTATIONS_API = process.env.NEXT_PUBLIC_MUTATIONS_API ?? "/api/mutations";

export async function submitOrderAndSync(order: OrderSubmitData): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const mutation = {
      id: crypto.randomUUID(),
      type: "order",
      data: {
        order: {
          id: crypto.randomUUID(),
          orderNumber: `SF-${Date.now()}`,
          status: "pending",
          items: order.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: order.total,
          tax: 0,
          shipping: 0,
          total: order.total,
          currency: order.currency,
          customerEmail: order.customerEmail || "",
          customerName: order.customerName || "",
          paymentMethod: order.paymentMethod,
          paymentStatus: "pending",
          source: "storefront",
          createdAt: new Date().toISOString(),
        },
        inventoryChanges: order.items.map((item) => ({
          productId: item.productId,
          quantityDelta: -item.quantity,
        })),
      },
      timestamp: Date.now(),
      source: "storefront",
    };

    const res = await fetch(MUTATIONS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mutation),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }

    return { success: true, orderId: mutation.data.order.id };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
