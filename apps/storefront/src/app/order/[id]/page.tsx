import { getOrder } from "@/lib/store-api";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, CookingPot, Truck } from "lucide-react";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  pending: Clock,
  confirmed: Clock,
  preparing: CookingPot,
  ready: CheckCircle,
  completed: CheckCircle,
  delivered: Truck,
  cancelled: Clock,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Received",
  confirmed: "Confirmed",
  preparing: "Being Prepared",
  ready: "Ready",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) notFound();

  let order: any;
  try {
    order = await getOrder(numericId);
  } catch {
    notFound();
  }

  if (!order) notFound();

  const StatusIcon = STATUS_ICONS[order.status] || Clock;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="text-center mb-8">
        <StatusIcon className="h-12 w-12 mx-auto text-primary mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Order #{order.id}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Placed at {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Status</span>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            order.status === "cancelled" ? "bg-destructive/10 text-destructive" :
            order.status === "completed" || order.status === "delivered" ? "bg-green-100 text-green-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            <StatusIcon className="h-3 w-3" />
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        {order.order_type && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Order Type</span>
            <span className="text-sm font-medium capitalize">{order.order_type}</span>
          </div>
        )}

        {order.table_number && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Table</span>
            <span className="text-sm font-medium">{order.table_number}</span>
          </div>
        )}

        {order.delivery_address && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Delivery Address</span>
            <span className="text-sm font-medium text-right max-w-[200px]">{order.delivery_address}</span>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.product_image && (
                <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                  <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatPrice(item.price * item.quantity, "BDT")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(order.total_amount, "BDT")}
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/search"
          className="text-sm text-primary hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
