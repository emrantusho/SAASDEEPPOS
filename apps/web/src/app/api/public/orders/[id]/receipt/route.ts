import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, transactions, paymentMethods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.order_id, numericId),
    with: {
      paymentMethod: { columns: { name: true } },
    },
  });

  const items = order.orderItems.map((oi) => ({
    name: oi.product?.name || "Unknown",
    quantity: oi.quantity,
    price: oi.price,
    subtotal: oi.price * oi.quantity,
  }));

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const discount = order.discount_amount || 0;
  const total = subtotal - discount;
  const paymentMethod = tx?.paymentMethod?.name || "N/A";
  const qrData = `https://saasdeep-pos.vercel.app/api/public/orders/${order.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt #${order.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    .receipt {
      max-width: 400px;
      width: 100%;
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 20px; margin-bottom: 4px; }
    .header p { font-size: 13px; color: #666; }
    .divider { border: none; border-top: 1px dashed #ddd; margin: 16px 0; }
    .order-info { font-size: 13px; color: #666; }
    .order-info strong { color: #1a1a1a; }
    .items { margin: 16px 0; }
    .item { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
    .item-name { flex: 1; }
    .item-qty { color: #666; margin: 0 8px; }
    .item-price { font-weight: 500; }
    .totals { border-top: 1px solid #ddd; padding-top: 12px; margin-top: 12px; }
    .total-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
    .grand-total { font-size: 18px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 8px; margin-top: 8px; }
    .payment { text-align: center; font-size: 13px; color: #666; margin-top: 16px; }
    .qr { text-align: center; margin-top: 16px; }
    .qr img { width: 120px; height: 120px; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 16px; }
    @media print {
      body { background: #fff; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>Receipt</h1>
      <p>Order #${order.id}</p>
    </div>

    <hr class="divider">

    <div class="order-info">
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Date:</strong> ${new Date(order.created_at || "").toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
      ${order.customer_name ? `<p><strong>Customer:</strong> ${order.customer_name}</p>` : ""}
      ${order.customer_phone ? `<p><strong>Phone:</strong> ${order.customer_phone}</p>` : ""}
      ${order.order_type ? `<p><strong>Type:</strong> ${order.order_type}</p>` : ""}
      ${order.table_number ? `<p><strong>Table:</strong> ${order.table_number}</p>` : ""}
      ${order.delivery_address ? `<p><strong>Address:</strong> ${order.delivery_address}</p>` : ""}
    </div>

    <hr class="divider">

    <div class="items">
      ${items.map((item) => `
        <div class="item">
          <span class="item-name">${item.name}</span>
          <span class="item-qty">x${item.quantity}</span>
          <span class="item-price">৳${(item.subtotal / 100).toFixed(2)}</span>
        </div>
      `).join("")}
    </div>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>৳${(subtotal / 100).toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
        <div class="total-row">
          <span>Discount</span>
          <span>-৳${(discount / 100).toFixed(2)}</span>
        </div>
      ` : ""}
      <div class="total-row grand-total">
        <span>Total</span>
        <span>৳${(total / 100).toFixed(2)}</span>
      </div>
    </div>

    <div class="payment">
      <p>Payment: ${paymentMethod}</p>
    </div>

    <div class="qr">
      <img src="${qrUrl}" alt="Order QR">
    </div>

    <hr class="divider">

    <div class="footer">
      <p>Thank you for your order!</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
