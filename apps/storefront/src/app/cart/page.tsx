"use client";

import { useCart } from "@/components/cart/cart-context";
import { useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { submitOrderAndSync } from "@/lib/checkout";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutMethod, setCheckoutMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const result = await submitOrderAndSync({
        items: cart,
        total,
        currency: "USD",
        paymentMethod: checkoutMethod,
      });
      if (result.success) {
        clearCart();
        toast.success("Order placed successfully!");
      } else {
        toast.error(result.error || "Checkout failed");
      }
    } catch (err) {
      toast.error("Checkout failed: " + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started.</p>
        <Link
          href="/search"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-foreground">
          Clear All
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
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.price)}
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
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}
          </span>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-foreground block mb-2">Payment Method</label>
          <select
            value={checkoutMethod}
            onChange={(e) => setCheckoutMethod(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="cash">Cash on Delivery</option>
            <option value="stripe">Credit/Debit Card (Stripe)</option>
            <option value="transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {processing ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
