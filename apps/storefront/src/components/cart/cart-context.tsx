"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { OrderLineItem } from "@saasdeep/shared";
import { submitOrderAndSync } from "@/lib/checkout";
import { toast } from "sonner";

interface CartItem extends OrderLineItem {
  id: string;
}

interface CartContextValue {
  cart: CartItem[];
  addItem: (item: OrderLineItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (paymentMethod: string, customerEmail?: string, customerName?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItem = useCallback((item: OrderLineItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: `${item.productId}-${item.variantId || "default"}-${Date.now()}` }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback(async (paymentMethod: string, customerEmail?: string, customerName?: string) => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return false;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const result = await submitOrderAndSync({
      items: cart,
      total,
      currency: "USD",
      customerEmail,
      customerName,
      paymentMethod,
    });

    if (result.success) {
      setCart([]);
      toast.success("Order placed successfully!");
      return true;
    } else {
      toast.error(result.error || "Checkout failed");
      return false;
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
