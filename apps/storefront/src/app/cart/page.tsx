"use client";

import { useCart } from "@/components/cart/cart-context";
import { useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useT } from "@/lib/use-locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, itemCount, total, updateQuantity, removeItem, clearCart, checkout } = useCart();
  const t = useT();
  const router = useRouter();
  const [checkoutMethod, setCheckoutMethod] = useState("bkash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderType, setOrderType] = useState("delivery");
  const [processing, setProcessing] = useState(false);
  const [currency, setCurrency] = useState("BDT");

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!customerPhone) {
      toast.error("Please enter your phone number");
      return;
    }
    setProcessing(true);
    try {
      const result = await checkout({
        paymentMethod: checkoutMethod,
        customerName,
        customerPhone,
        orderType,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
      });
      if (result.success && result.orderId) {
        router.push(`/order/${result.orderId}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.cart.empty}</h1>
        <p className="text-muted-foreground mb-6">{t.cart.emptyDesc}</p>
        <Link
          href="/search"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t.cart.browseProducts}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t.cart.title}</h1>
        <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-foreground">
          {t.cart.clearAll}
        </button>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            {item.image && (
              <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
              <p className="text-sm text-primary font-semibold">
                {formatPrice(item.price, currency)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-foreground">{t.cart.total}</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(total, currency)}
          </span>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Phone Number *</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
              <option value="dine-in">Dine In</option>
            </select>
          </div>

          {orderType === "delivery" && (
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Your full address"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">{t.cart.paymentMethod}</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "bkash", label: "bKash" },
                { id: "nagad", label: "Nagad" },
                { id: "cash", label: "Cash" },
                { id: "card", label: "Card" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setCheckoutMethod(method.id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    checkoutMethod === method.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {processing ? t.cart.processing : t.cart.placeOrder}
        </button>
      </div>
    </div>
  );
}
