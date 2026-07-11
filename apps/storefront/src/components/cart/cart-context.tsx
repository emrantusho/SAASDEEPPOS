"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { submitOrder } from "@/lib/store-api";

interface CartItem {
  productId: number;
  title: string;
  quantity: number;
  price: number;
  image: string | null;
  id: string;
}

interface CartContextValue {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  checkout: (data: {
    paymentMethod: string;
    customerName?: string;
    customerPhone?: string;
    currency?: string;
    orderType?: string;
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
  }) => Promise<{ success: boolean; orderId?: number }>;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "storefront_cart";

export function CartProvider({ children, currency = "BDT" }: { children: ReactNode; currency?: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: `${item.productId}-${Date.now()}` }];
    });
    toast.success("Added to cart");
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

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const checkout = useCallback(async (data: {
    paymentMethod: string;
    customerName?: string;
    customerPhone?: string;
    currency?: string;
    orderType?: string;
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
  }) => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return { success: false };
    }

    const result = await submitOrder({
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
      total: cart.reduce((s, i) => s + i.price * i.quantity, 0) / 100,
      currency: data.currency || currency,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      paymentMethod: data.paymentMethod,
      orderType: data.orderType,
      tableNumber: data.tableNumber,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes,
    });

    if (result.success) {
      setCart([]);
      toast.success("Order placed successfully!");
      return { success: true, orderId: result.orderId };
    } else {
      toast.error(result.error || "Checkout failed");
      return { success: false };
    }
  }, [cart, currency]);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount, total, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
